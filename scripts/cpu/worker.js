import SSH2Promise from "ssh2-promise";
process.on("message", ({ ip, username, password, brand }) => {
  const ssh = new SSH2Promise({
    host: ip,
    username: username,
    password: password,
  });
  let serverCpu;
  let getCpuCommand;
  switch (brand) {
    case "windows":
      getCpuCommand = "wmic cpu get  numberofcores";
      break;
    case "linux":
      getCpuCommand = "grep -c ^processor /proc/cpuinfo";
      //getCpu = 'whoami';
      break;
    default:
      getCpuCommand = "prtdiag|grep on-line|wc -l";
  }
  try {
    ssh.exec(getCpuCommand).then((data) => {
      serverCpu = data.toString("utf-8").replace("\n", "");
      switch (brand) {
        case "windows":
          serverCpu = serverCpu.split("\r");
          serverCpu = serverCpu[2].trim();
          process.send(serverCpu);
          break;
        default:
          process.send(serverCpu.trim());
      }
    });
  } catch (err) {
    console.error("worker cpu error", err);
    process.send(false);
  }
});
