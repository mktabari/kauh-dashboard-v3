import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
process.on(
  "message",
  async ({ ip, username, password, dbName, dbPort, sqlText }) => {
    const connection = await oracledb.getConnection({
      user: username,
      password: password,
      connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${ip})(PORT=${dbPort}))(CONNECT_DATA=(SID=${dbName})))`,
    });
    try {
      let result = await connection.execute(
        // `SELECT
        //     ash.session_id as SID,
        //     ash.sample_time,
        //     txt.sql_text
        // FROM
        //     dba_hist_active_sess_history ash
        // JOIN
        //     dba_hist_sqltext txt ON ash.sql_id = txt.sql_id
        // WHERE
        //     ash.session_id = &target_sid
        // ORDER BY
        //     ash.sample_time DESC`

        `select a.SQL_ID,a.SQL_TEXT,a.EXECUTIONS exes,a.FIRST_LOAD_TIME 
         from v$sqlarea a 
         where upper(a.SQL_TEXT) like '%${sqlText}%' 
         and a.sql_text not like '%where a.SQL_TEXT like%'`,
      );

      process.send(result.rows);
    } catch (err) {
      console.error("worker db/sqlText error", err);
      process.send("error2");
    } finally {
      await connection.close();
    }
  },
);
