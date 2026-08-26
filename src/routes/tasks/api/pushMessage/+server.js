import { db, eq, and, pushMessageSubscription } from "$lib/DB";

import { json } from "@sveltejs/kit";
import webpush from "web-push";
import { PRIVATE_VAPID_KEY } from "$env/static/private";
import { PUBLIC_VAPID_KEY } from "$env/static/public";

webpush.setVapidDetails(
  "mailto:mktabari@gmail.com",
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY,
);

export async function GET({ request }) {
  // const { subscription, title, body, url } = await request.json();

  // const payload = JSON.stringify({ title, body, url });
  const subscriptions = await db.select().from(pushMessageSubscription);
  try {
    for (const subscription of subscriptions) {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          expirationTime: subscription.expirationTime,
        },
        JSON.stringify({
          title: "title",
          body: "body",
          url: "url",
        }),
      );
    }
    return json({ success: true });
  } catch (error) {
    console.error("Push failed:", error);
    return json({ success: false }, { status: 500 });
  }
}
