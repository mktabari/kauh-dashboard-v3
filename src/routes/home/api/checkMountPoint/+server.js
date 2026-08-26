import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";

export const POST = async ({ request }) => {
  const { ip, username, password, mountPoint } = await request.json();
  const worker = fork(path.resolve("scripts/mountPoint/worker.js"));
  return json({
    result: await new Promise((resolve) => {
      worker.send({ ip, username, password, mountPoint });
      worker.on("message", (data) => {
        worker.kill();
        resolve(data);
      });
    }),
  });
};
