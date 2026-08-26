import SSH2Promise from "ssh2-promise";
process.on("message", ({ ip, brand, username, password }) => {
  const ssh = new SSH2Promise({
    host: ip,
    username: username,
    password: password,
  });
  let getDateTime;
  switch (brand) {
    case "windows":
      getDateTime =
        'c:/Windows/System32/WindowsPowerShell/v1.0/powershell get-date -format "{dd/MM/yyyy HH:mm:ss}"';
      break;
    default:
      getDateTime = "date '+%d/%m/%Y %H:%M:%S'";
  }
  try {
    ssh.exec(getDateTime).then((data) => {
      process.send(data.toString("utf-8").replace("\n", "").replace("\r", ""));
    });
  } catch (err) {
    console.error("worker time error", err);
    process.send("error");
  }
});
