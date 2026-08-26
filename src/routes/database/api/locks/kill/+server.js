import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";
export const POST = async ({ request }) => {
  // const { ip, username, password, bkpdir } = await request.json();
  const { ip, username, password, dbName, dbPort, sid, serial, instId } =
    await request.json();
  return json({
    data: await new Promise((resolve) => {
      const workerPath = path.resolve("scripts/db/locks/kill/worker.js");
      const worker = fork(workerPath);
      try {
        // worker.send({ ip, username, password, bkpdir });
        worker.send({
          ip,
          username,
          password,
          dbName,
          dbPort,
          sid,
          serial,
          instId,
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
  });
};
