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
      `select * from (SELECT s.sid,s.SERIAL# SERIAL, s.username, s.program,s.MACHINE,i.block_changes,s.SQL_ID
FROM v$session s, v$sess_io i
WHERE s.sid = i.sid
ORDER BY 6 desc)
where rownum <= 20
`,
    );
    process.send(result.rows);
  } catch (err) {
    console.error("worker db/blockChange error", err);
    process.send("error2");
  } finally {
    await connection.close();
  }
});
