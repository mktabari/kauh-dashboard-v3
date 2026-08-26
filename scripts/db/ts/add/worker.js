import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
process.on(
  "message",
  async ({ ip, username, password, dbName, dbPort, ts }) => {
    const connection = await oracledb.getConnection({
      user: username,
      password: password,
      connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${ip})(PORT=${dbPort}))(CONNECT_DATA=(SID=${dbName})))`,
    });
    try {
      let result = await connection.execute(
        `select FILE_ID,FILE_ID+1 id, file_name fileName from dba_data_files where FILE_ID = (select max(FILE_ID) from dba_data_files)`,
      );
      await connection.execute(
        `ALTER TABLESPACE ${ts} ADD DATAFILE '${result.rows[0].FILENAME.split("/").slice(0, -1).join("/")}/${ts}_${result.rows[0].ID}.dbf' SIZE 1024M autoextend on`,
      );
      // console.log(result.rows);
      // console.log(
      //   `ALTER TABLESPACE ${ts} ADD DATAFILE '${result.rows[0].FILENAME.split("/").slice(0, -1).join("/")}/${ts}_${result.rows[0].ID}.dbf' SIZE 1024M autoextend on`,
      // );
      process.send("ok");
    } catch (err) {
      console.error("worker db/ts/add error", err);
      process.send("error2");
    } finally {
      await connection.close();
    }
  },
);
