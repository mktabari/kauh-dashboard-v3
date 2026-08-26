import SSH2Promise from "ssh2-promise";
process.on("message", async ({ ip, username, password }) => {
  const ssh = new SSH2Promise({
    host: ip,
    username: username,
    password: password,
  });
  try {
    let cpu = await ssh.exec(
      "sar -u|grep -v Av|grep -v SunOS|tr -s ' '| awk '$5 > 0 {print  $1,$5}'",
    );
    let io = await ssh.exec("sar -d");
    process.send({
      cpu: String(cpu),
      io: String(io),
    });
  } catch (err) {
    console.error("worker metrics error", err);
    process.send("error");
  }
});
