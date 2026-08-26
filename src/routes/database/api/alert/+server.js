import SSH2Promise from "ssh2-promise";
import { json } from "@sveltejs/kit";
export const POST = async ({ request }) => {
  const { ip, username, password, dbAlert, action } = await request.json();
  try {
    if (!dbAlert)
      return json({
        data: `No Alert Log File
			
						`,
      });
    const sshconfig = {
      host: ip,
      username: username,
      password: password,
    };
    const conn = new SSH2Promise(sshconfig);
    const encoder = new TextEncoder();
    if (action === "stream") {
      let socket;
      const stream = new ReadableStream({
        start(controller) {
          const start = async () => {
            socket = await conn.spawn(`tail -f ${dbAlert} webStream`);
            socket.on("data", (data) => {
              controller.enqueue(encoder.encode(data));
            });
          };
          start();
        },
        cancel() {
          conn.exec(
            `ps -ef |grep tail|grep -v grep|grep webStream|tr -s ' '|cut -d" " -f 3|xargs kill -9`,
          );
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } else {
      return json({
        data: await new Promise((resolve, reject) => {
          try {
            conn.exec(`tail -100 ${dbAlert}`).then((data) => {
              conn.close();
              resolve(data.toString("utf-8"));
            });
          } catch (error) {
            reject(error);
          }
        }),
      });
    }
  } catch (error) {
    console.error(`Error ${ip} fetching alert log:`, error);
    return json({});
  }
};
