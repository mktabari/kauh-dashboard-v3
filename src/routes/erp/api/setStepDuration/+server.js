import { json } from "@sveltejs/kit";
import { db, erpLogs } from "$lib/DB";
export const POST = async ({ request }) => {
  const { step, duration } = await request.json();

  await db.insert(erpLogs).values({ step, duration });
  return json({});
};
