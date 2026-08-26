import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";

export const POST = async ({ request }) => {
  const { ip, brand, username, password } = await request.json();
  const worker = fork(path.resolve("scripts/time/worker.js"));
  return json({
    result: await new Promise((resolve) => {
      worker.send({ ip, brand, username, password });
      worker.on("message", (data) => {
        worker.kill();
        resolve(data);
      });
    }),
  });
};
