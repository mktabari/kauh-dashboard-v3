import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
process.on(
  "message",
  async ({ ip, username, password, dbName, dbPort, searchUsername }) => {
    const connection = await oracledb.getConnection({
      user: username,
      password: password,
      connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${ip})(PORT=${dbPort}))(CONNECT_DATA=(SID=${dbName})))`,
    });
    try {
      let result = await connection.execute(
        `SELECT min(h.sample_time) min_time, 
        max(h.sample_time) max_time, 
        h.session_id sid, 
        h.session_serial# serial,
        h.MACHINE,
        h.PROGRAM,
        h.MODULE
        FROM dba_hist_active_sess_history h,dba_users u
        WHERE h.user_id = u.user_id
        and   u.username = upper(:searchUsername)
        group by h.session_id, h.session_serial#,h.MACHINE,h.PROGRAM,h.MODULE
        ORDER BY max(h.sample_time) DESC`,
        { searchUsername },
      );

      process.send(result.rows);
    } catch (err) {
      console.error("worker db/userHistory/worker.js", err);
      process.send("error2");
    } finally {
      await connection.close();
    }
  },
);
