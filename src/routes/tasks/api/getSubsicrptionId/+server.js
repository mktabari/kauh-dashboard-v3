import { db, eq, pushMessageSubscription } from "$lib/DB";
import { json } from "@sveltejs/kit";

export const POST = async ({ request }) => {
  const subscription = await request.json();

  const Subscription = await db
    .select(pushMessageSubscription)
    .from(pushMessageSubscription)
    .where(
      eq(pushMessageSubscription.subsecription, JSON.stringify(subscription)),
    );
  // console.log(Subscription);

  return json({ id: Subscription[0]?.id });
};
