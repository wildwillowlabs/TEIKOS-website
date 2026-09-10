# Retell + TEIKOS playbook

This guide is for people using **Retell** as the voice platform and **TEIKOS** for real booking logic. Go step by step.

**Retell glossary (outside TEIKOS):** [API integration](https://www.retellai.com/glossary/api-integration)

---

## Words you need first

- **Custom function** — In Retell, this is a named HTTP action your agent can trigger. TEIKOS is the server that answers that HTTP call.
- **Integration Public ID** — Shown by TEIKOS when you create an integration. It goes **in the URL path**. It is not your secret.
- **Secret** — Shown once by TEIKOS. Retell uses it to **sign** each request body so TEIKOS knows the request really came from your setup.

---

## Step 1 — Create the integration inside TEIKOS

1. Open TEIKOS → **Integrations** → **Autoprovision**.
2. Choose **Retell** as the provider type.
3. Click **Provision**.
4. Copy **Integration Public ID** immediately.
5. Copy **Secret** immediately (password-like).

If the secret is lost, use **Rotate secret** in TEIKOS and update Retell’s configuration to match.

---

## Step 2 — Build your Retell endpoint URL

Retell will POST to one address. Build it like this:

1. Start with `https://`
2. Your Supabase project host (example shape: `YOUR_PROJECT.supabase.co`)
3. The fixed path `/functions/v1/tool-router/tool/retell/`
4. Your **Integration Public ID** (paste with no spaces)

**Full example shape:**

```
https://YOUR_PROJECT.supabase.co/functions/v1/tool-router/tool/retell/YOUR_INTEGRATION_PUBLIC_ID
```

**What you do in Retell:** When you create a **custom function**, set **method** to **POST** and paste this full URL as the endpoint.

---

## Step 3 — How Retell proves it is allowed to call (no Bearer header needed)

Retell adds a header named **`x-retell-signature`** on every request. The value is a **fingerprint** of the **exact JSON body** using your TEIKOS **Secret**.

**You usually do not type this header yourself** — Retell generates it when you connect your Retell account / API key to the custom function the way Retell’s UI expects.

TEIKOS recomputes the fingerprint and compares. If they match, the request is accepted.

Optional extra safety: some teams allowlist Retell’s IP **`100.20.5.228`** in their own firewall (this is outside TEIKOS).

---

## Step 4 — One Retell “function” per TEIKOS tool

TEIKOS tools have fixed names, for example:

- `business_facts_get`
- `caller_intake`
- `availability_check`
- `appointment_hold`
- `appointment_confirm`
- `appointment_cancel`
- `appointment_reschedule`
- `voice_log_create`

In Retell, create **one custom function** for each tool you need, **or** reuse one endpoint and vary the payload (Retell’s product may prefer one pattern — follow Retell’s UI).

For **each** function, define **parameters** with JSON Schema that matches TEIKOS (see **Tools Reference** in TEIKOS Docs). Example idea for **`appointment_hold`**:

- `service_id` (string, UUID)
- `slot_id` (string — copy from `availability_check` windows; this is the easy path)
- `caller_phone` (string — like `+15551234567`)

---

## Step 5 — What Retell **sends** to TEIKOS (body shape)

TEIKOS expects the JSON body to look like this:

- Top level **`name`** — the tool name string, e.g. `appointment_hold`
- Top level **`args`** — an object with the inputs for that tool

Retell may also include extra fields like call metadata; TEIKOS reads **`name`** and **`args`**.

**Example body:**

```json
{
  "name": "appointment_hold",
  "args": {
    "service_id": "00000000-0000-0000-0000-000000000000",
    "slot_id": "t1.owner-uuid.service-uuid.epoch.signaturehex",
    "caller_phone": "+15551234567"
  }
}
```

The `slot_id` string always starts with `t1.` when TEIKOS created it — copy it **exactly**, like copying a long password.

---

## Step 6 — What TEIKOS **sends back** to Retell

For Retell, TEIKOS returns **one JSON object**: the **canonical envelope** (not wrapped in a `results` array like Vapi).

**Success shape (conceptually):**

```json
{
  "ok": true,
  "data": { ... },
  "error": null,
  "meta": { "v": "v1", "request_id": "...", "now": "...", "idempotent_replay": false }
}
```

**Failure shape:**

```json
{
  "ok": false,
  "data": null,
  "error": { "code": "...", "message": "...", "details": null },
  "meta": { ... }
}
```

Retell may turn this JSON into a **string** before the LLM sees it (and may cap length). Your prompts should tell the model to trust fields like **`ok`** and **`data.windows`** / **`speakable_time`** when present.

---

## Step 7 — Scheduling path in plain English

1. **`business_facts_get`** — Learn **timezone** and each **service_id**.
2. **`caller_intake`** — Pass caller phone in **E.164** (`+country…`).
3. **`availability_check`** — Use **`range_start_date`** and **`range_end_date`** (YYYY-MM-DD, inclusive business days).
4. Read **`data.windows`**. Each window has **`speakable_time`** (for speech) and **`slot_id`** (for holding).
5. **`appointment_hold`** — Same **`service_id`**, exact **`slot_id`**, and **`caller_phone`**.
6. **`appointment_confirm`** — Use **`hold_token`** from the hold **`data`**.

Holds last about **90 seconds**.

**Reschedule:** call **`availability_check`** again, then **`appointment_reschedule`** with **`appointment_id`** and **`new_slot_id`** from a new window.

---

## Retell-specific notes

- Retell may **retry** failed HTTP calls (TEIKOS writes are **idempotent** — safe retries).
- Retell timeouts are often around **two minutes** by default; adjust in Retell if you hit timeouts on cold starts.

---

## If something fails

- **401** — Signature did not match. Confirm the TEIKOS secret in Retell matches the integration; rotate if unsure.
- **400 / No tool calls** — Body missing top-level **`name`**, or **`name`** is empty.
- **Slot errors** — Run **`availability_check`** again; use a fresh **`slot_id`**.

TEIKOS **Docs → Troubleshooting** has more.
