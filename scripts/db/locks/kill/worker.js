import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
process.on(
  "message",
  async ({ ip, username, password, dbName, dbPort, sid, serial, instId }) => {
    const connection = await oracledb.getConnection({
      user: username,
      password: password,
      connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${ip})(PORT=${dbPort}))(CONNECT_DATA=(SID=${dbName})))`,
    });
    try {
      await connection.execute(
        `ALTER SYSTEM KILL SESSION '${sid},${serial},@${instId}' IMMEDIATE`,
      );
      // console.log(
      //   `ALTER SYSTEM KILL SESSION '${sid},${serial},@${instId}' IMMEDIATEd`,
      // );
      process.send("killed");
    } catch (err) {
      console.error("worker db/locks/kill error", err);
      process.send("error2");
    } finally {
      await connection.close();
    }
  },
);
