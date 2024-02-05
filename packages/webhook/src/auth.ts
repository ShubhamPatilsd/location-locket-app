import { prisma } from "@memoir/db";
import { type IncomingHttpHeaders } from "http";
import { Webhook, type WebhookRequiredHeaders } from "svix";

const webhookSecret = process.env.WEBHOOK_SECRET as string;
type EventType = "user.created" | "user.updated" | "user.deleted";

type Event = {
  data: Data;
  object: "event";
  type: EventType;
};

interface Data {
  id: string;

  first_name: string;
  last_name: string;
  image_url: string;
  gender: string;

  birthday: string;
  created_at: number;
  external_id: string;

  profile_image_url: string;
  updated_at: number;
}

export const authWebhook = async (
  payload: unknown,
  headersList: IncomingHttpHeaders,
): Promise<{ code: number; msg: string }> => {
  const heads: IncomingHttpHeaders = {
    "svix-id": headersList["svix-id"],
    "svix-timestamp": headersList["svix-timestamp"],
    "svix-signature": headersList["svix-signature"],
  };
  const wh = new Webhook(webhookSecret);
  let evt: Event | null = null;

  try {
    evt = wh.verify(
      JSON.stringify(payload),
      heads as IncomingHttpHeaders & WebhookRequiredHeaders,
    ) as Event;
  } catch (err) {
    console.error((err as Error).message);
    return { code: 400, msg: "verify error" };
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, ...attr } = evt.data;

    await prisma.user.upsert({
      where: { id: id },
      create: {
        id: id,
        email: attr.external_id,
        firstName: attr.first_name,
        lastName: attr.last_name,
        profilePicture: attr.profile_image_url,
      },
      update: {
        email: attr.external_id,
        firstName: attr.first_name,
        lastName: attr.last_name,
        profilePicture: attr.profile_image_url,
      },
    });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    await prisma.user.delete({ where: { id: id } });
  }

  return { code: 200, msg: "done" };
};
