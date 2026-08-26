import { db, eq, taskSubscription } from "$lib/DB";
import { json } from "@sveltejs/kit";

export const POST = async ({ request }) => {
  const subscription = await request.json();

  await db
    .delete(taskSubscription)
    .where(eq(taskSubscription.id, subscription.id));
  return json({});
};
