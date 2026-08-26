import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";

export const POST = async ({ request }) => {
  const { ip, username, password, drInstance, action } = await request.json();
  const worker = fork(path.resolve("scripts/dr/worker.js"));
  return json({
    data: await new Promise((resolve) => {
      worker.send({ ip, username, password, drInstance, action });
      worker.on("message", (data) => {
        worker.kill();
        resolve(data);
      });
    }),
  });
};
