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
      `SELECT 
    TO_CHAR(originating_timestamp, 'YYYY-MM-DD HH24:MI:SS') AS mon_date,
    CASE 
        WHEN message_text LIKE 'Starting ORACLE instance%' THEN 'SUP'
        WHEN message_text LIKE 'Shutting down instance %' THEN 'SDN'
        WHEN message_text LIKE '%terminating the instance%' THEN 'SDN'

    END AS operation
FROM 
    v$alert_log
WHERE 
    originating_timestamp >= TRUNC(SYSDATE) - 365
    AND (
        message_text LIKE 'Starting ORACLE instance%' 
        OR message_text LIKE 'Shutting down instance %' 
        OR message_text LIKE '%terminating the instance%'
    )`,
      //  `SELECT to_char(originating_timestamp,'rrrr-mm-dd hh24:mi:ss') MON_DATE,
      // decode(substr(message_text,0,2),'St','SUP','SDN') OPERATION
      // FROM v$alert_log a
      // WHERE (message_text LIKE 'Shutting down instance %'
      // or message_text LIKE 'Starting ORACLE instance%'
      // or message_text LIKE '%terminating the instance%')
      // and to_char(originating_timestamp,'rrrrmmdd')>to_char(sysdate-365,'rrrrmmdd')`,
    );

    process.send(result.rows);
  } catch (err) {
    console.error("worker db/upDown error", err);
    process.send("error2");
  } finally {
    await connection.close();
  }
});
