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
    let result = await connection.execute(`select d.*,
       s.SQL_TEXT
       /*,
       to_char(s.last_active_time, 'rrrr-mm-dd hh24:mi') last_active_time,
       s.EXECUTIONS,
      to_char(to_date(s.FIRST_LOAD_TIME, 'rrrr-mm-dd/hh24:mi:ss'), 'rrrr-mm-dd hh24:mi') FIRST_LOAD_TIME,
      s.last_active_time - to_date(s.FIRST_LOAD_TIME, 'rrrr-mm-dd/hh24:mi:ss') date_diff*/
  from v$sqlarea s,
       (select a.SQL_ID,
               count(*) EXE,
               round(avg(a.CPU_TIME * power(10, -6)), 2) CPU_AVG,
               round(sum(a.CPU_TIME * power(10, -6)), 2) CPU_TOT,
               round(avg(a.USER_IO_WAIT_TIME * power(10, -6)), 2) IO_AVG,
               round(sum(a.USER_IO_WAIT_TIME * power(10, -6)), 2) IO_TOT,
               round(avg(a.ELAPSED_TIME * power(10, -6)), 2) ELA_AVG,
               round(sum(a.ELAPSED_TIME * power(10, -6)), 2) ELA_TOT
          from V$SQL_MONITOR a
         group by a.SQL_ID) d
 where d.SQL_ID = s.SQL_ID
 order by 8 desc`);
    process.send(result.rows);
  } catch (err) {
    console.error("worker db/currentSql error", err);
    process.send("error2");
  } finally {
    await connection.close();
  }
});
