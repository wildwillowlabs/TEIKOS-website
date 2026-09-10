# Vapi + TEIKOS playbook

This guide is for people using **Vapi** as the phone or voice layer and **TEIKOS** as the real scheduling brain. Read one step at a time. If a word looks new, the next line explains it.

**Official Vapi intro (outside TEIKOS):** [Vapi quickstart](https://docs.vapi.ai/quickstart/introduction)

---

## Words you need first

- **Server URL** — The web address Vapi calls when your assistant wants to “use a tool.” TEIKOS gives you that address.
- **Integration Public ID** — A long random-looking id TEIKOS shows when you create an integration. It is **not** a secret; it goes in the URL.
- **Secret** — A password TEIKOS shows **once**. You use it so only your Vapi assistant can call TEIKOS.
- **Tool** — A named action like “check open times” or “hold a slot.” TEIKOS has fixed tool names; your Vapi assistant must use those exact names.

---

## Step 1 — Create the integration inside TEIKOS

1. Log into TEIKOS.
2. Open the page named **Integrations**.
3. Open the tab **Autoprovision**.
4. Set **Provision for** to **Self** (unless an agency is doing this for you).
5. Choose **Vapi** as the provider.
6. Click **Provision**.
7. TEIKOS shows two things — **copy both** right away:
   - **Integration Public ID** (safe to put in a URL)
   - **Secret** (like a password; treat it like a bank PIN)

If you lose the secret, use **Rotate secret** on the Integrations page and update Vapi with the new one.

---

## Step 2 — Build your TEIKOS address (Server URL)

Your Server URL has **four parts** glued together:

1. `https://`
2. Your Supabase project host (looks like `abcdefgh.supabase.co`)
3. `/functions/v1/tool-router/tool/vapi/`
4. Your **Integration Public ID** (paste the id TEIKOS gave you — no extra spaces)

**Example shape** (your host and id will be different):

```
https://YOUR_PROJECT.supabase.co/functions/v1/tool-router/tool/vapi/YOUR_INTEGRATION_PUBLIC_ID
```

In TEIKOS **Docs → Overview**, the app shows the correct beginning of the URL for your project.

**What you do in Vapi:** Find the place where the assistant sets **Server URL** (sometimes under “Server,” “Tools,” or “Custom tools”). Paste your full URL there.

---

## Step 3 — Tell Vapi the secret (so TEIKOS trusts the call)

TEIKOS accepts **either** of these:

**Option A — Bearer header (easiest to picture)**  
Add a header on the Server URL request:

- Header **name:** `Authorization`
- Header **value:** `Bearer ` then paste your **Secret** right after the space (no quotes)

So the value looks like: `Bearer sk_live_...` (your real secret is longer).

**Option B — Signature header**  
If Vapi is set up to send `x-vapi-signature`, TEIKOS checks that signature using the same **Secret**. Use one method; you do not need both.

---

## Step 4 — Teach Vapi the tool names (definitions)

Vapi needs a **list of tools** with:

- The **exact** tool name TEIKOS expects (for example `availability_check`)
- What **arguments** (inputs) each tool accepts

**Easy path:** Copy the file in this repo named `vapi-tools-happy-path.json`. It is a ready-made list you can import or paste into Vapi’s tool editor (depending on how Vapi’s UI works when you read this).

Each tool’s inputs must match the **Tools Reference** in TEIKOS Docs. Important ideas:

- **`business_facts_get`** — Run early so the assistant learns **timezone** and **service_id** values (UUIDs).
- **`availability_check`** — Returns **windows**. Each window has **`slot_id`**, **`speakable_time`** (good for the robot to read aloud), and **`iso_start` / `iso_end`** (machine times).
- **`appointment_hold`** — Best with **`slot_id`** copied from the window the caller picked.
- **`appointment_confirm`** — Needs **`hold_token`** from the hold response.

Suggested wording for the assistant’s instructions: see `system-prompt-happy-path.md` in this folder.

---

## Step 5 — What Vapi **sends** to TEIKOS (picture the envelope)

Vapi does not send one flat JSON blob; it wraps tool calls under **`message`**. TEIKOS looks for **`message.toolCallList`**: an **array** (a list) of calls.

Each item in the list should include:

- **`id`** — Any string id so the answer can be matched (example: `call_abc123`)
- **`name`** — The tool name, like `availability_check`
- **`parameters`** — A small JSON object with the inputs (some Vapi versions use `arguments` instead; TEIKOS accepts common shapes)

**Example** (spacing does not matter; names do):

```json
{
  "message": {
    "type": "tool-calls",
    "toolCallList": [
      {
        "id": "call_abc123",
        "name": "availability_check",
        "parameters": {
          "service_id": "00000000-0000-0000-0000-000000000000",
          "range_start_date": "2026-04-07",
          "range_end_date": "2026-04-11"
        }
      }
    ]
  }
}
```

Replace `service_id` with a real UUID from **`business_facts_get`**.

---

## Step 6 — What TEIKOS **sends back** to Vapi

TEIKOS answers with an object that has a **`results`** array. Each result has:

- **`name`** — Which tool finished
- **`toolCallId`** — Same id you sent (so Vapi can pair question and answer)
- **`result`** — A **string** that contains JSON inside it (yes, JSON inside text — that is normal here)

**Example shape:**

```json
{
  "results": [
    {
      "name": "availability_check",
      "toolCallId": "call_abc123",
      "result": "{\"ok\":true,\"data\":{\"timezone\":\"America/Chicago\",\"windows\":[...]},\"error\":null,\"meta\":{...}}"
    }
  ]
}
```

**What your assistant must do:** Take `results[i].result`, parse it as JSON, then read:

- **`ok`** — `true` means success, `false` means failure
- **`data`** — The useful payload (windows, hold_token, speakable_time, etc.)
- **`error`** — When `ok` is false, this explains what went wrong

Scheduling success payloads often include **`timezone`**, **`speakable_time`**, and **`speakable_end`** so the voice can say the right words.

---

## Step 7 — Happy path in plain English

1. Call **`business_facts_get`** — learn timezone and services.
2. Call **`caller_intake`** with the caller’s phone (`+1…` format).
3. Call **`availability_check`** with **`range_start_date`** and **`range_end_date`** (inclusive days on the business calendar).
4. Offer times using **`speakable_time`** from each window (do not invent times).
5. Call **`appointment_hold`** with **`slot_id`** from the chosen window.
6. Call **`appointment_confirm`** with **`hold_token`** from the hold response.

Holds expire in about **90 seconds** — confirm soon.

---

## If something fails

- **401** — Secret or signature does not match. Re-copy the Bearer value or rotate the secret.
- **400 / No tool calls** — Vapi’s body is missing `message.toolCallList` or the list is empty.
- **Slot not available** — Run **`availability_check`** again; another caller may have taken the slot.

More help: TEIKOS **Docs → Troubleshooting**.

---

## Speed tips

- The first call after a quiet period can be a bit slower; the next calls are faster for several minutes.
- If Vapi allows **multiple tools in one** `toolCallList`, TEIKOS runs them **one after another** in one HTTP request — fewer round trips for Vapi.
