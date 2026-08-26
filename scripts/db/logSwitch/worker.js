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
      `select to_char(a.date_,'day') day,a.* from (
SELECT trunc(first_time) date_,
       to_char(sum(decode(to_char(first_time, 'HH24'), '00', 1, 0)), '99') "h00",
       to_char(sum(decode(to_char(first_time, 'HH24'), '01', 1, 0)), '99') "h01",
       to_char(sum(decode(to_char(first_time, 'HH24'), '02', 1, 0)), '99') "h02",
       to_char(sum(decode(to_char(first_time, 'HH24'), '03', 1, 0)), '99') "h03",
       to_char(sum(decode(to_char(first_time, 'HH24'), '04', 1, 0)), '99') "h04",
       to_char(sum(decode(to_char(first_time, 'HH24'), '05', 1, 0)), '99') "h05",
       to_char(sum(decode(to_char(first_time, 'HH24'), '06', 1, 0)), '99') "h06",
       to_char(sum(decode(to_char(first_time, 'HH24'), '07', 1, 0)), '99') "h07",
       to_char(sum(decode(to_char(first_time, 'HH24'), '08', 1, 0)), '99') "h08",
       to_char(sum(decode(to_char(first_time, 'HH24'), '09', 1, 0)), '99') "h09",
       to_char(sum(decode(to_char(first_time, 'HH24'), '10', 1, 0)), '99') "h10",
       to_char(sum(decode(to_char(first_time, 'HH24'), '11', 1, 0)), '99') "h11",
       to_char(sum(decode(to_char(first_time, 'HH24'), '12', 1, 0)), '99') "h12",
       to_char(sum(decode(to_char(first_time, 'HH24'), '13', 1, 0)), '99') "h13",
       to_char(sum(decode(to_char(first_time, 'HH24'), '14', 1, 0)), '99') "h14",
       to_char(sum(decode(to_char(first_time, 'HH24'), '15', 1, 0)), '99') "h15",
       to_char(sum(decode(to_char(first_time, 'HH24'), '16', 1, 0)), '99') "h16",
       to_char(sum(decode(to_char(first_time, 'HH24'), '17', 1, 0)), '99') "h17",
       to_char(sum(decode(to_char(first_time, 'HH24'), '18', 1, 0)), '99') "h18",
       to_char(sum(decode(to_char(first_time, 'HH24'), '19', 1, 0)), '99') "h19",
       to_char(sum(decode(to_char(first_time, 'HH24'), '20', 1, 0)), '99') "h20",
       to_char(sum(decode(to_char(first_time, 'HH24'), '21', 1, 0)), '99') "h21",
       to_char(sum(decode(to_char(first_time, 'HH24'), '22', 1, 0)), '99') "h22",
       to_char(sum(decode(to_char(first_time, 'HH24'), '23', 1, 0)), '99') "h23"
  from v$log_history
  where first_time>trunc(sysdate)-6
  and  thread#=(select thread# from v$instance)
 GROUP by trunc(first_time)) a
 order by date_`,
    );
    process.send(result.rows);
  } catch (err) {
    console.error("worker db/logSwitch error", err);
    process.send("error2");
  } finally {
    await connection.close();
  }
});
