import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
process.on(
  "message",
  async ({ ip, username, password, dbName, dbPort, sqlID }) => {
    const connection = await oracledb.getConnection({
      user: username,
      password: password,
      connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${ip})(PORT=${dbPort}))(CONNECT_DATA=(SID=${dbName})))`,
    });
    try {
      let result =
        await connection.execute(`SELECT a.HASH_VALUE,a.ADDRESS,a.PLAN_HASH_VALUE,a.SQL_ID,a.ID, lpad(' ',7*(a.DEPTH-1))||a.OPERATION||' '||OPTIONs OPERATION , object_name,a.COST,a.CARDINALITY,a.CPU_COST,a.IO_COST,a.ACCESS_PREDICATES,a.FILTER_PREDICATES
                           FROM V$SQL_PLAN a 
                           WHERE 
                           a.SQL_ID='${sqlID}'`);
      let planData = result.rows;
      result = await connection.execute(`SELECT a.sql_text
                           FROM V$SQLTEXT a 
                           WHERE 
                           a.SQL_ID='${sqlID}'
						   order by a.piece asc`);
      const { rows } = result;
      connection.close();
      let sqlText = "";
      for (let i = 0; i < rows.length; i++) {
        sqlText += rows[i].SQL_TEXT;
      }
      process.send({ planData, sqlText });
    } catch (err) {
      console.error("worker db/sqlPlan error", err);
      process.send("error2");
    } finally {
      await connection.close();
    }
  },
);
