import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
process.on(
  "message",
  async ({ ip, username, password, dbName, dbPort, sqlID }) => {
    const connection = await oracledb.getConnection({
      user: username,
      password: password,
      connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${ip})(PORT=${dbPort}))(CONNECT_DATA=(SID=${dbName})))`,
    });
    try {
      let result =
        await connection.execute(`select round(sum(BYTES)/1024/1024/1024) BYTES
                                  from dba_data_files`);
      process.send(result.rows);
    } catch (err) {
      console.error("worker db/size error", err);
      process.send("error2");
    } finally {
      await connection.close();
    }
  },
);
