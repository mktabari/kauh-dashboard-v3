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
      ` select snap_id SNAPID,
        to_char(begin_interval_time, 'rrrr/mm/dd hh24:mi:ss') BEGIN
        from dba_hist_snapshot a,v$instance i
        where i.INSTANCE_NUMBER=a.instance_number
        and begin_interval_time>sysdate-1
        order by to_char(begin_interval_time, 'rr/mm/dd hh24:mi:ss') desc`,
    );
    process.send(result.rows);
  } catch (err) {
    console.error("worker db/awr error", err);
    process.send("error2");
  } finally {
    await connection.close();
  }
});
