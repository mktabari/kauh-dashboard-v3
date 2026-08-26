import SSH2Promise from "ssh2-promise";
process.on("message", ({ ip, brand, username, password, dateTime }) => {
  const ssh = new SSH2Promise({
    host: ip,
    username: username,
    password: password,
  });
  let setDateTime;
  switch (brand) {
    case "windows":
      setDateTime = `c:/Windows/System32/WindowsPowerShell/v1.0/powershell Set-Date -Date "${new Date().getFullYear()}-${
        dateTime[0]
      }${dateTime[1]}-${dateTime[2]}${dateTime[3]}T${dateTime[4]}${dateTime[5]}:${dateTime[6]}${
        dateTime[7]
      }"`;
      break;
    default:
      setDateTime = "date " + dateTime;
  }

  try {
    ssh.exec(setDateTime).then((data) => {
      process.send(data.toString("utf-8").replace("\n", "").replace("\r", ""));
    });
  } catch (err) {
    console.error("worker setTime error", err);
    process.send("error");
  }
});
