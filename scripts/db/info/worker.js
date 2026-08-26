import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
process.on(
  "message",
  async ({ ip, username, password, dbName, dbPort, info }) => {
    const connection = await oracledb.getConnection({
      user: username,
      password: password,
      connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${ip})(PORT=${dbPort}))(CONNECT_DATA=(SID=${dbName})))`,
    });
    try {
      if (info === "size") {
        let result = await connection.execute(
          `select round(sum(BYTES)/1024/1024/1024) BYTES from dba_data_files`,
        );
        process.send(result.rows[0].BYTES);
      } else if (info === "sga") {
        let result = await connection.execute(
          `SELECT round(sum(value) / 1024 / 1024 / 1024, 2)  SGA  FROM v$sga`,
        );
        process.send(result.rows[0].SGA);
      } else if (info === "version") {
        let result = await connection.execute(`SELECT VERSION FROM V$INSTANCE`);
        process.send(result.rows[0].VERSION);
      } else if (info === "maxSessions") {
        let result = await connection.execute(
          `select VALUE from v$parameter where name = 'sessions'`,
        );
        process.send(result.rows[0].VALUE);
      } else if (info === "sessions") {
        let result = await connection.execute(
          `select STATUS,count(*) count from v$session  group by STATUS`,
        );
        process.send({
          current: result.rows.reduce((acc, row) => {
            acc += row.COUNT;
            return acc;
          }, 0),
          active: result.rows.find((row) => row.STATUS === "ACTIVE").COUNT,
        });
      }
    } catch (err) {
      console.error("worker db/info error", err);
      process.send("error");
    } finally {
      await connection.close();
    }
  },
);
