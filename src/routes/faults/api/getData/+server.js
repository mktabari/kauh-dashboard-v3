import { db, eq, ne, and, serversList, tags, server_Tags } from "$lib/DB";
import { json } from "@sveltejs/kit";
import { fork } from "child_process";
import path from "path";

export const GET = async ({ request, setHeaders }) => {
  setHeaders({ "Cache-Control": "public, max-age=300" });
  const san = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(and(eq(serversList.deleteFlag, "0"), eq(tags.name, "SAN")));
  const ovs = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(and(eq(serversList.deleteFlag, "0"), eq(tags.name, "OVS")));
  const checkSan = async (server) => {
    const { ip, username, password } = server;
    const sanWorker = fork(path.resolve("scripts/faults/san/worker.js"));
    return {
      name: server.name,
      result: await new Promise((resolve) => {
        sanWorker.send({ ip, username, password });
        sanWorker.on("message", (data) => {
          sanWorker.kill();
          resolve(data);
        });
      }),
    };
  };
  const checkOvs = async (server) => {
    const { ip, username, password } = server;
    const ovsWorker = fork(path.resolve("scripts/faults/ovs/worker.js"));
    return {
      name: server.name,
      result: await new Promise((resolve) => {
        ovsWorker.send({ ip, username, password });
        ovsWorker.on("message", (data) => {
          ovsWorker.kill();
          resolve(data);
        });
      }),
    };
  };

  const SANs = san.map((server) => checkSan(server));
  const OVSs = ovs.map((server) => checkOvs(server));

  return json({
    san: await Promise.all(SANs),
    ovs: await Promise.all(OVSs),
  });
};
