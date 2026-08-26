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
a.TABLESPACE_NAME,
count(*) nof,
round(sum(a.BYTES) / 1024 / 1024 / 1024) BYTES,
round(sum(decode(a.AUTOEXTENSIBLE, 'NO', a.BYTES, a.MAXBYTES)) / 1024 / 1024 / 1024) maxbytes,
round(100 * sum(a.BYTES) /
      sum(decode(a.AUTOEXTENSIBLE, 'NO', a.BYTES, a.MAXBYTES))) percent,
(sum(decode(a.AUTOEXTENSIBLE, 'NO', a.BYTES, a.MAXBYTES)) -
sum(a.BYTES)) / 1024 / 1024 / 1024 remaining
from dba_data_files a
group by a.TABLESPACE_NAME
order by sum(a.BYTES) desc`,
    );
    process.send(result.rows);
  } catch (err) {
    console.error("worker db/ts error", err);
    process.send("error2");
  } finally {
    await connection.close();
  }
});
