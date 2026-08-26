import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";
import { db, eq, ne, and, serversList } from "$lib/DB";
export const GET = async ({ request, setHeaders, params }) => {
  setHeaders({ "Cache-Control": "public, max-age=1800" });
  const { id } = params;
  const servers = await db
    .select(serversList)
    .from(serversList)
    .where(and(eq(serversList.deleteFlag, "0"), eq(serversList.id, id)));
  const worker = fork(path.resolve("scripts/veeam/worker.js"));
  return json({
    result: await new Promise((resolve) => {
      worker.send({
        ip: servers[0].ip,
        username: servers[0].username,
        password: servers[0].password,
      });
      worker.on("message", (data) => {
        worker.kill();
        resolve(data);
      });
    }),
  });
};
