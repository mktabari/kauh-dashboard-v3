import { dev } from "$app/environment";
import { db, eq, serversList } from "$lib/DB";
import SSH2Promise from "ssh2-promise";
let servers;
const connections = new Map();
export const socket = {
  async upgrade(req) {
    if (dev) console.log("upgrade");

    servers = await db
      .select()
      .from(serversList)
      .where(eq(serversList.id, req.params.id));
  },

  async open(peer) {
    if (dev) console.log("open");

    peer.send(String(servers[0].name + " " + servers[0].ip));
    let ssh = new SSH2Promise({
      host: servers[0].ip,
      username: servers[0].username,
      password: servers[0].password,
    });
    let shell = await ssh.shell();
    shell.on("data", (data) => {
      peer.send(String(data));
    });
    connections.set(peer, { ssh, shell });
  },

  message(peer, message) {
    const connection = connections.get(peer);
    connection.shell.write(String(message));
  },

  close(peer, event) {
    if (dev) console.log("close");

    const connection = connections.get(peer);
    connection.shell?.write("exit\n");
    connection.shell?.end();
    connection.ssh?.close();
    connections.delete(peer);
  },

  error(peer, error) {
    const connection = connections.get(peer);
    console.error("terminal ws error", error);
    connection.shell?.write("exit\n");
    connection.shell?.end();
    connection.ssh?.close();
    connections.delete(peer);
  },
};
