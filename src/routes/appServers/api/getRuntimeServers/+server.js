import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";
export const POST = async ({ request }) => {
  // const { ip, username, password, bkpdir } = await request.json();
  const { ip, username, password, url } = await request.json();
  return json(
    await new Promise((resolve) => {
      const workerPath = path.resolve("scripts/as/getRuntimeServers/worker.js");
      const worker = fork(workerPath);
      try {
        // worker.send({ ip, username, password, bkpdir });
        worker.send({
          ip,
          username,
          password,
          url,
        });
        worker.on("message", async (data) => {
          worker.kill();
          resolve(data);
        });
      } catch (err) {
        worker.kill();
        resolve("error1");
      }
    }),
  );
};
