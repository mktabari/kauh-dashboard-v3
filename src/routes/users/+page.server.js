import { db, eq, ne, and, serversList, tags, server_Tags } from "$lib/DB";
import oracledb from "oracledb";
oracledb.initOracleClient();
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
export const load = async () => {
  const servers = await db
    .select(serversList)
    .from(serversList)
    .innerJoin(server_Tags, eq(serversList.id, server_Tags.serverId))
    .innerJoin(tags, eq(server_Tags.tagId, tags.id))
    .where(and(eq(serversList.deleteFlag, "0"), eq(tags.name, "ERP")));

  return {
    deactivate: await new Promise(async (resolve) => {
      const connection = await oracledb.getConnection({
        user: servers[0].dbUser,
        password: servers[0].dbPassword,
        connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${servers[0].ip})(PORT=${servers[0].dbPort}))(CONNECT_DATA=(SID=${servers[0].dbName})))`,
      });
      let result;
      try {
        result =
          await connection.execute(`SELECT DISTINCT to_number(p.employee_number) EMPNUM,
p.full_name FN,
kauh_hr_pkg.JOB(a.JOB_ID) JOB,
--to_char(s.actual_termination_date,'dd/mm/rrrr') TD,
--a.assignment_status_type_id,
u.appl_user_id AUI,
u.func_role_id PI,
(SELECT count(*)
  FROM oa_appt@ISOFT T
  WHERE t.practitioner_id=u.func_role_id
  and appt_date>=trunc(sysdate)) AP,
p.current_employee_flag F
FROM per_all_people_f p, per_all_assignments_f a, sm_appl_user@isoft u
where p.person_id = a.PERSON_ID
and trunc(sysdate) between p.effective_start_date and
p.effective_end_date
and (((select s.actual_termination_date
from per_periods_of_service s
where a.PERIOD_OF_SERVICE_ID = s.period_of_service_id) between
a.effective_start_date and a.effective_end_date and
p.current_employee_flag IS NULL) or
(a.assignment_status_type_id in (2095/*Vacation incubation\Unpaid Leave*/, 1095/*Unpaid Leave*/,6095) and
trunc(sysdate) between a.effective_start_date and
a.effective_end_date))
and p.employee_number = u.employee_no
and u.eff_status = 'E'
--and u.func_role_id is not null
--and rownum <10
order by 6 desc, 1
`);
      } catch (err) {
        console.error("users error", err);
        result.rows = [];
      }
      const { rows } = result;
      await connection.close();
      resolve(rows);
    }),
    activate: await new Promise(async (resolve) => {
      const connection = await oracledb.getConnection({
        user: servers[0].dbUser,
        password: servers[0].dbPassword,
        connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${servers[0].ip})(PORT=${servers[0].dbPort}))(CONNECT_DATA=(SID=${servers[0].dbName})))`,
      });
      let result;
      try {
        result =
          await connection.execute(`SELECT DISTINCT to_number(p.employee_number) EMPNUM,
p.full_name FN,
kauh_hr_pkg.JOB(a.JOB_ID) JOB,
--to_char(s.actual_termination_date,'dd/mm/rrrr') TD,
--a.assignment_status_type_id,
u.appl_user_id AUI,
u.func_role_id PI
FROM per_all_people_f p, per_all_assignments_f a, sm_appl_user@isoft u
where p.person_id = a.PERSON_ID
and trunc(sysdate) between p.effective_start_date and
p.effective_end_date 
and a.assignment_status_type_id =1 
and trunc(sysdate) between a.effective_start_date and
a.effective_end_date
and p.employee_number = u.employee_no
and u.eff_status <> 'E'
--and u.func_role_id is not null
--and rownum <10
order by  1
`);
      } catch (err) {
        console.error("users error", err);
        result.rows = [];
      }
      const { rows } = result;
      await connection.close();
      resolve(rows);
    }),
  };
};
