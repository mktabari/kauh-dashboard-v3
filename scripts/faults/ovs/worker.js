import SSH2Promise from "ssh2-promise";
process.on("message", ({ ip, username, password }) => {
  const sshconfig = {
    host: ip,
    username: username,
    password: password,
  };
  const conn = new SSH2Promise(sshconfig);

  try {
    conn.exec("fmadm faulty").then((data) => {
      conn.close();
      // process.send(
      //   parseInt(
      //     data.toString("utf-8").replace("\n", "").replace("\r", "").trim(),
      //   ) > 0
      //     ? "faulty"
      //     : null,
      // );
      process.send(String(data));
    });
  } catch (err) {
    console.error("worker faults/ovs error", err);
    process.send("error");
  }
});
