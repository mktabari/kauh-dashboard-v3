import SSH2Promise from "ssh2-promise";
import { json } from "@sveltejs/kit";
export const POST = async ({ request }) => {
  const { ip, username, password } = await request.json();
  const sshconfig = {
    host: ip,
    username: username,
    password: password,
  };
  const conn = new SSH2Promise(sshconfig);
  try {
    const stream = new ReadableStream({
      start(controller) {
        conn.spawn("sh ./ERPstopDB.sh").then((socket) => {
          socket
            .on("data", (data) => {
              controller.enqueue(data.toString("utf-8"));
            })
            .on("end", () => {
              controller.close();
              conn.close();
            });
        });
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error("Error erp/api/stopDB:", error);
    conn?.close();
    return json({});
  }
};
