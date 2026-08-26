import SSH2Promise from "ssh2-promise";
import { json } from "@sveltejs/kit";
export const POST = async ({ request }) => {
  const { ip, username, password, dbAlert } = await request.json();
  const sshconfig = {
    host: ip,
    username: username,
    password: password,
  };
  const conn = new SSH2Promise(sshconfig);
  try {
    await conn
      .exec(
        `tail -50 ${dbAlert} | grep "Active call for process"|awk '{ print $5}'`,
      )
      .then((data) => {
        let processlist = data.toString("utf-8").split(/\r?\n/).join(" ");

        if (processlist) {
          conn.exec(`kill -9 ${processlist}`);
        }
      });

    conn.close();
    return json({
      apiData: "done",
    });
  } catch (error) {
    console.error("Error killing active process:", error);
    conn?.close();
    return json({});
  }
};
