import { db, eq, serversList } from "$lib/DB";
import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";
export const GET = async (requwstEvent) => {
  const { params } = requwstEvent;
  const { serverId } = params;
  const server = await db
    .select()
    .from(serversList)
    .where(eq(serversList.id, serverId));
  const { ip, username, password, brand } = server[0];
  if (ip && username && password && brand && brand !== "dell") {
    return json({
      memory: await new Promise((resolve) => {
        const workerPath = path.resolve("scripts/memory/worker.js");
        const worker = fork(workerPath);
        try {
          worker.send({ ip, username, password, brand });
          worker.on("message", async (data) => {
            worker.kill();
            await db
              .update(serversList)
              .set({ memory: data })
              .where(eq(serversList.id, serverId));
            resolve(data);
          });
        } catch (err) {
          worker.kill();
          resolve("error");
        }
      }),
    });
  } else {
    return json({ memory: "error" });
  }
};
