import { db, eq, and, pushMessageSubscription } from "$lib/DB";
import { json } from "@sveltejs/kit";

export const POST = async ({ request }) => {
  const subscription = await request.json();

  await db
    .delete(pushMessageSubscription)
    .where(
      and(
        eq(pushMessageSubscription.endpoint, subscription.endpoint),
        eq(pushMessageSubscription.p256dh, subscription.keys.p256dh),
        eq(pushMessageSubscription.auth, subscription.keys.auth),
      ),
    );

  return json({});
};
