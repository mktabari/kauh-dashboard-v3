import SSH2Promise from "ssh2-promise";
process.on("message", ({ ip, username, password, mountPoint }) => {
  const ssh = new SSH2Promise({
    host: ip,
    username: username,
    password: password,
  });

  try {
    ssh
      .exec(
        `df -h ${mountPoint} |grep -v Filesystem|tr -s ' '|cut -d" " -f 1,2,5,6`,
      )
      .then((data) => {
        data = data
          .toString("utf-8")
          .split("\n")
          .filter((line) => line !== "");
        process.send(data);
      });
  } catch (err) {
    console.error("worker mountPoint error", err);
    process.send("error");
  }
});
