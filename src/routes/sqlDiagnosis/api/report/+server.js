import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";
export const POST = async ({ request }) => {
  // const { ip, username, password, bkpdir } = await request.json();
  const { ip, username, password, reportType, startSnapId, endSnapId } =
    await request.json();
  return json({
    report: await new Promise((resolve) => {
      const workerPath = path.resolve("scripts/db/awr/report/worker.js");
      const worker = fork(workerPath);
      try {
        // worker.send({ ip, username, password, bkpdir });
        worker.send({
          ip,
          username,
          password,
          reportType,
          startSnapId,
          endSnapId,
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
