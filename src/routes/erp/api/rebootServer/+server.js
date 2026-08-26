import SSH2Promise from "ssh2-promise";
import { json } from "@sveltejs/kit";
export const POST = async ({ request }) => {
  const { ip, username, password } = await request.json();
  const sshconfig = {
    host: ip,
    username: username,
    password: password,
  };
  const conn = new SSH2Promise(sshconfig);
  try {
    await conn.exec(`reboot`);
    conn?.close();
    return json({
      apiData: "done",
    });
  } catch (error) {
    console.error("Error erp/api/rebootServer:", error);
    conn?.close();
    return json({});
  }
};
