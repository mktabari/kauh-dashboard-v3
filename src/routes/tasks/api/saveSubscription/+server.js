import { db, eq, pushMessageSubscription } from "$lib/DB";
import { json } from "@sveltejs/kit";

export const POST = async ({ request }) => {
  const subscription = await request.json();

  const [subscriptionId] = await db
    .insert(pushMessageSubscription)
    .values({
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      expirationTime: subscription.expirationTime,
      subsecription: JSON.stringify(subscription),
    })
    .returning();

  return json({ id: subscriptionId.id });
};
