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
      `select trunc(sysdate - day_map.d) date_,
       to_char(trunc(sysdate - day_map.d), 'day') day,
       day_map.d d,
       day_map.h h,
       nvl(msg_log.c, 0) c
  from (select day.d d, hour.h h, trunc(sysdate - day.d) || hour.h con_code
          from (select rownum - 1 h
                  from (select 4 a
                          from dual
                        union all
                        select 3 a
                          from dual
                        union all
                        select 2 a
                          from dual
                        union all
                        select 1 a
                          from dual
                        union all
                        select 0 a
                          from dual),
                       (select 5 a
                          from dual
                        union all
                        select 4 a
                          from dual
                        union all
                        select 3 a
                          from dual
                        union all
                        select 2 a
                          from dual
                        union all
                        select 1 a
                          from dual)
                 where rownum < 25) hour,
               (select rownum d
                  from (select 4 a
                          from dual
                        union all
                        select 3 a
                          from dual
                        union all
                        select 2 a
                          from dual
                        union all
                        select 1 a
                          from dual
                        union all
                        select 0 a
                          from dual),
                       (select 5 a
                          from dual
                        union all
                        select 4 a
                          from dual
                        union all
                        select 3 a
                          from dual
                        union all
                        select 2 a
                          from dual
                        union all
                        select 1 a
                          from dual)
                 where rownum < 8) day) day_map,
       (select trunc(a.added_date) d,
               to_char(a.added_date, 'hh24') h,
               count(*) c,
               trunc(a.added_date) ||
               to_number(to_char(a.added_date, 'hh24')) con_code
          from kauh_sms_messages a
         where a.added_date > trunc(sysdate) - 7
         group by trunc(a.added_date), to_char(a.added_date, 'hh24')) msg_log
 where day_map.con_code = msg_log.con_code(+)
 order by day_map.d, day_map.h
`,
    );
    let data = { new: result.rows };
    result = await connection.execute(
      `select trunc(sysdate - day_map.d) date_,
       to_char(trunc(sysdate - day_map.d), 'day') day,
       day_map.d d,
       day_map.h h,
       nvl(msg_log.c, 0) c
  from (select day.d d, hour.h h, trunc(sysdate - day.d) || hour.h con_code
          from (select rownum - 1 h
                  from (select 4 a
                          from dual
                        union all
                        select 3 a
                          from dual
                        union all
                        select 2 a
                          from dual
                        union all
                        select 1 a
                          from dual
                        union all
                        select 0 a
                          from dual),
                       (select 5 a
                          from dual
                        union all
                        select 4 a
                          from dual
                        union all
                        select 3 a
                          from dual
                        union all
                        select 2 a
                          from dual
                        union all
                        select 1 a
                          from dual)
                 where rownum < 25) hour,
               (select rownum d
                  from (select 4 a
                          from dual
                        union all
                        select 3 a
                          from dual
                        union all
                        select 2 a
                          from dual
                        union all
                        select 1 a
                          from dual
                        union all
                        select 0 a
                          from dual),
                       (select 5 a
                          from dual
                        union all
                        select 4 a
                          from dual
                        union all
                        select 3 a
                          from dual
                        union all
                        select 2 a
                          from dual
                        union all
                        select 1 a
                          from dual)
                 where rownum < 8) day) day_map,
       (select trunc(a.request_date) d,
               to_char(a.request_date, 'hh24') h,
               count(*) c,
               trunc(a.request_date) ||
               to_number(to_char(a.request_date, 'hh24')) con_code
          from kauh_sms_log a
         where a.request_date > trunc(sysdate) - 7
         group by trunc(a.request_date), to_char(a.request_date, 'hh24')) msg_log
 where day_map.con_code = msg_log.con_code(+)
 order by day_map.d, day_map.h
`,
    );
    data.old = result.rows;
    result = await connection.execute(
      `select a.MODULE,count(*) c
          from kauh_sms_messages a
         where a.added_date > trunc(sysdate) - 7
         group by a.MODULE
`,
    );
    data.MODULE = result.rows;
    process.send(data);
  } catch (err) {
    console.error("worker sms/hm error", err);
    process.send("error2");
  } finally {
    await connection.close();
  }
});
