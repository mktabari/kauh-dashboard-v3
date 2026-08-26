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
locker.instance,
locker.username,
locker.sid,
locker.SERIAL# SERIAL,
nvl(locker.object_name,' ') object_name,
locker.seconds_in_wait,
locker.type,
locker.lock_mode,
locker.MACHINE,
blocked.blocked_instance,
blocked.USERNAME blocked_USERNAME,
blocked.seconds_in_wait seconds_blocked
from (select
        
        l.INST_ID instance,
        l.sid sid,
        s.SERIAL#,
        s.MACHINE,
        s.username,
        o.name object_name,
        s.seconds_in_wait,
        l.type,
        
        decode(lmode,
               1,
               'NULL',
               2,
               'Row Share',
               3,
               'Row Exclusive',
               4,
               'Share',
               5,
               'Share Row',
               6,
               'Exclusive') lock_mode,
        l.INST_ID || '-' || l.sid inst_sid
   from gv$lock l, gv$session s, sys.obj$ o
  where l.type in ('RW', 'TM', 'TX', 'UL')
    and l.sid = s.sid(+)
    and l.id1 = o.obj#(+)
    and l.INST_ID = s.INST_ID
    and lmode > 0) locker,
(select INST_ID,
        SID,
        USERNAME,
        seconds_in_wait,
        INST_ID blocked_instance,
        BLOCKING_INSTANCE || '-' || BLOCKING_SESSION inst_sid
   from gv$session) blocked
where locker.inst_sid = blocked.inst_sid(+)
order by locker.sid`,
    );
    process.send(result.rows);
  } catch (err) {
    console.error("worker db/locks error", err);
    process.send("error2");
  } finally {
    await connection.close();
  }
});
