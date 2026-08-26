import SSH2Promise from "ssh2-promise";
process.on("message", ({ ip, username, password, brand }) => {
  const ssh = new SSH2Promise({
    host: ip,
    username: username,
    password: password,
  });
  let serverMem;
  let getMemoryCommand;
  switch (brand) {
    case "windows":
      getMemoryCommand = 'systeminfo | findstr /C:"Total Physical Memory"';
      break;
    case "linux":
      getMemoryCommand = "grep MemTotal /proc/meminfo";
      break;
    default:
      getMemoryCommand = "prtconf | grep Mem";
  }

  try {
    ssh.exec(getMemoryCommand).then((data) => {
      serverMem = data
        .toString("utf-8")
        .trim()
        .replace("\n", "")
        .replace("\r", "");
      switch (brand) {
        case "windows":
          serverMem = serverMem.split(" ");
          serverMem = serverMem[serverMem.length - 2];
          process.send(
            (parseInt(serverMem.replace(",", "")) / 1024)
              .toFixed(2)
              .replace(".00", ""),
          );

          break;
        case "linux":
          serverMem = serverMem.split(" ");
          serverMem = serverMem[serverMem.length - 2];
          process.send(
            (parseInt(serverMem) / 1024 / 1024).toFixed(2).replace(".00", ""),
          );

          break;
        default:
          serverMem = serverMem.split(" ")[2];
          process.send((serverMem / 1024).toFixed(2).replace(".00", ""));
      }
    });
  } catch (err) {
    console.error("worker memory error", err);
    process.send(false);
  }
});
