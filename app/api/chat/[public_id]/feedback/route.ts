import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const feedbackSchema = z.object({
  message_id: z.string(),
  feedback: z.enum(["up", "down"]),
  note: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { public_id: string } }
) {
  try {
    const json = await request.json();
    const parsed = feedbackSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { message_id, feedback, note } = parsed.data;
    const supabase = createAdminClient();

    await supabase
      .from("messages")
      .update({ feedback })
      .eq("id", message_id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
