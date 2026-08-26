import { db, eq, taskSubscription } from "$lib/DB";
import { json } from "@sveltejs/kit";

export const POST = async ({ request }) => {
  const subscription = await request.json();

  const [taskSsubscriptionId] = await db
    .insert(taskSubscription)
    .values({
      taskId: subscription.taskId,
      subscriptionId: subscription.subscriptionId,
    })
    .returning();

  return json({ id: taskSsubscriptionId.id });
};
