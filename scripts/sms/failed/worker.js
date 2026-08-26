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
      `SELECT a.phone_number,
       a.message,
       a.patient_id,
       a.reference_id,
       a.module,
       a.request_status_description
  FROM kauh_sms_messages a
 WHERE a.request_status_code in ('501','500') 
   and a.cutoff_date > trunc(sysdate)`,
    );

    process.send(result.rows);
  } catch (err) {
    console.error("worker sms/failed error", err);
    process.send("error2");
  } finally {
    await connection.close();
  }
});
