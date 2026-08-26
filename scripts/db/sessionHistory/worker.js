import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
process.on(
  "message",
  async ({ ip, username, password, dbName, dbPort, sid, serial }) => {
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

        `select * from (
SELECT 
    
    sql_id,
    max(to_date(sample_time,'YYYY-MM-DD HH24:MI:SS')) max_time,
    min(to_date(sample_time,'YYYY-MM-DD HH24:MI:SS')) min_time, 
    count(*)  EXECS,
    sql_text
    from (
SELECT 
     
    ash.sql_id as SQL_ID,
    to_char(ash.sample_time,'YYYY-MM-DD HH24:MI:SS') as sample_time,
    to_char(substr(txt.sql_text,1,4000)) as SQL_TEXT
FROM 
    v$active_session_history ash, v$sqlarea txt

   
WHERE 
 ash.sql_id = txt.sql_id
 and   ash.session_id = :sid
 and   ash.SESSION_SERIAL# = :serial

 union  all

SELECT 
    
    ash.sql_id as SQL_ID,
     to_char(ash.sample_time,'YYYY-MM-DD HH24:MI:SS') as sample_time,
   to_char(substr(txt.sql_text,1,4000)) as SQL_TEXT
FROM 
    dba_hist_active_sess_history ash,dba_hist_sqltext txt

WHERE 
      ash.sql_id = txt.sql_id
and   ash.session_id = :sid
and   ash.SESSION_SERIAL# = :serial

)

    group by sql_id,sql_text

    )
ORDER BY 
   2 DESC`,
        { sid, serial },
      );

      process.send(result.rows);
    } catch (err) {
      console.error("worker db/sessionHistory error", err);
      process.send("error2");
    } finally {
      await connection.close();
    }
  },
);
