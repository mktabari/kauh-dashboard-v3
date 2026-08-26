import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
process.on("message", async ({ ip, username, password, dbName, dbPort }) => {
  const connection = await oracledb.getConnection({
    user: username,
    password: password,
    connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${ip})(PORT=${dbPort}))(CONNECT_DATA=(SID=${dbName})))`,
  });
  try {
    let output;
    let version = await connection.execute(`SELECT version FROM v$instance`);
    if (version.rows[0].VERSION.startsWith("9.2")) {
      let result1 = await connection.execute(
        `select a.START_TIME,a.COMPLETION_TIME from v$backup_set a
where a.START_TIME>trunc(sysdate)-10
order by a.START_TIME `,
      );
      result1.rows.forEach((element, i, arr) => {
        if (i === 0) {
          element.group = 0;
          return;
        }
        if (
          new Date(element.START_TIME) - new Date(arr[i - 1].COMPLETION_TIME) <
          30 * 1000
        ) {
          element.group = arr[i - 1].group;
        } else {
          element.group = i;
        }
      });
      let result2 = [];
      result1.rows.forEach((element) => {
        if (!result2[element.group]) {
          result2[element.group] = {
            START_TIME: element.START_TIME,
            END_TIME: element.COMPLETION_TIME,
          };
        } else {
          result2[element.group].END_TIME = element.COMPLETION_TIME;
        }
      });
      output = result2
        .filter((element) => element !== undefined)
        .map((element) => {
          return {
            START_TIME: element.START_TIME,
            END_TIME: element.END_TIME,
            STATUS: "N/A",
            OUTPUT_BYTES_DISPLAY: "N/A",
          };
        })
        .sort((a, b) => new Date(b.END_TIME) - new Date(a.END_TIME));
    } else {
      let result = await connection.execute(
        `SELECT  STATUS, START_TIME, END_TIME,TIME_TAKEN_DISPLAY,  OUTPUT_BYTES_DISPLAY
FROM V$RMAN_BACKUP_JOB_DETAILS
WHERE START_TIME > SYSDATE - 10
ORDER BY START_TIME DESC`,
      );
      output = result.rows;
    }
    process.send(output);
  } catch (err) {
    console.error("worker db/backups error", err);
    process.send("error2");
  } finally {
    await connection.close();
  }
});
