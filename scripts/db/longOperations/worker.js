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
    let result = await connection.execute(
      `select 
       l.sid||'-'||l.serial#  id,
       l.SID,s.SQL_ID,
       s.username,
       l.OPNAME,
       s.machine,
       l.TOTALWORK,
       l.TARGET,
       round(100 * l.SOFAR / l.TOTALWORK)  Percent,
       SUBSTR('0' || TRUNC(MOD(l.TIME_REMAINING, 86400) / 3600), -2, 2) || ':' ||
       SUBSTR('0' || TRUNC(MOD(MOD(l.TIME_REMAINING, 86400), 3600) / 60),
              -2,
              2) || ':' ||
       SUBSTR('0' || MOD(MOD(MOD(l.TIME_REMAINING, 86400), 3600), 60),
              -2,
              2) Time_Remaining
  from v$session_longops l,v$session s
 where l.SOFAR <> l.TOTALWORK
 and   s.SID=l.SID
 and  TOTALWORK<>0
`,
    );
    process.send(result.rows);
  } catch (err) {
    console.error("worker db/longOperations error", err);
    process.send("error2");
  } finally {
    await connection.close();
  }
});
