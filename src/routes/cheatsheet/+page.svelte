<script>
  import { v1 as uuid } from "uuid";
  import { onMount, onDestroy } from "svelte";
  import Copy from "$lib/myComponents/Copy.svelte";
  import Kbd from "$lib/myComponents/Kbd.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  let codeClass =
    "relative w-full rounded-md border border-gray-300 bg-background py-4 pl-4 text-gray-700 dark:text-gray-300 dark:border-gray-600 ";
  let id;
  let tocContentRef;
  let observer;
  onMount(() => {
    //toc create
    const allSections = document.querySelectorAll("section[id]");
    const ul = document.createElement("ul");
    allSections.forEach((section) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${section.id}`;
      a.innerHTML = section.firstChild.innerHTML;
      li.classList.add(
        "text-lg",
        "py-1",
        "text-gray-500",
        "mb-2",
        "px-4",
        "mr-16",
        "border-l-4",
        "border-transparent",
        "w-80",
      );
      li.appendChild(a);
      ul.appendChild(li);
    });
    tocContentRef.appendChild(ul);

    //end toc create
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        id = entry.target.getAttribute("id");
        if (entry.intersectionRatio > 0) {
          document
            .querySelector(`li a[href="#${id}"]`)
            .parentElement.classList.remove(
              "text-gray-500",
              "border-transparent",
            );
          document
            .querySelector(`li a[href="#${id}"]`)
            .parentElement.classList.add(
              "text-gray-800",
              "font-bold",
              "border-primary",
              "bg-gray-50",
              "dark:bg-gray-800/50",
              "dark:text-gray-400",
            );
        } else {
          document
            .querySelector(`li a[href="#${id}"]`)
            .parentElement.classList.remove(
              "text-gray-800",
              "font-bold",
              "border-primary",
              "bg-gray-50",
              "dark:bg-gray-800/50",
              "dark:text-gray-400",
            );
          document
            .querySelector(`li a[href="#${id}"]`)
            .parentElement.classList.add("text-gray-500", "border-transparent");
        }
      });

      // Track all sections that have an `id` applied
    });
    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });
  });
  onDestroy(() => {
    if (observer) observer.disconnect();
  });
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">Cheat Sheet</h1>
  </div>
</header>
<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
  <div class="flex flex-row">
    <div class="flex-1 divide-y-4 space-y-4">
      <Card.Root class="">
        <section id={uuid()} class="scroll-mt-8 space-y-2">
          <h1 class="sr-only">ERP</h1>
          <Card.Header>
            <Card.Title class="">
              <h1 class="text-lg font-semibold">ERP</h1>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <p class="text-base/8">
              Connect with <Kbd>root</Kbd> user to
              <Kbd>ERP</Kbd> server using <Kbd>ssh</Kbd> then switch user to <Kbd
                >oraprod</Kbd
              > using <Kbd
                >su - oraprod <Copy
                  value="su - oraprod
"
                /></Kbd
              >
              and execute the following commands
            </p>
            <div class="ml-4 space-y-2 mb-4">
              <h1 class="  text-lg font-semibold">Start ERP DB</h1>
              <div class={codeClass}>
                startup_db.sh
                <Copy
                  class=" absolute right-4 top-4"
                  value="startup_db.sh
"
                />
              </div>

              <h1 class="text-lg font-semibold">Stop ERP DB</h1>
              <div class={codeClass}>
                shutdown_db.sh
                <Copy
                  class=" absolute right-4 top-4"
                  value="shutdown_db.sh
"
                />
              </div>
            </div>
            <p class="text-base/8">
              Connect with <Kbd>root</Kbd> user to <Kbd>ERP</Kbd> server using <Kbd
                >ssh</Kbd
              > then switch user to <Kbd>applprod</Kbd> using <Kbd
                >su - applprod <Copy
                  value="su - applprod
"
                />
              </Kbd> and execute the following commands
            </p>

            <div class="ml-4 space-y-2 mb-4">
              <h1 class=" text-lg font-semibold">Start ERP Application</h1>
              <p class={codeClass}>
                startup_apps.sh
                <Copy
                  class=" absolute right-4 top-4"
                  value="startup_apps.sh
"
                />
              </p>
              <h1 class="text-lg font-semibold">Stop ERP Application</h1>
              <p class={codeClass}>
                shutdown_apps.sh.sh
                <Copy
                  class=" absolute right-4 top-4"
                  value="shutdown_apps.sh
"
                />
              </p>
            </div>
          </Card.Content>
        </section>
      </Card.Root>
      <Card.Root class="">
        <section id={uuid()} class="scroll-mt-8">
          <h1 class="sr-only">Medicom Database</h1>
          <Card.Header>
            <Card.Title class="">
              <h1 class="text-lg font-semibold">Medicom Database</h1>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <p class="text-base/8">
              Connect with <Kbd>root</Kbd> user to <Kbd>ERP</Kbd> server using <Kbd
                >ssh</Kbd
              > then switch user to <Kbd>oraprod</Kbd> using <Kbd
                >su - oraprod <Copy
                  value="su - oraprod
"
                /></Kbd
              > and execute the following commands, ERP DB listener should be started
            </p>
            <div class="ml-4 space-y-2 mb-4">
              <h1 class="text-lg font-semibold">Startup MEDICOM DB</h1>
              <p class={codeClass}>
                . /u01/PROD/db/9.2.0/PROD_erp-srv.env<br />
                ORACLE_SID=mprod<br />
                export ORACLE_SID<br />
                sqlplus "/as sysdba"<br />
                startup pfile='/mprod/mprod_pfile.ora';<br />
                alter database open;<br />

                <Copy
                  class=" absolute right-4 top-4"
                  value=". /u01/PROD/db/9.2.0/PROD_erp-srv.env
ORACLE_SID=mprod
export ORACLE_SID
sqlplus '/as sysdba'
startup pfile='/mprod/mprod_pfile.ora';
alter database open;
exit
"
                />
              </p>
              <h1 class="text-lg font-semibold">Shutdown MEDICOM DB</h1>
              <p class={codeClass}>
                . /u01/PROD/db/9.2.0/PROD_erp-srv.env<br />
                ORACLE_SID=mprod<br />
                export ORACLE_SID<br />
                sqlplus "/as sysdba"<br />
                shutdown immediate;<br />

                <Copy
                  class=" absolute right-4 top-4"
                  value=". /u01/PROD/db/9.2.0/PROD_erp-srv.env
ORACLE_SID=mprod
export ORACLE_SID
sqlplus '/as sysdba'
shutdown immediate;
exit
"
                />
              </p>
            </div>
          </Card.Content>
        </section>
      </Card.Root>
      <Card.Root class="">
        <section id={uuid()} class="scroll-mt-8">
          <h1 class="sr-only">Data Guard</h1>
          <Card.Header>
            <Card.Title class="">
              <h1 class="text-lg font-semibold">Data Guard</h1>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <p class="text-base/8">
              Connect with <Kbd>root</Kbd> user to <Kbd
                class="px-2 py-1 text-lg">DR</Kbd
              > server using <Kbd>ssh</Kbd> then switch user to <Kbd>oracle</Kbd
              > using
              <Kbd class="relative px-2 py-1 text-lg"
                >su - oracle <Copy
                  value="su - oracle
"
                /></Kbd
              > and execute the following commands
            </p>
            <div class="ml-4 space-y-2 mb-4">
              <h1 class="text-lg font-semibold">Show status</h1>
              <p class={codeClass}>
                dgmgrl /<br /> show configuration;<br /> show database
                isoftstby;

                <Copy
                  class=" absolute right-4 top-4"
                  value="dgmgrl /
show configuration;
show database isoftstby;
"
                />
              </p>
              <h1 class="text-lg font-semibold">
                Disable transport service of the primary database
              </h1>
              <p class={codeClass}>
                dgmgrl /<br /> edit database 'isoft' set state='TRANSPORT-OFF';
                <br /> show database isoftstby;

                <Copy
                  class=" absolute right-4 top-4"
                  value="dgmgrl /
edit database 'isoft' set state='TRANSPORT-OFF';
show database isoftstby;
"
                />
              </p>
              <h1 class="text-lg font-semibold">
                Enable transport service of the primary database
              </h1>
              <p class={codeClass}>
                dgmgrl /<br /> edit database 'isoft' set state='TRANSPORT-ON';
                <br /> show database isoftstby;

                <Copy
                  class=" absolute right-4 top-4"
                  value="dgmgrl /
edit database 'isoft' set state='TRANSPORT-ON';
show database isoftstby;
"
                />
              </p>
              <h1 class="text-lg font-semibold">
                Disable apply service of the standby database
              </h1>
              <p class={codeClass}>
                dgmgrl /<br /> edit database 'isoftstby' set state='APPLY-OFF';
                <br /> show database isoftstby;

                <Copy
                  class=" absolute right-4 top-4"
                  value="dgmgrl /
edit database 'isoftstby' set state='APPLY-OFF';
show database isoftstby;
"
                />
              </p>
              <h1 class="text-lg font-semibold">
                Enable apply service of the standby database
              </h1>
              <p class={codeClass}>
                dgmgrl /<br /> edit database 'isoftstby' set state='APPLY-ON';
                <br /> show database isoftstby;

                <Copy
                  class=" absolute right-4 top-4"
                  value="dgmgrl /
edit database 'isoftstby' set state='APPLY-ON';
show database isoftstby;
"
                />
              </p>
              <h1 class="text-lg font-semibold">
                Start disaster recovery database
              </h1>
              <p class={codeClass}>
                sqlplus /as sysdba<br />startup nomount;<br /> alter database
                mount standby database;<br />
                alter database recover managed standby database disconnect from session;

                <Copy
                  class=" absolute right-4 top-4"
                  value="sqlplus /as sysdba
startup nomount;
alter database mount standby database;
alter database recover managed standby database disconnect from session;
"
                />
              </p>
              <h1 class="text-lg font-semibold">
                Stop disaster recovery database
              </h1>
              <p class={codeClass}>
                sqlplus /as sysdba<br />alter database recover managed standby
                database cancel;<br />
                shutdown immediate;

                <Copy
                  class=" absolute right-4 top-4"
                  value="sqlplus /as sysdba
alter database recover managed standby database cancel;
shutdown immediate;
"
                />
              </p>
            </div>
          </Card.Content>
        </section>
      </Card.Root>
      <Card.Root class="">
        <section id={uuid()} class="scroll-mt-8">
          <h1 class="sr-only">ILOM Net Management</h1>
          <Card.Header>
            <Card.Title
              ><h1 class="text-lg font-semibold">
                ILOM Net Management
              </h1></Card.Title
            >
          </Card.Header>
          <Card.Content class="space-y-4">
            <p class="text-base/8">
              Connect with the management <Kbd>root</Kbd> user to desired server
              using
              <Kbd>ssh</Kbd> and execute the following commands
            </p>
            <div class="ml-4 space-y-2 mb-4">
              <h1 class="text-lg font-semibold">Start server</h1>
              <p class={codeClass}>
                start /SYS

                <Copy
                  class=" absolute right-4 top-4"
                  value="start /SYS
"
                />
              </p>
              <h1 class="text-lg font-semibold">Shutdown server</h1>
              <p class={codeClass}>
                stop /SYS

                <Copy
                  class=" absolute right-4 top-4"
                  value="stop /SYS
"
                />
              </p>
              <h1 class="text-lg font-semibold">Show console</h1>
              <p class={codeClass}>
                start /HOST/console

                <Copy
                  class=" absolute right-4 top-4"
                  value="start /HOST/console
"
                />
              </p>
              <h1 class="text-lg font-semibold">Show faults</h1>
              <p class={codeClass}>
                show faulty

                <Copy
                  class=" absolute right-4 top-4"
                  value="show faulty
"
                />
              </p>
            </div>
          </Card.Content>
        </section>
      </Card.Root>
      <Card.Root class="">
        <section id={uuid()} class="scroll-mt-8">
          <h1 class="sr-only">LDOM Management</h1>
          <Card.Header>
            <Card.Title
              ><h1 class="text-lg font-semibold">
                LDOM Management
              </h1></Card.Title
            >
          </Card.Header>
          <Card.Content class="space-y-4">
            <p class="text-base/8 font-bold">
              Transfering <Kbd>MIG</Kbd> lun from <Kbd>testisoft67</Kbd> to <Kbd
                >testisoft66</Kbd
              >
            </p>

            <ol class=" list-decimal list-inside ml-4 space-y-4">
              <li class="text-base/8">
                Connect with the <Kbd>root</Kbd> user to
                <Kbd>ldm4</Kbd> on <Kbd>OVS4</Kbd> server using
                <Kbd>ssh</Kbd> and execute the following command
                <div class="pt-1">
                  <p class={codeClass}>
                    zpool export mig

                    <Copy
                      class=" absolute right-4 top-4"
                      value="zpool export mig
			"
                    />
                  </p>
                </div>
              </li>
              <li class="text-base/8">
                Connect with the <Kbd>root</Kbd> user to
                <Kbd>OVS4</Kbd> server using
                <Kbd>ssh</Kbd> and execute the following commands
                <div class="pt-1">
                  <p class={codeClass}>
                    ldm rm-vdisk mig ldm4<br /> ldm add-vdisk mig
                    migration@primary-vds0 ldm1
                    <Copy
                      class=" absolute right-4 top-4"
                      value="ldm rm-vdisk mig ldm4
ldm add-vdisk mig migration@primary-vds0 ldm1
"
                    />
                  </p>
                </div>
              </li>
              <li class="text-base/8">
                Connect with the <Kbd>root</Kbd> user to
                <Kbd>ldm1</Kbd> on <Kbd>OVS4</Kbd> server using
                <Kbd>ssh</Kbd> and execute the following command
                <div class="pt-1">
                  <p class={codeClass}>
                    zpool import mig
                    <Copy
                      class=" absolute right-4 top-4"
                      value="zpool import mig
"
                    />
                  </p>
                </div>
              </li>
            </ol>

            <p class="text-base/8 font-bold">
              Transfering <Kbd>MIG</Kbd> lun from <Kbd>testisoft66</Kbd> to <Kbd
                >testisoft67</Kbd
              >
            </p>

            <ol class=" list-decimal list-inside ml-4 space-y-4">
              <li class="text-base/8">
                Connect with the <Kbd>root</Kbd> user to
                <Kbd>ldm1</Kbd> on <Kbd>OVS4</Kbd> server using
                <Kbd>ssh</Kbd> and execute the following command
                <div class="pt-1">
                  <p class={codeClass}>
                    zpool export mig

                    <Copy
                      class=" absolute right-4 top-4"
                      value="zpool export mig
"
                    />
                  </p>
                </div>
              </li>
              <li class="text-base/8">
                Connect with the <Kbd>root</Kbd> user to
                <Kbd>OVS4</Kbd> server using
                <Kbd>ssh</Kbd> and execute the following commands

                <div class="pt-1">
                  <p class={codeClass}>
                    ldm rm-vdisk mig ldm1<br /> ldm add-vdisk mig
                    migration@primary-vds0 ldm4

                    <Copy
                      class=" absolute right-4 top-4"
                      value="ldm rm-vdisk mig ldm1
ldm add-vdisk mig migration@primary-vds0 ldm4
"
                    />
                  </p>
                </div>
              </li>
              <li class="text-base/8">
                Connect with the <Kbd>root</Kbd> user to
                <Kbd>ldm4</Kbd> on <Kbd>OVS4</Kbd> server using
                <Kbd>ssh</Kbd> and execute the following command
                <div class="pt-1">
                  <p class={codeClass}>
                    zpool import mig

                    <Copy
                      class=" absolute right-4 top-4"
                      value="zpool import mig
"
                    />
                  </p>
                </div>
              </li>
            </ol>
          </Card.Content>
        </section>
      </Card.Root>
      <Card.Root class="">
        <section id={uuid()} class="scroll-mt-8">
          <h1 class="sr-only">Solaris Commands</h1>
          <Card.Header>
            <Card.Title>
              <h1 class="text-lg font-semibold">Solaris Commands</h1>
            </Card.Title>
          </Card.Header>
          <Card.Content class="space-y-2">
            <div class="ml-4 space-y-2 mb-4">
              <h1 class="text-lg font-semibold">Check Free Memory</h1>
              <p class={codeClass}>
                echo "::memstat" | mdb -k

                <Copy
                  class=" absolute right-4 top-4"
                  value="echo '::memstat' | mdb -k
"
                />
              </p>
              <h1 class="text-lg font-semibold">Check Network</h1>
              <p class={codeClass}>
                dladm show-phys

                <Copy
                  class=" absolute right-4 top-4"
                  value="dladm show-phys
"
                />
              </p>
              <p class={codeClass}>
                ipadm show-if

                <Copy
                  class=" absolute right-4 top-4"
                  value="ipadm show-if
"
                />
              </p>
              <p class={codeClass}>
                ipadm show-addr

                <Copy
                  class=" absolute right-4 top-4"
                  value="ipadm show-addr
"
                />
              </p>
            </div>
          </Card.Content>
        </section>
      </Card.Root>
      <Card.Root class="">
        <section id={uuid()} class="scroll-mt-8">
          <h1 class="sr-only">Diagnostics SQL</h1>
          <Card.Header>
            <Card.Title>
              <h1 class="text-lg font-semibold">Diagnostics SQL</h1>
            </Card.Title>
          </Card.Header>
          <Card.Content class="space-y-2">
            <div class="ml-4 space-y-2 mb-4">
              <h1 class="text-lg font-semibold">Block Changes</h1>
              <pre
                class={codeClass}>SELECT s.sid, s.serial#, s.username, s.program,s.MACHINE,i.block_changes
FROM  v$session s, v$sess_io i
WHERE s.sid = i.sid
ORDER BY 6 desc, 1, 2, 3, 4;<Copy
                  class=" absolute right-4 top-4"
                  value="SELECT s.sid, s.serial#, s.username, s.program,s.MACHINE,i.block_changes
FROM v$session s, v$sess_io i
WHERE s.sid = i.sid
ORDER BY 6 desc, 1, 2, 3, 4;
"
                />
</pre>

              <h1 class="text-lg font-semibold">Current Sql Load</h1>
              <pre
                class={codeClass}>select a.sql_id,s.SQL_TEXT,count(*) ex,AVG(a.cpu_time * power(10, -6)) avg_time,
        count(*) * AVG(a.cpu_time * power(10, -6)) tot_time
from  gv$sql_monitor a, gv$sql s
where a.SQL_ID = s.SQL_ID
and   a.inst_id=s.inst_id
group by a.sql_id, s.SQL_TEXT
order by 5 desc; <Copy
                  class=" absolute right-4 top-4"
                  value="select a.sql_id,
s.SQL_TEXT,
count(*) ex,
AVG(a.cpu_time * power(10, -6)) avg_time,
count(*) * AVG(a.cpu_time * power(10, -6)) tot_time
from gv$sql_monitor a, gv$sql s
where a.SQL_ID = s.SQL_ID
and a.inst_id=s.inst_id
group by a.sql_id, s.SQL_TEXT
order by 5 desc;
"
                /></pre>
            </div>
          </Card.Content>
        </section>
      </Card.Root>
    </div>

    <div class="w-fit hidden lg:block">
      <div id="toc" class=" sticky top-1 pl-10" bind:this={tocContentRef}>
        <h1 tag="h5" class="  mb-6 mt-4 pb-2">
          <span class="">ON THIS PAGE</span>
        </h1>
      </div>
    </div>
  </div>
</div>
