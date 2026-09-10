import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { MarkdownPlaybook } from "@/components/docs/MarkdownPlaybook";
import { integrationPlaybooks, personalizePlaybookMarkdown } from "@/content/playbookImports";
import { TOOL_ROUTER_BASE, PARTNER_LINKS } from "@/config/site";

const TOOLS = [
  {
    name: "business_facts_get",
    rpc: "agent_context_get_v1",
    description: "Retrieve the business owner's profile, timezone, services, work hours, and custom business facts. This is the first call an agent should make to understand the business context.",
    parameters: [
      { name: "include_facts", type: "boolean", required: false, description: "Include custom business facts (default: true)" },
    ],
  },
  {
    name: "caller_intake",
    rpc: "caller_intake_v1",
    description: "Resolve a caller's phone number to an existing client or prospect. If no match exists, a new prospect is created automatically. Call this early in every conversation to identify the caller.",
    parameters: [
      { name: "caller_phone", type: "string", required: true, description: "Caller phone number in E.164 format (e.g. +15551234567)" },
      { name: "caller_payload", type: "object", required: false, description: "Additional caller info: { name, email, notes }" },
    ],
  },
  {
    name: "availability_check",
    rpc: "availability_check_v1",
    description:
      "Compute available time slots for a service. Success data includes timezone, range bounds, and windows[]. Each window has slot_id (opaque, pass to appointment_hold or appointment_reschedule), iso_start / iso_end (machine instants), speakable_time and speakable_end (English phrases in the business timezone for TTS). Prefer range_start_date + range_end_date (inclusive business calendar days); alternatively range_start + range_end as ISO instants with Z or offset.",
    parameters: [
      { name: "service_id", type: "uuid", required: true, description: "The service to check availability for" },
      {
        name: "range_start_date",
        type: "date",
        required: false,
        description: "YYYY-MM-DD first day to search (inclusive, business calendar; use with range_end_date)",
      },
      {
        name: "range_end_date",
        type: "date",
        required: false,
        description: "YYYY-MM-DD last day to search (inclusive, business calendar; use with range_start_date)",
      },
      {
        name: "range_start",
        type: "timestamptz",
        required: false,
        description: "Range start as ISO 8601 instant (omit when using date range)",
      },
      {
        name: "range_end",
        type: "timestamptz",
        required: false,
        description: "Range end as ISO 8601 instant (exclusive; omit when using date range)",
      },
    ],
  },
  {
    name: "appointment_hold",
    rpc: "appointment_hold_v1",
    description:
      "Place a 90-second hold on a specific time slot. Prefer slot_id copied from a window returned by availability_check (simplest for voice agents). Alternatively start_date + start_time_local in business TZ, or start_time as a full ISO instant. On success, data includes hold_token, timezone, speakable_time, speakable_end. Call appointment_confirm within 90 seconds.",
    parameters: [
      { name: "service_id", type: "uuid", required: true, description: "The service being booked" },
      {
        name: "slot_id",
        type: "string",
        required: false,
        description: "Opaque slot id from availability_check windows[] (recommended)",
      },
      {
        name: "start_date",
        type: "date",
        required: false,
        description: "YYYY-MM-DD in the business calendar (use with start_time_local)",
      },
      {
        name: "start_time_local",
        type: "time",
        required: false,
        description: "Wall-clock start in business TZ, e.g. 14:00:00 (with start_date)",
      },
      {
        name: "start_time",
        type: "timestamptz",
        required: false,
        description: "Slot start as ISO 8601 (15-min aligned). Omit when using slot_id or start_date + start_time_local.",
      },
      { name: "caller_phone", type: "string", required: true, description: "Caller phone in E.164 format" },
      { name: "caller_payload", type: "object", required: false, description: "Additional caller info: { name, email }" },
    ],
  },
  {
    name: "appointment_confirm",
    rpc: "appointment_confirm_v1",
    description:
      "Confirm a held appointment using hold_token from appointment_hold. Availability is re-checked excluding the held row (other conflicts still block confirm). Success data includes appointment_id, timezone, speakable_time, speakable_end for the confirmed slot.",
    parameters: [
      { name: "hold_token", type: "string", required: true, description: "The hold_token returned by appointment_hold" },
    ],
  },
  {
    name: "appointment_cancel",
    rpc: "appointment_cancel_v1",
    description:
      "Cancel a held or confirmed appointment. Success data includes appointment_id, timezone, speakable_time, speakable_end for the slot that was canceled (for accurate caller-facing wording).",
    parameters: [
      { name: "appointment_id", type: "uuid", required: true, description: "The appointment to cancel" },
      { name: "reason", type: "string", required: false, description: "Cancellation reason" },
    ],
  },
  {
    name: "appointment_reschedule",
    rpc: "appointment_reschedule_v1",
    description:
      "Reschedule a confirmed appointment. Prefer new_slot_id from a fresh availability_check for the same service. Alternatively new_start_date + new_start_time_local in business TZ, or new_start_time as ISO. Success data includes timezone, speakable_time, speakable_end for the new slot.",
    parameters: [
      { name: "appointment_id", type: "uuid", required: true, description: "The appointment to reschedule" },
      {
        name: "new_slot_id",
        type: "string",
        required: false,
        description: "Opaque slot id from availability_check for the appointment's service (recommended)",
      },
      {
        name: "new_start_date",
        type: "date",
        required: false,
        description: "YYYY-MM-DD in the business calendar (with new_start_time_local)",
      },
      {
        name: "new_start_time_local",
        type: "time",
        required: false,
        description: "Wall-clock start in business TZ, e.g. 14:00:00 (with new_start_date)",
      },
      {
        name: "new_start_time",
        type: "timestamptz",
        required: false,
        description: "New start as ISO instant (omit when using new_slot_id or date + local)",
      },
      { name: "reason", type: "string", required: false, description: "Reschedule reason" },
    ],
  },
  {
    name: "voice_log_create",
    rpc: "voice_log_create_v1",
    description: "Create an append-only voice log entry after a call completes. Used for auditing and analytics.",
    parameters: [
      { name: "integration_id", type: "uuid", required: false, description: "The integration that handled the call" },
      { name: "caller_phone", type: "string", required: true, description: "Caller phone" },
      { name: "outcome", type: "string", required: false, description: "Call outcome (e.g. booked, canceled, inquiry)" },
      { name: "reason", type: "string", required: false, description: "Outcome reason" },
      { name: "transcript_text", type: "string", required: false, description: "Plain text transcript" },
      { name: "started_at", type: "timestamptz", required: false, description: "Call start time" },
      { name: "ended_at", type: "timestamptz", required: false, description: "Call end time" },
    ],
  },
];

function PartnerLinks({ sectionId }: { sectionId: string }) {
  const show = ["overview", "getting-started", "vapi", "retell", "n8n", "webhook", "why"].includes(sectionId);
  if (!show) return null;
  return (
    <div className="not-prose flex flex-wrap gap-2 mb-4">
      {Object.values(PARTNER_LINKS).map((p) => (
        <a
          key={p.url}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium border-2 border-dark rounded-md px-2 py-1 bg-white hover:bg-teikos-yellow/50 transition-colors"
        >
          {p.name} ↗
        </a>
      ))}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold mt-6 mb-2">{children}</h2>;
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-medium mt-4 mb-1">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-2">{children}</p>;
}

export function DocsSectionContent({ sectionId }: { sectionId: string }) {
  return (
    <Card className="border-[3px] border-dark shadow-card">
      <CardContent className="pt-6">
        <PartnerLinks sectionId={sectionId} />

                {/* ---- WHY TEIKOS ---- */}
                {sectionId === "why" && (
                  <div className="space-y-4">
                    <SectionHeading>Why TEIKOS?</SectionHeading>
                    <P>
                      If you've built a voice agent, you already know the problem.
                    </P>
                    <P>
                      Your agent sounds incredible on a demo call. It handles objections, books appointments, and feels like magic — until it books a client at 3 AM on a Sunday,
                      double-books the same slot twice in ten seconds, or confidently reads back an appointment time that doesn't exist.
                      The caller hangs up trusting a confirmation that was never real.
                    </P>
                    <P>
                      This isn't a prompt engineering problem. <strong>It's an infrastructure problem.</strong>
                    </P>

                    <SubHeading>The Gap in Today's Voice Agent Stack</SubHeading>
                    <P>
                      Platforms like Vapi, Retell, and Bland give you the voice layer — the LLM, the telephony, the low-latency audio pipeline.
                      They're excellent at what they do. But when your agent needs to answer "when are you available?" or "can I book Thursday at 2?",
                      those platforms hand the problem back to you. So you wire up Google Calendar through Zapier, duct-tape a Cal.com widget into an n8n workflow,
                      or write a custom API that queries a spreadsheet. The agent calls your endpoint, gets a response that's already stale, and the hallucinations start.
                    </P>
                    <P>
                      The core issue is that <strong>voice agents have no source of truth for scheduling state</strong>.
                      They operate on context windows and prompt injections — not database transactions.
                      Two callers can ask for the same slot at the same time, and both get told "yes" because nothing is holding that slot atomically.
                      There's no lock, no transaction boundary, no conflict resolution.
                      Just two confirmed appointments for the same 2:00 PM Wednesday, and a business owner who finds out the hard way.
                    </P>

                    <SubHeading>What TEIKOS Does Differently</SubHeading>
                    <P>
                      <strong>TEIKOS exists to be that source of truth.</strong>
                    </P>
                    <P>
                      Every availability check is computed in real-time from work hours, time off, and existing appointments — nothing is cached or stored.
                      Every booking follows a strict hold-then-confirm state machine: the slot is locked for 90 seconds while the caller decides,
                      and confirmation re-verifies availability inside a database transaction.
                      Two agents racing for the same slot? One wins, one gets a clean rejection. No double-books. No phantom confirmations. No hallucinated times.
                    </P>
                    <P>
                      TEIKOS is <strong>platform-agnostic</strong>. It works with Vapi, Retell, n8n, or any system that can make an HTTP POST.
                      Your agent calls TEIKOS tools the same way it calls any function — except the response is deterministic, not generated.
                      When TEIKOS says a slot is open, it's open. When it confirms a booking, it's confirmed. The agent never has to guess.
                    </P>

                    <SubHeading>Who Is TEIKOS For?</SubHeading>
                    <div className="space-y-3">
                      <div className="border-l-2 border-blue-500 pl-3">
                        <p className="text-sm font-medium mb-1">Business Owners</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          If you're using a voice agent to handle calls, TEIKOS means your agent stops embarrassing you.
                          No more apologizing for double-booked clients. No more manually fixing appointments that were "confirmed" but never actually existed.
                          You set your work hours, define your services, and TEIKOS handles the rest — your agent just asks the right questions.
                        </p>
                      </div>
                      <div className="border-l-2 border-purple-500 pl-3">
                        <p className="text-sm font-medium mb-1">Voice Agent Agencies</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          If you're building voice agents for clients, TEIKOS means you stop rebuilding the same fragile scheduling backend for every deployment.
                          Provision integrations for your clients in seconds, manage their configurations from a single dashboard,
                          and ship agents that actually work in production — not just on demo day.
                          Your clients get reliability. You get scale.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-bold leading-relaxed mb-2 uppercase tracking-wide">
                        This is the infrastructure layer that voice agents have been missing.
                        Not another calendar widget. Not another Zapier chain.
                        A database-first scheduling engine with atomic transactions, row-level security, and low-latency tool paths —
                        purpose-built for the way voice agents actually operate.
                      </p>
                    </div>
                  </div>
                )}

                {/* ---- ROLES & PERMISSIONS ---- */}
                {sectionId === "roles" && (
                  <div className="space-y-2">
                    <SectionHeading>Role Hierarchy</SectionHeading>
                    <P>
                      TEIKOS uses three tiered roles. Each higher role inherits everything from the roles below it and adds additional capabilities.
                      All permissions are enforced at the database level via Row-Level Security (RLS) and RPC guards — the UI simply reflects what the backend allows.
                    </P>
                    <div className="flex items-center justify-center gap-2 py-3 text-sm font-medium">
                      <span className="px-3 py-1.5 rounded-md bg-muted">User</span>
                      <span className="text-muted-foreground">&rarr;</span>
                      <span className="px-3 py-1.5 rounded-md bg-muted">Pro</span>
                      <span className="text-muted-foreground">&rarr;</span>
                      <span className="px-3 py-1.5 rounded-md bg-muted">Agency</span>
                    </div>

                    <SubHeading>User (Free Tier)</SubHeading>
                    <P>
                      The default role for every new account. A User is a business owner who manages their own scheduling data.
                    </P>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li>Create, read, update, and delete your own <strong>services</strong>, <strong>clients</strong>, <strong>work hours</strong>, <strong>time off</strong>, and <strong>appointments</strong></li>
                      <li>Full access to the <strong>Business Dashboard</strong> — edit account info, business facts, and timezone</li>
                      <li>Accept or decline <strong>link requests</strong> from agencies</li>
                      <li>Unlink yourself from an agency at any time</li>
                      <li>View your own <strong>voice logs</strong>, <strong>usage metrics</strong>, and <strong>plan limits</strong> (integrations / seats)</li>
                      <li>View, reveal, rotate, and revoke secrets for your <strong>own</strong> integrations via RPC</li>
                      <li>Use the <strong>Calendar</strong> to view and manage appointments (drag-to-reschedule, manual create)</li>
                      <li>Send messages to your linked agency or TEIKOS support</li>
                    </ul>
                    <div className="mt-2 border-l-2 border-yellow-500 pl-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Limitation:</strong> Users cannot create or manage integrations. To connect a voice agent, upgrade to <strong>Pro</strong> or have an <strong>Agency</strong> provision an integration on your behalf.
                      </p>
                    </div>

                    <SubHeading>Pro (Stripe Subscription)</SubHeading>
                    <P>
                      Everything a User can do, plus the ability to create and manage your own integrations.
                    </P>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li><strong>All User capabilities</strong></li>
                      <li>Create and disable your <strong>own integrations</strong> (Vapi, Retell, n8n, Webhook, HTTP)</li>
                      <li>Autoprovision integrations for your own account</li>
                      <li>Reveal, rotate, and revoke integration secrets</li>
                      <li>Run <strong>connection speed</strong> checks on your integrations</li>
                      <li>Full access to the <strong>Integrations</strong> page</li>
                      <li>Use <strong>Agent Lab</strong> to rehearse scheduling RPCs and tool-router calls safely</li>
                    </ul>
                    <div className="mt-2 border-l-2 border-blue-500 pl-3 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Plan caps:</strong> one business per account and up to <strong>three</strong> active
                        integrations at a time. You can keep more integration records and turn others off to stay within the cap.
                        Usage (tool calls / bookings) is not metered for billing.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>How to upgrade:</strong> Subscribe to the <strong>Pro plan</strong> via Stripe. Once your subscription is active, your role is automatically elevated to Pro. No action needed beyond payment.
                      </p>
                    </div>

                    <SubHeading>Agency (Stripe Subscription — Highest Tier)</SubHeading>
                    <P>
                      The highest available tier. Everything a Pro can do, plus the ability to manage other accounts. Designed for voice agent agencies that build and manage integrations for multiple business clients.
                    </P>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li><strong>All Pro capabilities</strong></li>
                      <li>Access <strong>Agency command</strong> and the <strong>Agency hub</strong> fleet view</li>
                      <li>Search for users by email and send <strong>link requests</strong></li>
                      <li>View and manage <strong>linked accounts</strong> — see their business info and usage</li>
                      <li>
                        <strong>Managed client seats:</strong> five linked businesses included in the base plan; purchase
                        additional seats (see <strong>Billing & seats</strong> in these docs) to raise that cap
                      </li>
                      <li>
                        On your <strong>own</strong> agency workspace, integrations are not limited the same way as Pro
                        (Pro is capped at three <em>active</em> integrations on the business they own)
                      </li>
                      <li><strong>Autoprovision integrations</strong> for linked accounts</li>
                      <li>Enable and disable integrations on <strong>linked accounts</strong></li>
                      <li>Send and receive <strong>messages</strong> to/from linked business accounts</li>
                      <li>View voice logs and usage metrics for linked accounts</li>
                      <li>Open <strong>Agency hub</strong> for fleet readiness cards and per-client shortcuts</li>
                      <li>Use <strong>Agent Lab</strong> against any linked business from the hub or workspace switcher</li>
                    </ul>
                    <div className="mt-2 border-l-2 border-purple-500 pl-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>How to upgrade:</strong> Subscribe to the <strong>Agency plan</strong> via Stripe. Your role is automatically elevated to Agency when the subscription becomes active.
                      </p>
                    </div>

                    <SectionHeading>Capability Comparison</SectionHeading>
                    <div className="border rounded-md overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted">
                            <th className="text-left px-3 py-2 font-medium">Capability</th>
                            <th className="text-center px-3 py-2 font-medium">User</th>
                            <th className="text-center px-3 py-2 font-medium">Pro</th>
                            <th className="text-center px-3 py-2 font-medium">Agency</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-t"><td className="px-3 py-1.5">Own services / clients / scheduling</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5">Business Dashboard</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5">Calendar (view, manual create, reschedule)</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5">View own logs / usage / plan limits</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5">Accept / decline link requests</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td></tr>
                          <tr className="border-t bg-muted/50"><td className="px-3 py-1.5 font-medium">Create / manage own integrations</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td></tr>
                          <tr className="border-t bg-muted/50"><td className="px-3 py-1.5 font-medium">Autoprovision own integrations</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5 font-medium">Agent Lab</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">Yes</td><td className="text-center px-3 py-1.5">Yes</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5">Max active integrations (own workspace)</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">3</td><td className="text-center px-3 py-1.5">Unlimited</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5 font-medium">Agency command / Agency hub</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">Yes</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5">Send link requests to users</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">Yes</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5">Manage linked account integrations</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">Yes</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5">Managed client seat pool (5 + paid add-ons)</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">—</td><td className="text-center px-3 py-1.5">Yes</td></tr>
                        </tbody>
                      </table>
                    </div>

                    <SectionHeading>How to Upgrade Your Role</SectionHeading>
                    <P>
                      TEIKOS role upgrades are handled automatically through Stripe subscriptions. There is no manual role selection — your role is determined by your active subscription tier.
                    </P>
                    <SubHeading>Upgrading to Pro</SubHeading>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li>Navigate to your <strong>Settings</strong> page</li>
                      <li>Select the <strong>Pro</strong> subscription plan</li>
                      <li>Complete payment through <strong>Stripe Checkout</strong></li>
                      <li>Once the subscription is <strong>active</strong>, your account role is automatically elevated to <strong>Pro</strong></li>
                    </ol>

                    <SubHeading>Upgrading to Agency</SubHeading>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li>Navigate to your <strong>Settings</strong> page</li>
                      <li>Select the <strong>Agency</strong> subscription plan</li>
                      <li>Complete payment through <strong>Stripe Checkout</strong></li>
                      <li>Once the subscription is <strong>active</strong>, your account role is automatically elevated to <strong>Agency</strong></li>
                    </ol>

                    <SubHeading>What Happens on Downgrade or Cancellation</SubHeading>
                    <P>
                      If your Stripe subscription is <strong>canceled</strong>, <strong>unpaid</strong>, or <strong>past due</strong>, your role is automatically reverted to <strong>User</strong>.
                      You retain all of your data (services, clients, appointments, logs), but you lose access to features above the User tier until you resubscribe.
                    </P>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li>Existing integrations are <strong>not deleted</strong> but will be inaccessible until you upgrade again</li>
                      <li>Linked accounts (if you were an Agency) remain in the system but the link becomes inactive</li>
                      <li>Voice agents using your integrations will receive auth errors until the integration owner has a valid role</li>
                    </ul>

                    <SectionHeading>How Permissions Are Enforced</SectionHeading>
                    <P>
                      All permissions are enforced at the <strong>database level</strong> — not in the UI. This means:
                    </P>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li><strong>Row-Level Security (RLS)</strong> controls which rows you can read and write based on your role and account ID</li>
                      <li><strong>RPC guards</strong> check your role at the start of every database function call — if you lack the required role, the call is rejected</li>
                      <li>The UI shows or hides pages and actions based on your role, but even if the UI were bypassed, the database would still block unauthorized operations</li>
                      <li>JWT claims carry your <code className="text-xs bg-muted px-1 rounded">account_id</code> and <code className="text-xs bg-muted px-1 rounded">role</code> — these are verified on every request</li>
                    </ul>
                  </div>
                )}

                {/* ---- BUSINESS FACTS HOW-TO ---- */}
                {sectionId === "business-facts" && (
                  <div className="space-y-4">
                    <SectionHeading>Business Facts — How To</SectionHeading>
                    <P>
                      Business Facts are custom key-value pairs that your voice agent reads to answer callers accurately.
                      They live on your Business Dashboard and are delivered to the agent via the <code className="text-xs bg-muted px-1 rounded">business_facts_get</code> tool.
                      Think of them as a cheat sheet for your agent — anything it needs to know about your business that isn't already captured by services, work hours, or appointments.
                    </P>

                    <SubHeading>1. The Idea</SubHeading>
                    <P>
                      Each fact has a <strong>Key</strong> (a short name like <code className="text-xs bg-muted px-1 rounded">business_hours</code>) and a <strong>Value</strong> (the actual info).
                      The agent reads the value to answer callers. You pick how to write the value: as text, a list, a number, or labeled pieces.
                    </P>

                    <SubHeading>2. How to Choose the Right Format</SubHeading>
                    <P>Ask yourself what kind of information you're storing:</P>
                    <div className="space-y-2 ml-2">
                      <p className="text-sm text-muted-foreground"><strong className="text-foreground">One sentence or phrase the agent reads out loud?</strong> → Use a <strong>string</strong>.</p>
                      <p className="text-sm text-muted-foreground"><strong className="text-foreground">Several things of the same kind (e.g. services, areas)?</strong> → Use an <strong>array</strong>.</p>
                      <p className="text-sm text-muted-foreground"><strong className="text-foreground">A quantity or price (just a number)?</strong> → Use a <strong>number</strong>.</p>
                      <p className="text-sm text-muted-foreground"><strong className="text-foreground">Several things, each with its own label (e.g. Monday hours vs Saturday hours)?</strong> → Use an <strong>object</strong>.</p>
                    </div>

                    <SubHeading>3. How to Write Each Type</SubHeading>
                    <P>Each type has rules. Follow them exactly.</P>

                    <div className="space-y-4 ml-2">
                      <div>
                        <p className="text-sm font-medium mb-1">String — text in double quotes</p>
                        <p className="text-xs text-muted-foreground mb-1">Use for: one phrase or sentence (hours, address, payment policy).</p>
                        <p className="text-xs text-muted-foreground mb-1">Rule: put the whole thing inside straight double quotes.</p>
                        <CodeBlock>{`"Mon–Fri 9am–5pm, Sat 10am–2pm"`}</CodeBlock>
                        <p className="text-xs text-muted-foreground mt-1">More examples:</p>
                        <CodeBlock>{`"123 Main St, Springfield, IL 62701"
"We accept cash, card, and financing. Payment due at completion."`}</CodeBlock>
                        <p className="text-xs text-muted-foreground italic mt-1">Why: the agent can read it word-for-word. Simple and clear.</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Array — list in square brackets</p>
                        <p className="text-xs text-muted-foreground mb-1">Use for: a list of similar items (services, areas, specialties).</p>
                        <p className="text-xs text-muted-foreground mb-1">Rule: open with <code className="text-xs bg-muted px-1 rounded">[</code>, put each item in quotes, separate with commas, close with <code className="text-xs bg-muted px-1 rounded">]</code>. No comma after the last item.</p>
                        <CodeBlock>{`["HVAC repair", "Installation", "Maintenance"]`}</CodeBlock>
                        <p className="text-xs text-muted-foreground italic mt-1">Why: the agent can pick from the list or read them all.</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Number — no quotes</p>
                        <p className="text-xs text-muted-foreground mb-1">Use for: quantities, prices, counts (e.g. minimum order, hourly rate).</p>
                        <p className="text-xs text-muted-foreground mb-1">Rule: just the number. No quotes.</p>
                        <CodeBlock>{`25
99.99`}</CodeBlock>
                        <p className="text-xs text-muted-foreground italic mt-1">Note: phone numbers and zip codes stay as strings (with quotes) so they keep their format.</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Object — labeled pieces in curly braces</p>
                        <p className="text-xs text-muted-foreground mb-1">Use for: several pieces of info, each with a label (e.g. different hours per day, or different response times).</p>
                        <p className="text-xs text-muted-foreground mb-1">Rule: open with <code className="text-xs bg-muted px-1 rounded">{"{"}</code>, write <code className="text-xs bg-muted px-1 rounded">"label": "value"</code> for each piece, separate with commas, close with <code className="text-xs bg-muted px-1 rounded">{"}"}</code>. No comma after the last piece.</p>
                        <CodeBlock>{`{"emergency": "2 hours", "standard": "1–2 days"}`}</CodeBlock>
                        <p className="text-xs text-muted-foreground italic mt-1">Why: the agent can look up the right piece by label (e.g. "emergency" vs "standard").</p>
                      </div>
                    </div>

                    <SubHeading>4. What Is Nesting?</SubHeading>
                    <P>
                      Nesting means putting one type inside another. Example: an object where one of the values is an array:
                    </P>
                    <CodeBlock>{`{"areas": ["Downtown", "Westside"]}`}</CodeBlock>
                    <P>
                      You usually don't need it. Stick to strings, arrays, numbers, and simple objects. If a single string or a simple list says what you need, use that.
                    </P>

                    <SubHeading>5. Common Mistakes</SubHeading>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li>Text without quotes → wrong. Text must be in <code className="text-xs bg-muted px-1 rounded">"quotes"</code>.</li>
                      <li>Comma after the last item → wrong. <code className="text-xs bg-muted px-1 rounded">["a", "b",]</code> is invalid; use <code className="text-xs bg-muted px-1 rounded">["a", "b"]</code>.</li>
                      <li>Curly quotes "like this" → wrong. Use straight quotes <code className="text-xs bg-muted px-1 rounded">"like this"</code>.</li>
                      <li>Single quotes <code className="text-xs bg-muted px-1 rounded">'like this'</code> → wrong. Use double quotes.</li>
                    </ul>

                    <SubHeading>6. Example Facts for a Real Business</SubHeading>
                    <P>Here's what a plumbing company's business facts might look like:</P>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted">
                            <th className="text-left px-3 py-2 font-medium">Key</th>
                            <th className="text-left px-3 py-2 font-medium">Value</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-t"><td className="px-3 py-1.5 font-mono">address</td><td className="px-3 py-1.5 font-mono">"456 Oak Ave, Huntsville, AL 35801"</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5 font-mono">service_areas</td><td className="px-3 py-1.5 font-mono">["Huntsville", "Madison", "Decatur"]</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5 font-mono">emergency_fee</td><td className="px-3 py-1.5 font-mono">150</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5 font-mono">payment_policy</td><td className="px-3 py-1.5 font-mono">"We accept cash, card, and check. Payment due at completion."</td></tr>
                          <tr className="border-t"><td className="px-3 py-1.5 font-mono">response_times</td><td className="px-3 py-1.5 font-mono">{`{"emergency": "2 hours", "standard": "next business day"}`}</td></tr>
                        </tbody>
                      </table>
                    </div>

                    <SubHeading>7. Where you edit facts in the app</SubHeading>
                    <P>
                      Open the <strong>Business Dashboard</strong>, choose the <strong>Business Facts</strong> tab, and use <strong>Add fact</strong> or edit an existing row.
                      Each fact stores a stable <strong>Key</strong> (what the system and tools use), an optional <strong>Label</strong> (a friendly title for you),
                      optional <strong>Category</strong> (for example general, pricing, or policy), optional <strong>Description</strong> (notes only you see),
                      and the <strong>Value</strong> as structured JSON (follow sections 2–3 above).
                    </P>

                    <SubHeading>8. Recommended path for non-technical users</SubHeading>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 ml-2 leading-relaxed">
                      <li>Add one <strong>string</strong> fact you know callers always ask for (for example address or parking).</li>
                      <li>Add a second fact only when it is clearly different information (do not duplicate services you already defined under Services).</li>
                      <li>Use <strong>categories</strong> so related facts stay grouped when you have many.</li>
                      <li>
                        After saving, open <strong>Agent Lab</strong> (Pro or Agency), choose <strong>Context only</strong>, run once, and in the inspector open
                        <strong> Impact → Context preview</strong> to confirm your facts appear as you expect before you go live on the phone.
                      </li>
                    </ol>

                    <SubHeading>9. Agencies editing a client&apos;s facts</SubHeading>
                    <P>
                      Use <strong>Agency command → Linked Accounts</strong>, expand the client, and open their business facts from there,
                      or switch the <strong>Workspace</strong> in the sidebar to that client and use the same Business Facts tab on the dashboard.
                      You are always editing <em>that business&apos;s</em> data, not your agency profile.
                    </P>

                    <SubHeading>10. Preview from the Business Facts tab</SubHeading>
                    <P>
                      The facts editor can load a read-only <strong>agent context</strong> preview for the current workspace so you can sanity-check
                      what the assistant will receive together with services and hours. Use it whenever you change several facts at once.
                    </P>
                  </div>
                )}

                {/* ---- AGENT LAB ---- */}
                {sectionId === "agent-lab" && (
                  <div className="space-y-3">
                    <SectionHeading>Agent Lab</SectionHeading>
                    <P>
                      <strong>Agent Lab</strong> is a Pro-and-up practice area. It walks through the same scheduling and context steps your production voice agent uses,
                      but <strong>without an AI chatbot in the middle</strong> — you press buttons and read exactly what came back from TEIKOS.
                    </P>

                    <SubHeading>Simulation vs live</SubHeading>
                    <P>
                      <strong>Simulation mode</strong> (highlighted in blue) means TEIKOS runs safe &quot;dry run&quot; paths: no lasting database writes for the steps that support simulation
                      (for example mock holds and mock confirms). <strong>Turn simulation off</strong> (coral highlight) only when you intentionally want real holds, real prospects, or real logs —
                      and clean up test data afterward. Prefer simulation while learning.
                    </P>

                    <SubHeading>Scenarios (the dropdown)</SubHeading>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2 leading-relaxed">
                      <li>
                        <strong>Full pipeline</strong> — Loads open times for your date range, identifies the caller, then places a <strong>hold</strong> on the first open slot.
                        Read the <strong>Run log</strong> top to bottom; green summaries in <strong>Inspector → Steps</strong> mean each step succeeded.
                      </li>
                      <li>
                        <strong>Context only</strong> — Loads business profile, services, hours, and facts. Use this to verify business facts and timezone before you touch booking.
                      </li>
                      <li>
                        <strong>Availability only</strong> — Stops after listing openings (or errors). Good when you are tuning work hours or service length.
                      </li>
                      <li>
                        <strong>Intake only</strong> — Tests whether the phone number resolves to a <strong>client</strong> or a <strong>prospect</strong>.
                        Pick <strong>Existing client</strong> and use a phone number that already exists on the <strong>Clients</strong> page if you want a match.
                      </li>
                      <li>
                        <strong>Voice log only</strong> — Creates a voice log entry (respects simulation when it applies). Use to confirm logging works.
                      </li>
                      <li>
                        <strong>Cancel appointment</strong> — Needs a real appointment ID from Calendar or your database tools. Optional reason text.
                      </li>
                      <li>
                        <strong>Reschedule</strong> — Needs the appointment ID <em>and</em> a fresh <code className="text-xs bg-muted px-1 rounded">slot_id</code> copied from a new availability run for the same service.
                      </li>
                    </ul>

                    <SubHeading>Strict (tool-router) mode</SubHeading>
                    <P>
                      When <strong>Strict (tool-router) args</strong> is on, TEIKOS sends the same slim parameter shapes as the live edge tool-router (no lab clock, no simulation flags, no optional lab fields).
                      Strict mode and simulation cannot both be on. For agencies testing a <strong>linked client</strong>, it is usually easier to use normal lab mode or switch the <strong>Workspace</strong> to that client
                      so the app matches how their production JWT is scoped.
                    </P>

                    <SubHeading>Control panels (accordions)</SubHeading>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2 leading-relaxed">
                      <li>
                        <strong>The who</strong> — Caller <strong>persona</strong> (new vs existing), phone in E.164 (example <code className="text-xs bg-muted px-1 rounded">+15551234567</code>), and optional <strong>mock client history</strong> text
                        passed only in non-strict lab mode to mimic notes from a CRM.
                      </li>
                      <li>
                        <strong>The when</strong> — Optional <strong>lab clock</strong> (&quot;pretend now&quot; is this instant) for availability and holds; date range; <strong>Show unavailable</strong> to sample blocked slots with reasons;
                        <strong>Display times as</strong> business timezone, your browser, or (for agencies) your agency timezone.
                      </li>
                      <li>
                        <strong>The what</strong> — For agencies, pick which <strong>linked business</strong> the run targets (or open Agent Lab from <strong>Agency hub</strong> so the client is pre-selected). Choose <strong>service</strong>, adjust <strong>duration</strong> slider, toggle <strong>buffer</strong> minutes.
                      </li>
                      <li>
                        <strong>The action</strong> — <strong>Hold TTL display</strong> slider is a <em>label hint only</em>; real holds still expire on the server on a short clock (about 90 seconds). <strong>Replay hold</strong> resends the same idempotency key in <strong>live</strong> mode to prove retries are safe.
                      </li>
                      <li>
                        <strong>The brain</strong> — Filter facts by category; <strong>Injected fact</strong> is preview-only and is <strong>not saved</strong> to the business — it appears in the inspector merge preview so you can role-play wording.
                      </li>
                      <li>
                        <strong>The result</strong> — <strong>Simulated outcome</strong> labels what the UI pretends happened after a mock hold; <strong>Speakable in plain English</strong> toggles friendly time phrases vs raw JSON for developers.
                      </li>
                    </ul>

                    <SubHeading>Run log and quick commands</SubHeading>
                    <P>
                      After you click <strong>Run pipeline</strong>, messages appear in the center column. You can also type short commands such as <strong>run</strong>, <strong>book</strong>, or <strong>availability</strong> in the quick box and press Send.
                    </P>

                    <SubHeading>Inspector tabs</SubHeading>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li><strong>Steps</strong> — Expand any row to see the exact request arguments and JSON response for that RPC call.</li>
                      <li><strong>Impact</strong> — A plain-language logic tree plus hints about prospects, clients, and appointments (simulation shows &quot;what would have changed&quot;).</li>
                      <li>
                        <strong>Edge</strong> — Sends a real HTTP POST to your live <strong>tool-router</strong> URL for the selected integration, with the secret autofilled when possible.
                        Use it to compare edge responses with direct RPC runs. Retell uses an HMAC header; Vapi and webhook-style providers use Bearer auth.
                      </li>
                    </ul>

                    <SubHeading>Mock confirm (simulation only)</SubHeading>
                    <P>
                      After a <strong>simulated</strong> hold, the hold token begins with <code className="text-xs bg-muted px-1 rounded">sim_</code>. <strong>Mock confirm</strong> exercises the confirm RPC in simulation so you can see the envelope <strong>without writing a real appointment</strong>.
                      If the button says you need a simulated hold first, run the full pipeline with simulation on.
                    </P>

                    <SubHeading>Opening Agent Lab for one client (agencies)</SubHeading>
                    <P>
                      From <strong>Agency hub</strong>, click <strong>Agent Lab (this client)</strong> — the address bar will include <code className="text-xs bg-muted px-1 rounded">?owner=…</code> so the lab targets that business.
                      You can also pick the client from the <strong>Business</strong> dropdown inside the lab when you are not coming from the hub.
                    </P>
                  </div>
                )}

                {/* ---- AGENCY HUB ---- */}
                {sectionId === "agency-hub" && (
                  <div className="space-y-3">
                    <SectionHeading>Agency hub</SectionHeading>
                    <P>
                      <strong>Agency hub</strong> (Agency subscription) shows one card per <strong>linked client</strong>. Think of it as a readiness dashboard: at a glance you see whether each client is set up for voice booking and whether tools have run recently.
                    </P>

                    <SubHeading>What each part of a card means</SubHeading>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2 leading-relaxed">
                      <li>
                        <strong>Avatar and small dot</strong> — Initials from the business name. The dot color reflects voice traffic recency: <strong>green</strong> lively, <strong>amber</strong> idle, <strong>red</strong> stale or offline patterns, <strong>gray</strong> when not applicable.
                      </li>
                      <li>
                        <strong>Readiness pill</strong> — Summarizes automated checks: voice integration present and on, business context loading, services and facts, and whether openings exist in the next couple of weeks.
                        <strong> Green</strong> means recent tool use plus healthy setup. <strong>Yellow</strong> flags missing pieces (for example no services yet) or &quot;everything configured but no tool calls yet.&quot; <strong>Red</strong> means turn integrations on, add a voice agent integration, or fix an error called out in the tooltip — hover the pill for plain-language detail.
                      </li>
                      <li>
                        <strong>Agency link pill</strong> — <strong>Active</strong> when the business is still linked to your agency; <strong>inactive</strong> when the link was broken or paused.
                      </li>
                      <li>
                        <strong>Integration line</strong> — Describes the primary integration (voice agent vs other types), on/off state, and a short sentence about when tools last ran.
                      </li>
                      <li>
                        <strong>Voice tool recency bar</strong> — When the primary integration is an active voice agent, a horizontal bar fills more when tools ran recently and shrinks over roughly a week of quiet time. Test traffic from Agent Lab counts too.
                      </li>
                      <li>
                        <strong>Ring highlight</strong> — When the card matches the workspace you currently have selected in the sidebar, the card gains a colored ring so you know you are acting inside that client&apos;s tenant.
                      </li>
                    </ul>

                    <SubHeading>Actions on each card</SubHeading>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li><strong>Agent Lab (this client)</strong> — Opens the lab scoped to that business.</li>
                      <li><strong>Integrations</strong> — Jump to integrations to rotate secrets or enable providers.</li>
                      <li><strong>Connection speed</strong> — Same style of direct RPC vs edge round-trip numbers as the Integrations page (green / yellow / red thresholds).</li>
                      <li><strong>Call logs &amp; transcripts</strong> — Recent rows with CSV export.</li>
                      <li><strong>Analytics</strong> — Confirmed appointments, tool calls, and voice log counts for the current range, with CSV export.</li>
                      <li><strong>Switch app to this client&apos;s workspace</strong> — Selects the client in the sidebar scope and returns you to the main <code className="text-xs bg-muted px-1 rounded">/app</code> area so every page applies to them.</li>
                    </ul>
                  </div>
                )}

                {/* ---- AGENCY COMMAND ---- */}
                {sectionId === "agency-command" && (
                  <div className="space-y-3">
                    <SectionHeading>Agency command</SectionHeading>
                    <P>
                      <strong>Agency command</strong> is the operations console: linking businesses, watching usage, and buying more seat capacity. <strong>Agency hub</strong> is the visual fleet view with shortcuts; Agency command is where you perform bulk workflows and review analytics tables.
                    </P>

                    <SubHeading>Tabs</SubHeading>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2 leading-relaxed">
                      <li><strong>Main</strong> — Message inbox, invite-and-link flow for new clients, search any account by email, send link requests, and review pending outgoing requests.</li>
                      <li><strong>Linked Accounts</strong> — Searchable list; expand a row for details and to edit that client&apos;s business facts.</li>
                      <li><strong>Linked Logs</strong> — Pick a linked account to read voice logs across your managed fleet.</li>
                      <li><strong>Agency analytics</strong> — Charts for tool calls vs confirmed appointments, optional inclusion of your agency&apos;s own workspace, and month-over-month appointment summaries.</li>
                      <li>
                        <strong>Client Seats</strong> — Shows how many linked-client slots you have versus how many are in use. Base allowance is <strong>five</strong> linked businesses plus any <strong>paid extra seats</strong> on your Agency subscription.
                        Use the link from this tab to <strong>Settings → Client seats</strong> (billing portal) when you need more capacity.
                      </li>
                    </ul>
                  </div>
                )}

                {/* ---- WORKSPACE SWITCHER ---- */}
                {sectionId === "workspace" && (
                  <div className="space-y-3">
                    <SectionHeading>Workspace switcher (agencies)</SectionHeading>
                    <P>
                      Agencies see a <strong>Workspace</strong> dropdown near the top of the left navigation. Choose <strong>My workspace</strong> to work on your own agency business, or pick a <strong>linked client</strong> to act inside their data.
                    </P>
                    <P>
                      While a client is selected, pages such as Dashboard, Calendar, Services, Integrations, and Agent Lab all apply to <em>that client&apos;s</em> account. A banner appears at the top stating you are managing the linked account, with an <strong>Exit client view</strong> button to return to your own workspace.
                      Billing and login settings always remain tied to <strong>your</strong> agency login, even in client view.
                    </P>
                    <P>
                      When the navigation rail is collapsed, the workspace control shows a compact people icon as a reminder that tenant scoping exists — expand the rail to change workspaces.
                    </P>
                  </div>
                )}

                {/* ---- BILLING & SEATS ---- */}
                {sectionId === "billing" && (
                  <div className="space-y-3">
                    <SectionHeading>Billing &amp; seats</SectionHeading>
                    <P>
                      Subscription changes happen on <strong>Settings</strong>. TEIKOS talks to Stripe over secure checkout and webhooks so your <strong>role updates automatically</strong> after payment — there is no manual upgrade switch inside the app.
                    </P>

                    <SubHeading>Upgrading to Pro or Agency</SubHeading>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-2 leading-relaxed">
                      <li>Open <strong>Settings</strong> while signed in.</li>
                      <li>Click <strong>Upgrade to Pro</strong> or <strong>Upgrade to Agency</strong>.</li>
                      <li>Complete Stripe Checkout in the new browser tab or window.</li>
                      <li>When you return, the URL may briefly include <code className="text-xs bg-muted px-1 rounded">checkout=success</code>; a toast explains that Stripe webhooks finalize your plan within a few seconds.</li>
                    </ol>

                    <SubHeading>Managing an existing subscription</SubHeading>
                    <P>
                      Use <strong>Manage billing / portal</strong> on Settings. Depending on how your project is configured, this opens either a hosted Stripe Customer Portal link or calls the <code className="text-xs bg-muted px-1 rounded">stripe-portal</code> edge function to mint a one-time portal URL.
                      From the portal you can update payment methods, invoices, or cancel according to your Stripe product setup.
                    </P>

                    <SubHeading>Adding linked-client seats (agencies)</SubHeading>
                    <P>
                      Agency includes five linked businesses; additional capacity is sold as <strong>paid</strong> seat units on the <strong>same</strong> Stripe subscription as your Agency plan. You can include extra seats on your <strong>first</strong> Agency checkout from Settings, or add or change them later under <strong>Manage subscription</strong> / <strong>Client seats</strong> (Stripe Customer Portal — direct link <code className="text-xs bg-muted px-1 rounded">/app/settings#client-seats-checkout</code>).
                      Webhooks keep <code className="text-xs bg-muted px-1 rounded">extra_managed_client_seats</code> in sync; the <strong>Client Seats</strong> tab in Agency Command shows your cap.
                    </P>

                    <SubHeading>Plan limits recap</SubHeading>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li><strong>User</strong> — Cannot self-create integrations; may still receive integrations from an agency while linked.</li>
                      <li><strong>Pro</strong> — Up to three integrations may be <em>active</em> at once on your own business; deactivate one to activate another.</li>
                      <li><strong>Agency</strong> — Seat pool controls how many distinct businesses you may keep linked at once; your own agency workspace is not subject to the Pro &quot;three active&quot; cap.</li>
                    </ul>
                  </div>
                )}

                {/* ---- VOICE CONTROLS ---- */}
                {sectionId === "voice-controls" && (
                  <div className="space-y-3">
                    <SectionHeading>Voice controls</SectionHeading>
                    <P>
                      The <strong>Voice controls</strong> page is available only when your account role is exactly <strong>Pro</strong> (the route is not shown for Agency-only logins). It is a focused hub for telephony-facing settings that should stay separate from long-form integration secrets.
                    </P>
                    <P>
                      Use it alongside <strong>Integrations</strong> (secrets, autoprovision, connection speed) and <strong>Agent Lab</strong> (dry runs of booking RPCs). When docs or support refer to &quot;voice controls,&quot; they mean this page—not the public phone provider&apos;s entire dashboard.
                    </P>
                  </div>
                )}

                {/* ---- CALENDAR & APPOINTMENTS ---- */}
                {sectionId === "calendar" && (
                  <div className="space-y-3">
                    <SectionHeading>Calendar &amp; appointments</SectionHeading>
                    <P>
                      The <strong>Calendar</strong> page gives a week or month view of what is already on the books, supports drag-to-reschedule when policy allows, and lets you create appointments manually when you need a human touch.
                    </P>
                    <P>
                      The <strong>Appointments</strong> list is another lens on the same underlying records—filters, statuses, and quick edits for staff workflows. Voice agents never bypass TEIKOS: anything they book still lands in these views because the database remains the source of truth for holds and confirmations.
                    </P>
                  </div>
                )}

                {/* ---- OVERVIEW ---- */}
                {sectionId === "overview" && (
                  <div className="space-y-2">
                    <SectionHeading>What Are TEIKOS Integrations?</SectionHeading>
                    <P>
                      TEIKOS integrations connect your voice agent platform (Vapi, Retell, or any webhook-capable system) to the TEIKOS scheduling engine.
                      When a caller asks to book, reschedule, or cancel an appointment, your agent calls TEIKOS tools and receives structured, deterministic responses -- no hallucinations, no double-booking.
                    </P>
                    <SubHeading>How It Works</SubHeading>
                    <P>
                      Every integration gets a unique endpoint URL and a secret. Your voice agent platform sends tool calls to this endpoint.
                      TEIKOS verifies the request, translates it to a database RPC call, and returns a structured JSON envelope.
                    </P>
                    <P>
                      The endpoint pattern is:
                    </P>
                    <CodeBlock>{`POST ${TOOL_ROUTER_BASE}/{provider}/{integration_public_id}`}</CodeBlock>
                    <P>
                      Where <code className="text-xs bg-muted px-1 rounded">provider</code> is one of: <strong>vapi</strong>, <strong>retell</strong>, <strong>webhook</strong>, <strong>http</strong>.
                    </P>
                    <P>
                      Step-by-step setup for each provider is in the <strong>Docs</strong> sections below (Vapi, Retell, n8n, Webhook / HTTP). The same guides ship in the repo as markdown under{" "}
                      <code className="text-xs bg-muted px-1 rounded">integrations/playbooks/</code> so you can read them in Git or follow them here in the app.
                    </P>
                    <SubHeading>Response Envelope</SubHeading>
                    <P>Every TEIKOS RPC returns a canonical envelope:</P>
                    <CodeBlock>{`{
  "ok": true,
  "data": { ... },
  "error": null,
  "meta": {
    "v": "v1",
    "request_id": "uuid",
    "now": "2026-03-08T12:00:00Z",
    "idempotent_replay": false
  }
}`}</CodeBlock>
                    <P>
                      On error, <code className="text-xs bg-muted px-1 rounded">ok</code> is <code className="text-xs bg-muted px-1 rounded">false</code> and <code className="text-xs bg-muted px-1 rounded">error</code> contains <code className="text-xs bg-muted px-1 rounded">code</code>, <code className="text-xs bg-muted px-1 rounded">message</code>, and optional <code className="text-xs bg-muted px-1 rounded">details</code>.
                      This structured format allows your agent to act deterministically on every response.
                    </P>
                    <SubHeading>Key Guarantees</SubHeading>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li><strong>Atomic booking:</strong> Hold → Confirm → (Cancel) state machine prevents double-booking</li>
                      <li><strong>Idempotency:</strong> Every write operation is idempotent -- safe to retry</li>
                      <li><strong>15-minute grid:</strong> All appointments snap to 15-minute boundaries</li>
                      <li><strong>Real-time availability:</strong> Computed from work hours, time off, and existing appointments -- never stored</li>
                      <li><strong>RLS enforcement:</strong> Row-Level Security ensures data isolation per account</li>
                    </ul>
                  </div>
                )}

                {/* ---- GETTING STARTED ---- */}
                {sectionId === "getting-started" && (
                  <div className="space-y-2">
                    <SectionHeading>Getting Started</SectionHeading>
                    <P>Follow these steps to connect any voice agent or automation platform to TEIKOS:</P>

                    <SubHeading>Step 1: Create an Integration</SubHeading>
                    <P>
                      Go to the <strong>Integrations</strong> page and open the <strong>Autoprovision</strong> tab.
                      Set "Provision for" to <strong>Self</strong> (or select a linked account if you are an agency).
                      Choose your provider (Vapi, Retell, n8n, Webhook, or HTTP) and click <strong>Provision</strong>.
                    </P>
                    <P>
                      You will receive two values -- copy them immediately as the secret is shown only once:
                    </P>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                      <li><strong>Integration Public ID</strong> -- used in the endpoint URL</li>
                      <li><strong>Secret</strong> -- used for authentication (Bearer token or HMAC key)</li>
                    </ul>

                    <SubHeading>Step 2: Configure Your Provider</SubHeading>
                    <P>
                      Open <strong>Docs</strong> in TEIKOS and click your provider (Vapi, Retell, n8n, or Webhook / HTTP). Each page is a full <strong>playbook</strong>: what to paste where, what JSON to send, and what comes back. The same files live in the repo under{" "}
                      <code className="text-xs bg-muted px-1 rounded">integrations/playbooks/</code> (for example <code className="text-xs bg-muted px-1 rounded">vapi-playbook.md</code>).
                    </P>

                    <SubHeading>Step 3: Define Tools in Your Provider</SubHeading>
                    <P>
                      Configure your voice agent with the TEIKOS tool definitions. The <strong>Tools Reference</strong> section lists every available tool and its parameters. For Vapi, copy-ready OpenAI-style tools are in{" "}
                      <code className="text-xs bg-muted px-1 rounded">integrations/playbooks/vapi-tools-happy-path.json</code>.
                    </P>

                    <SubHeading>Step 4: Test</SubHeading>
                    <P>
                      Use the <strong>Connection speed</strong> tab on the Integrations page to verify your integration is working.
                      You can also run the <strong>Edge</strong> harness inside <strong>Agent Lab</strong> (Pro+) or open a client card in <strong>Agency hub</strong> and run <strong>Connection speed</strong> — both hit the same style of checks without replacing Integrations entirely.
                      Make a test call or trigger a tool manually to confirm end-to-end connectivity.
                    </P>

                    <SubHeading>Agency / Autoprovision</SubHeading>
                    <P>
                      Agency accounts can provision integrations for linked accounts using the <strong>Autoprovision</strong> tab on the Integrations page.
                      This creates an integration owned by the linked account but managed by you.
                    </P>
                  </div>
                )}

                {/* ---- VAPI ---- */}
                {sectionId === "vapi" && (
                  <div className="space-y-4">
                    <MarkdownPlaybook
                      markdown={personalizePlaybookMarkdown(integrationPlaybooks.vapi, TOOL_ROUTER_BASE)}
                    />
                  </div>
                )}

                {/* ---- RETELL ---- */}
                {sectionId === "retell" && (
                  <div className="space-y-4">
                    <MarkdownPlaybook
                      markdown={personalizePlaybookMarkdown(integrationPlaybooks.retell, TOOL_ROUTER_BASE)}
                    />
                  </div>
                )}

                {/* ---- N8N ---- */}
                {sectionId === "n8n" && (
                  <div className="space-y-4">
                    <MarkdownPlaybook
                      markdown={personalizePlaybookMarkdown(integrationPlaybooks.n8n, TOOL_ROUTER_BASE)}
                    />
                  </div>
                )}

                {/* ---- WEBHOOK / HTTP ---- */}
                {sectionId === "webhook" && (
                  <div className="space-y-4">
                    <MarkdownPlaybook
                      markdown={personalizePlaybookMarkdown(integrationPlaybooks.webhookHttp, TOOL_ROUTER_BASE)}
                    />
                  </div>
                )}

                {/* ---- TOOLS REFERENCE ---- */}
                {sectionId === "tools" && (
                  <div className="space-y-4">
                    <SectionHeading>Available Tools</SectionHeading>
                    <P>
                      These are all the tools your voice agent or automation can call via TEIKOS. Use these exact tool names when configuring your provider.
                    </P>
                    {TOOLS.map((tool) => (
                      <Card key={tool.name}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-mono flex items-center gap-2">
                            {tool.name}
                            <span className="text-xs font-normal text-muted-foreground font-sans">→ {tool.rpc}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                          {tool.parameters.length > 0 && (
                            <div className="border rounded-md overflow-hidden">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-muted">
                                    <th className="text-left px-3 py-1.5 font-medium">Parameter</th>
                                    <th className="text-left px-3 py-1.5 font-medium">Type</th>
                                    <th className="text-left px-3 py-1.5 font-medium">Required</th>
                                    <th className="text-left px-3 py-1.5 font-medium">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tool.parameters.map((p) => (
                                    <tr key={p.name} className="border-t">
                                      <td className="px-3 py-1.5 font-mono">{p.name}</td>
                                      <td className="px-3 py-1.5 text-muted-foreground">{p.type}</td>
                                      <td className="px-3 py-1.5">{p.required ? "Yes" : "No"}</td>
                                      <td className="px-3 py-1.5 text-muted-foreground">{p.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* ---- CONNECTION SPEED ---- */}
                {sectionId === "latency" && (
                  <div className="space-y-2">
                    <SectionHeading>Connection speed</SectionHeading>
                    <P>
                      The Integrations page includes a <strong>Connection speed</strong> tab that measures the performance of your integration (TEIKOS path only — not full voice turn latency).
                      The same measurements appear from <strong>Agency hub</strong> (per-client) and from <strong>Agent Lab → Inspector → Edge</strong> when you POST through the live tool-router.
                      Here is what each check measures:
                    </P>

                    <SubHeading>Direct RPC</SubHeading>
                    <P>
                      Measures the round-trip time of calling a Supabase RPC directly from the browser.
                      This isolates the database + PostgREST latency without the edge function.
                      Represents the irreducible minimum for any TEIKOS operation.
                    </P>

                    <SubHeading>Edge Round-Trip</SubHeading>
                    <P>
                      Measures the full round-trip from browser → edge function → database → edge function → browser.
                      This is the TEIKOS segment your voice agent hits for tools — provider auth verification, payload parsing,
                      JWT cache behavior, the RPC, and response shaping. It does{" "}
                      <strong>not</strong> include STT, LLM time-to-first-token, TTS, or telephony — those dominate perceived
                      &quot;how fast does the agent feel?&quot; on a real call. Industry rules of thumb for full-turn latency are
                      often cited around: under ~500ms feels very snappy, ~500–800ms can still be acceptable in production,
                      ~800ms–1.2s feels sluggish, and beyond ~1.2s callers notice gaps and drop-offs more often.
                    </P>
                    <P>
                      Set <code className="text-xs bg-muted px-1 rounded">VITE_SUPABASE_FUNCTION_REGION</code> to your
                      Supabase database AWS region (for example{" "}
                      <code className="text-xs bg-muted px-1 rounded">us-east-1</code>) so the dashboard sends{" "}
                      <code className="text-xs bg-muted px-1 rounded">x-region</code> on tool-router and agency-provision
                      requests, pinning execution next to Postgres per Supabase regional invocations. Redeploy those Edge
                      functions after CORS changes so the header is allowed on browser preflight.
                    </P>

                    <SubHeading>Full Path</SubHeading>
                    <P>
                      Currently equivalent to Edge Round-Trip. In the future this may include additional provider-side latency simulation.
                    </P>

                    <SubHeading>UI color bands (Integrations / Agency hub)</SubHeading>
                    <P>
                      Green / yellow / red on the connection speed cards follow the TEIKOS segment only: green through about{" "}
                      <strong>600ms</strong> on edge round-trip, yellow through about <strong>1200ms</strong>, red above that — so
                      mid-hundreds of ms on this hop can still be a good sign while you budget hundreds more for the full agent
                      turn. Direct RPC uses a tighter scale (green through ~300ms, yellow through ~600ms) because it skips the
                      edge layer entirely.
                    </P>

                    <SubHeading>Operational ballparks</SubHeading>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="text-left px-3 py-2 font-medium">Situation</th>
                            <th className="text-left px-3 py-2 font-medium">Edge segment (rough)</th>
                            <th className="text-left px-3 py-2 font-medium">What it means</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="px-3 py-2">Warm (cached JWT + metadata)</td>
                            <td className="px-3 py-2 font-mono">often well under 600ms</td>
                            <td className="px-3 py-2 text-muted-foreground">Typical steady-state tool call path; one RPC round trip after edge work.</td>
                          </tr>
                          <tr className="border-t">
                            <td className="px-3 py-2">Cold / first call / noisy network</td>
                            <td className="px-3 py-2 font-mono">can approach ~1s+</td>
                            <td className="px-3 py-2 text-muted-foreground">Extra JWT mint, integration lookup, or network variance — run the test twice before worrying.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <P>
                      Cold starts happen once every 7 minutes per integration. All subsequent calls within that window hit the warm path.
                    </P>
                  </div>
                )}

                {/* ---- TROUBLESHOOTING ---- */}
                {sectionId === "troubleshooting" && (
                  <div className="space-y-2">
                    <SectionHeading>Troubleshooting</SectionHeading>

                    <SubHeading>401 - Provider auth verification failed</SubHeading>
                    <P>
                      Your request did not include valid authentication. Check that you are sending the correct Bearer token or HMAC signature.
                      For Vapi: ensure the Bearer token matches your TEIKOS integration secret.
                      For Retell: ensure your Retell API key is configured for webhook signing.
                    </P>

                    <SubHeading>403 - Integration is inactive</SubHeading>
                    <P>
                      The integration has been disabled. Go to the Integrations page and re-enable it.
                    </P>

                    <SubHeading>404 - Integration not found</SubHeading>
                    <P>
                      The integration public ID in the URL does not match any active integration.
                      Double-check the URL path and ensure the integration has not been deleted.
                    </P>

                    <SubHeading>400 - No tool calls found in request body</SubHeading>
                    <P>
                      The request body did not contain recognizable tool calls.
                      For Vapi: ensure <code className="text-xs bg-muted px-1 rounded">message.toolCallList</code> is present and non-empty.
                      For Retell: ensure <code className="text-xs bg-muted px-1 rounded">name</code> is present at the top level.
                      For webhook/HTTP: ensure <code className="text-xs bg-muted px-1 rounded">tool_name</code> is present.
                    </P>

                    <SubHeading>RPC returns CONFLICT - Slot not available</SubHeading>
                    <P>
                      Another appointment (held or confirmed) already occupies the requested time slot.
                      Call <code className="text-xs bg-muted px-1 rounded">business_facts_get</code> first for <code className="text-xs bg-muted px-1 rounded">timezone</code>, services, and work hours. Call <code className="text-xs bg-muted px-1 rounded">availability_check</code> with <code className="text-xs bg-muted px-1 rounded">range_start_date</code> / <code className="text-xs bg-muted px-1 rounded">range_end_date</code> (inclusive business days). Use each window&apos;s <code className="text-xs bg-muted px-1 rounded">slot_id</code> for <code className="text-xs bg-muted px-1 rounded">appointment_hold</code>; use <code className="text-xs bg-muted px-1 rounded">speakable_time</code> for what the agent says aloud. Copy-ready tool definitions: <code className="text-xs bg-muted px-1 rounded">integrations/playbooks/vapi-tools-happy-path.json</code>; step-by-step guides: <code className="text-xs bg-muted px-1 rounded">integrations/playbooks/</code>.
                    </P>

                    <SubHeading>RPC returns VALIDATION - start_time must be 15-min aligned</SubHeading>
                    <P>
                      All appointment times must fall on 15-minute boundaries (e.g. :00, :15, :30, :45).
                      Ensure your agent rounds times to the nearest 15-minute mark.
                    </P>

                    <SubHeading>Hold expired before confirm</SubHeading>
                    <P>
                      Holds last 90 seconds. If <code className="text-xs bg-muted px-1 rounded">appointment_confirm</code> is called after expiry, it will return NOT_FOUND.
                      The agent should hold and confirm quickly -- ideally within the same conversation turn.
                    </P>

                    <SubHeading>Secret not shown / lost</SubHeading>
                    <P>
                      Secrets are shown only once at creation time. If you lost it, use <strong>Reveal Secret</strong> on the Integrations page, or <strong>Rotate Secret</strong> to generate a new one (this invalidates the old secret).
                    </P>
                  </div>
                )}

      </CardContent>
    </Card>
  );
}
