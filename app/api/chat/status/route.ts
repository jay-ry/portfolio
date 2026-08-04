/**
 * GET /api/chat/status — cheap capability probe for the chat UI.
 *
 * Lets the AI GUIDE section decide whether to render an input box or an
 * "offline" placeholder without firing a real completion first.
 *
 * Intentionally says almost nothing: no provider name, no model, no hostname,
 * no key state, no usage counters, no error text. Just whether the guide can
 * answer. Makes no upstream call.
 */

import { isChatConfigured } from "@/lib/chat/env";
import type { ChatStatusResponse } from "@/lib/chat/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const available = isChatConfigured();

  const body: ChatStatusResponse = {
    available,
    mode: available ? "live" : "offline",
  };

  return Response.json(body, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
