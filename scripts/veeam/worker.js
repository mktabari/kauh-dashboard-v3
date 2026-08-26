import SSH2Promise from "ssh2-promise";
process.on("message", ({ ip, username, password }) => {
  const ssh = new SSH2Promise({
    host: ip,
    username: username,
    password: password,
  });
  try {
    ssh.exec(`powershell;Get-VBRComputerBackupJobSession`).then((data) => {
      data = data.toString("utf-8").split("\r\n");
      let tempCount = 0;
      let output = [];
      let tempObject = {};
      // for (var i = 0; i < data.length; ++i) {
      data.forEach((element) => {
        if (element !== "") {
          let temp = element.split(" : ");
          tempObject[temp[0].replaceAll(" ", "")] = temp[1];
          ++tempCount;
          if (tempCount === 6) {
            tempCount = 0;
            output.push(tempObject);
            tempObject = {};
          }
        }
      });
      process.send(output);
    });
  } catch (err) {
    console.error("worker veeam error", err);
    process.send("error");
  }
});
