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
      `select a.MACHINE,count(*) connections
from v$session a 
group by a.MACHINE
having count(*)>10
order by count(*) desc`,
    );
    process.send(result.rows);
  } catch (err) {
    console.error("worker db/machines error", err);
    process.send("error2");
  } finally {
    await connection.close();
  }
});
