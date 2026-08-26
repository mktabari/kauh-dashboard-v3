import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";
export const GET = async ({ params }) => {
  const { ip } = params;
  if (ip) {
    return json({
      isAlive: await new Promise((resolve) => {
        const workerPath = path.resolve("scripts/ping/worker.js");
        const worker = fork(workerPath);
        try {
          worker.send(ip);
          worker.on("message", (data) => {
            worker.kill();
            resolve(data);
          });
        } catch (err) {
          worker.kill();
          resolve(false);
        }
      }),
    });
  }
  return json({ isAlive: "No Ip Address" });
};
