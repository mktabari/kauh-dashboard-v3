import { json } from "@sveltejs/kit";
import pm2 from "pm2";

export async function GET({ params }) {
  const { action } = params; // 'kill' or 'restart'

  pm2.connect((err) => {
    if (err) return;

    // Send an IPC message to ALL PM2 instances running your app name
    pm2.sendDataToProcessId(
      "0",
      {
        type: "process:msg",
        topic: "cron-control",
        data: {
          command: action, // 'kill' or 'restart'
        },
      },
      (err, res) => {
        pm2.disconnect();
      },
    );
  });

  return json({ success: true, message: "Broadcast sent to all instances" });
}
