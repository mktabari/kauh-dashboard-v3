import { db, eq, and, serversList, tags, server_Tags } from "$lib/DB";
import SSH2Promise from "ssh2-promise";
import { dev } from "$app/environment";
const connections = new Map();
let sshs = [];
let servers = [];
let intervalId;
const startSshs = async () => {
  if (dev) console.log("startSshs");
  servers = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(
      and(
        eq(serversList.brand, "oracle"),
        eq(serversList.deleteFlag, "0"),
        eq(tags.name, "METRICS"),
      ),
    );
  sshs = await Promise.all(
    servers.map((server) => {
      try {
        return {
          server: server.name,
          ssh: new SSH2Promise({
            host: server.ip,
            username: server.username,
            password: server.password,
          }),
        };
      } catch (error) {
        console.error("ws startSshs error", error);
      }
    }),
  );
};
const closeSshs = () => {
  for (let element of sshs) {
    element.ssh.close();
  }
  sshs = [];
  servers = [];
  if (dev) console.log("close");
};
const getData = async (element) => {
  const customPromise = new Promise(async (resolve) => {
    try {
      if (!element.ssh) return;
      let cpu = await element.ssh.exec(
        "sar -u 1|tail -1|tr -s ' '|awk '{print $NF}'",
      );
      let io = await element.ssh.exec("sar -d 1 | awk '$2 > 0 {print  $2}'");
      if (dev) console.log(io.split("\n").filter((item) => !isNaN(item)));
      resolve({
        server: element.server,
        cpu: Number(String(cpu.replace("\n", ""))),
        io: Number(
          String(Math.max(...io.split("\n").filter((item) => !isNaN(item)))),
        ),
        date: new Date(),
      });
    } catch (error) {
      console.error("ws getData error", error);
      resolve({});
    }
  });
  return await customPromise;
};
const sendMetrics = async () => {
  let data = await Promise.all(sshs.map((element) => getData(element)));
  if (dev) console.log("sendMetrics", data);
  connections.forEach((value, key) => {
    key.send(JSON.stringify(data));
  });
};
const removePeer = (peer) => {
  connections.delete(peer);
  if (connections.size > 0) return;
  closeSshs();
  clearInterval(intervalId);
  intervalId = null;
};
const startInterval = () => {
  startSshs();
  intervalId = setInterval(async () => {
    sendMetrics();
  }, 5000);
};
export const socket = {
  async upgrade(req) {},
  async open(peer) {
    connections.set(peer);
    if (!intervalId) startInterval();
  },
  message(peer, message) {},
  close(peer, event) {
    removePeer(peer);
  },
  error(peer, error) {
    console.error("we got an error", error);
    removePeer(peer);
  },
};
