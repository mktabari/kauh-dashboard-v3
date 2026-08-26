import SSH2Promise from "ssh2-promise";
process.on(
  "message",
  ({ ip, username, password, drInstance, dbName, action }) => {
    const ssh = new SSH2Promise({
      host: ip,
      username: username,
      password: password,
    });
    let drAction;
    try {
      switch (action) {
        case "start":
          drAction = `su - oracle -c "echo EDIT DATABASE ${dbName} SET STATE=TRANSPORT-ON | /oracle/app/oracle/product/11.2.0/bin/dgmgrl / "`;
          break;
        case "stop":
          drAction = `su - oracle -c "echo EDIT DATABASE ${dbName} SET STATE=TRANSPORT-OFF | /oracle/app/oracle/product/11.2.0/bin/dgmgrl / "`;
          break;
        default:
          drAction = `su - oracle -c "echo show database ${drInstance} | /oracle/app/oracle/product/11.2.0/bin/dgmgrl /"`;
      }
      ssh.exec(drAction).then((data) => {
        process.send(data.toString("utf-8"));
      });
    } catch (err) {
      console.error("worker dr error", err);
      process.send("error");
    }
  },
);
