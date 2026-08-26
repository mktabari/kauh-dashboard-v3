import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";
export const POST = async ({ request }) => {
  const { ip, username, password, dbName, dbPort } = await request.json();
  const workerPath = await path.resolve("scripts/db/info/worker.js");
  const getData = async (type) => {
    const customPromise = new Promise(async (resolve) => {
      const workerPath = await path.resolve("scripts/db/info/worker.js");
      const worker = fork(workerPath);
      worker.send({ ip, username, password, dbName, dbPort, info: type });
      worker.on("message", (data) => {
        worker.kill();
        resolve(data);
      });
    });
    let result = {};
    result[type] = await customPromise;
    return result;
  };
  let result = await Promise.all([
    getData("size"),
    getData("sga"),
    getData("version"),
    getData("maxSessions"),
    getData("sessions"),
  ]);
  return json({
    ...result.reduce((acc, row) => Object.assign(acc, row), {}),
  });
};
