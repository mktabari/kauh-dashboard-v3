import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";
export const POST = async ({ request, setHeaders }) => {
  setHeaders({ "Cache-Control": "public, max-age=300" });
  const { ip, username, password, dbName, dbPort } = await request.json();
  return json({
    data: await new Promise((resolve) => {
      const workerPath = path.resolve("scripts/db/backups/worker.js");
      const worker = fork(workerPath);
      try {
        // worker.send({ ip, username, password, bkpdir });
        worker.send({ ip, username, password, dbName, dbPort });
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
