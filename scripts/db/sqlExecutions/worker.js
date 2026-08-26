import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
process.on(
  "message",
  async ({ ip, username, password, dbName, dbPort, sql_id }) => {
    const connection = await oracledb.getConnection({
      user: username,
      password: password,
      connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${ip})(PORT=${dbPort}))(CONNECT_DATA=(SID=${dbName})))`,
    });
    try {
      let result = await connection.execute(
        `select * 
        from (select a.sql_id,
              a.SQL_EXEC_ID,
              a.SQL_EXEC_START,
              a.MODULE,
              a.PROGRAM,
              a.USERNAME,
              trunc(a.CPU_TIME / 1000000) cpu,
              trunc(a.ELAPSED_TIME / 1000000) ELAPSED,
              trunc(a.USER_IO_WAIT_TIME / 1000000) io
          from gv$sql_monitor a
        where a.SQL_ID = :sql_id
        order by 3 desc)
        where rownum <= 10`,
        { sql_id },
      );
      process.send(result.rows);
    } catch (err) {
      console.error("worker db/sqlExecutions error", err);
      process.send("error2");
    } finally {
      await connection.close();
    }
  },
);
