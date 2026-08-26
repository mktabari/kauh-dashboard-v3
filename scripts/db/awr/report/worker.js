import SSH2Promise from "ssh2-promise";
process.on(
  "message",
  ({ ip, username, password, reportType, startSnapId, endSnapId }) => {
    const conn = new SSH2Promise({
      host: ip,
      username: username,
      password: password,
    });
    try {
      if (reportType === "awr") {
        conn
          .exec(
            `su - oracle -c "/export/oracle/awr_generate.sh ${startSnapId} ${endSnapId}"`,
          )
          .then((data1) => {
            conn.exec(`cat /export/oracle/awr-rep.html`).then((data) => {
              conn.close();
              process.send(
                data
                  .toString("utf-8")
                  .trim()
                  .replace("\n", "")
                  .replace("\r", ""),
              );
            });
          });
      } else {
        conn
          .exec(
            `su - oracle -c "/export/oracle/addm_generate.sh ${startSnapId} ${endSnapId}"`,
          )
          .then((data1) => {
            conn.exec(`cat /export/oracle/addm-rep.txt`).then((data) => {
              conn.close();
              process.send(data.toString("utf-8").trim());
            });
          });
      }
    } catch (error) {
      console.error("worker db/awr/report error", error);
      process.send("error2");
    }
  },
);
