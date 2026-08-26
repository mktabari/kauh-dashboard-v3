<script>
  import Copy from "$lib/myComponents/Copy.svelte";
  import { format } from "sql-formatter";
  // import { TableSorter } from "$src/lib/myComponents/TableSorter.svelte";
  // import ta from "time-ago";
  import { cn } from "$lib/utils.js";
  import { cubicInOut } from "svelte/easing";
  import { MediaQuery } from "svelte/reactivity";
  import { page } from "$app/state";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Resizable from "$lib/components/ui/resizable/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import { Button, buttonVariants } from "$src/lib/components/ui/button";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as InputGroup from "$lib/components/ui/input-group/index.js";
  import { Progress } from "$lib/components/ui/progress/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import * as Pagination from "$lib/components/ui/pagination/index.js";
  import {
    Area,
    Axis,
    Chart,
    Highlight,
    Layer,
    Spline,
    Tooltip,
    BarChart,
    defaultChartPadding,
    Rule,
    LineChart,
    LinearGradient,
    AreaChart,
    ScatterChart,
  } from "layerchart";
  import { scaleThreshold, scaleTime, scaleBand, scaleLinear } from "d3-scale";
  import SortDir from "~icons/mdi/arrow-up-thin";
  import Database from "~icons/mdi/database";
  import SqlQuery from "~icons/mdi/sql-query";
  import Spinner from "~icons/svg-spinners/bars-scale-fade";
  import DotsBounce from "~icons/svg-spinners/3-dots-bounce";
  import Up from "~icons/mdi/trending-up";
  import Backup from "~icons/mdi/backup-restore";
  import Switches from "~icons/fa7-solid/refresh";
  import Connection from "~icons/mdi/connection";
  import Updown from "~icons/fluent/arrow-wrap-20-filled";
  import Information from "~icons/mdi/information-outline";
  import Lock from "~icons/mdi/lock";
  import Tablespace from "~icons/mdi/table";
  import Log from "~icons/mdi/alert";
  import Security from "~icons/mdi/security";
  import FileSql from "~icons/ph/file-sql";
  import Search from "~icons/mdi/search";
  import ReloadTime from "~icons/ant-design/reload-time-outline";
  import ManageSearch from "~icons/material-symbols/manage-search";
  import Report from "~icons/mdi/file-report-outline";
  import Article from "~icons/material-symbols-light/article-shortcut-outline-sharp";
  import Change from "~icons/material-symbols/change-circle-outline";
  import UserSearch from "~icons/boxicons/user-search-filled";
  import { onDestroy, tick, untrack } from "svelte";
  import { toast } from "svelte-sonner";
  // import { ColumnAliasProxyHandler } from "drizzle-orm";

  // let tableSorter = new TableSorter();
  const isDesktop = new MediaQuery("(min-width: 768px)");
  let { data } = $props();
  let loading = $state(false);
  // svelte-ignore state_referenced_locally
  let DBs = $state(data.DBs.sort((a, b) => a.dbLabel.localeCompare(b.dbLabel)));
  let activeDBTab = $state(null);
  let activeDB = $state(null);
  let tab = $state("CSQL");
  let DBCsql = $state([]);
  let DBCsqlServer = $state(null);
  let DBLop = $state([]);
  let DBLopServer = $state(null);
  let DBawr = $state([]);
  let DBawrServer = $state(null);
  let DBBch = $state([]);
  let DBBchServer = $state(null);
  let SessionHistory = $state([]);
  let SessionHistoryFirst = $state(true);
  let AWRselected = $state([]);
  let reportType = $state("awr");
  let awrReport = $state("");
  let sqlID = $state("");
  let planedSqlID = $state("");
  let sid = $state("");
  let serial = $state("");
  let planData = $state([]);
  let planDataFirst = $state(true);
  let username = $state("");
  let UserHistory = $state([]);
  let UserHistoryFirst = $state(true);
  let sql = $state("");
  let sqlFormated = $state("");
  let planID = $state(null);
  let count = $state(0);
  let currentPage = $state(1);
  let height = $state(0);
  let sqlText = $state("");
  let SQLs = $state([]);
  let sqlTextFirst = $state(true);
  let SQLsServer = $state(null);
  let perPage = $derived(Math.floor((height - 300) / 50));
  onDestroy(() => {});
  const LOP = () => {
    loading = true;
    DBLop = [];
    fetch(`${page.url.pathname}/api/longOperations`, {
      method: "POST",
      body: JSON.stringify({
        dbName: activeDB.dbName,
        ip: activeDB.ip,
        username: activeDB.dbUser,
        password: activeDB.dbPassword,
        dbPort: activeDB.dbPort,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        DBLop = result.data;
        if (DBLop.includes("error")) {
          DBLop = [];
          DBs.find((db) => db.ip === activeDB.ip).disabled = true;
        }
        loading = false;
      });
  };
  const AWR = () => {
    loading = true;
    DBawr = [];
    AWRselected = [];
    fetch(`${page.url.pathname}/api/awr`, {
      method: "POST",
      body: JSON.stringify({
        dbName: activeDB.dbName,
        ip: activeDB.ip,
        username: activeDB.dbUser,
        password: activeDB.dbPassword,
        dbPort: activeDB.dbPort,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        DBawr = result.data;

        loading = false;
      });
  };
  const CSQL = () => {
    loading = true;
    DBCsql = [];
    currentPage = 1;
    fetch(`${page.url.pathname}/api/currentSql`, {
      method: "POST",
      body: JSON.stringify({
        dbName: activeDB.dbName,
        ip: activeDB.ip,
        username: activeDB.dbUser,
        password: activeDB.dbPassword,
        dbPort: activeDB.dbPort,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        DBCsql = result.data;
        // DBCsql.forEach((sql) => {
        //   sql.PD =
        //     sql.DATE_DIFF > 1 ? sql.EXECUTIONS / sql.DATE_DIFF : sql.EXECUTIONS;
        // });
        count = DBCsql.length;

        loading = false;
      });
  };
  const BLKCH = () => {
    loading = true;
    DBBch = [];
    fetch(`${page.url.pathname}/api/blockChange`, {
      method: "POST",
      body: JSON.stringify({
        dbName: activeDB.dbName,
        ip: activeDB.ip,
        username: activeDB.dbUser,
        password: activeDB.dbPassword,
        dbPort: activeDB.dbPort,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        DBBch = result.data;
        loading = false;
      });
  };
  const SH = () => {
    loading = true;
    sqlTextFirst = false;
    sqlText = [];
    fetch(`${page.url.pathname}/api/sessionHistory`, {
      method: "POST",
      body: JSON.stringify({
        dbName: activeDB.dbName,
        ip: activeDB.ip,
        username: activeDB.dbUser,
        password: activeDB.dbPassword,
        dbPort: activeDB.dbPort,
        sid,
        serial,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        SessionHistory = result.data;
        loading = false;
      });
  };
  const QS = () => {
    loading = true;
    sqlTextFirst = false;
    SQLs = [];
    fetch(`${page.url.pathname}/api/sqlText`, {
      method: "POST",
      body: JSON.stringify({
        dbName: activeDB.dbName,
        ip: activeDB.ip,
        username: activeDB.dbUser,
        password: activeDB.dbPassword,
        dbPort: activeDB.dbPort,
        sqlText,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        SQLs = result.data;
        loading = false;
      });
  };
  const UH = () => {
    loading = true;
    UserHistoryFirst = false;
    UserHistory = [];
    fetch(`${page.url.pathname}/api/userHistory`, {
      method: "POST",
      body: JSON.stringify({
        dbName: activeDB.dbName,
        ip: activeDB.ip,
        username: activeDB.dbUser,
        password: activeDB.dbPassword,
        dbPort: activeDB.dbPort,
        searchUsername: username,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        UserHistory = result.data;
        loading = false;
      });
  };
  const sqlPlan = () => {
    planedSqlID = sqlID;
    loading = true;
    planDataFirst = false;
    planData = [];
    planID = null;
    sql = null;
    sqlFormated = null;
    fetch(`${page.url.pathname}/api/sqlPlan`, {
      method: "POST",
      body: JSON.stringify({
        ip: activeDB.ip,
        username: activeDB.dbUser,
        password: activeDB.dbPassword,
        dbPort: activeDB.dbPort,
        dbName: activeDB.dbName,
        sqlID,
      }),
    })
      .then((response) => response.json())
      .then(({ data }) => {
        planData = data.planData;
        let i = 0;
        planData.forEach((plan) => {
          if (plan.ID === 0) {
            i++;
          }
          plan.planID = i;
          if (i === 1) {
            planID = i;
          }
        });
        sql = data.sqlText;
        try {
          sqlFormated = format(sql, {
            language: "plsql",
            useTabs: true,
          });
        } catch (error) {
          try {
            sqlFormated = format(sql.replaceAll("+.", "+0."), {
              language: "plsql",
              useTabs: true,
            });
          } catch (error) {
            sqlFormated = sql;
          }
        }
        loading = false;
      });
  };
  $effect(() => {
    if (activeDBTab && activeDB?.ip !== activeDBTab) {
      untrack(() => {
        activeDB = DBs.find((db) => db.ip === activeDBTab);
      });
    }
  });
  $effect(() => {
    if (activeDB) {
      if (tab === "LOP")
        untrack(() => {
          if (DBLop.length === 0 || activeDB?.id !== DBLopServer) {
            LOP();
            DBLopServer = activeDB?.id;
          }
        });
      if (tab === "AWR")
        untrack(() => {
          if (DBawr.length === 0 || activeDB?.id !== DBawrServer) {
            AWR();
            DBawrServer = activeDB?.id;
          }
        });
      if (tab === "CSQL")
        untrack(() => {
          if (DBCsql.length === 0 || activeDB?.id !== DBCsqlServer) {
            CSQL();
            DBCsqlServer = activeDB?.id;
          }
        });
      if (tab === "BLKCH")
        untrack(() => {
          if (DBBch.length === 0 || activeDB?.id !== DBBchServer) {
            BLKCH();
            DBBchServer = activeDB?.id;
          }
        });
      if (tab === "QS")
        untrack(() => {
          if ((SQLs.length === 0 || activeDB?.id !== SQLsServer) && sqlText) {
            QS();
            SQLsServer = activeDB?.id;
          }
        });
    }
  });
  $effect(() => {
    if (currentPage > Math.ceil(count / perPage)) currentPage = 1;
  });
  $effect(() => {
    AWRselected.sort((a, b) => parseInt(a) - parseInt(b));
  });
  // $inspect(SQLsServer, activeDB);
</script>

<svelte:window bind:innerHeight={height} />
<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">SQL Diagnosis</h1>
  </div>
</header>

<div class="flex flex-col gap-4 p-0 md:px-4 h-[calc(100vh-5rem)] w-full">
  <Tabs.Root class="items-center " bind:value={tab}>
    <Tabs.List>
      <Tabs.Trigger
        value="CSQL"
        class="font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
        ><ReloadTime class="size-5 " />
        <span class="hidden md:inline"> Current SQL</span></Tabs.Trigger
      >
      <Tabs.Trigger
        value="BLKCH"
        class="font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
        ><Change class="size-5 " /><span class="hidden md:inline"
          >Block Changes</span
        >
      </Tabs.Trigger>
      <Tabs.Trigger
        value="UH"
        class="font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
        ><UserSearch class="size-5 " /><span class="hidden md:inline">
          User Session
        </span></Tabs.Trigger
      >
      <Tabs.Trigger
        value="SH"
        class="font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
        ><FileSql class="size-5 " /><span class="hidden md:inline">
          Sessions History</span
        ></Tabs.Trigger
      >
      <Tabs.Trigger
        value="QS"
        class="font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
        ><SqlQuery class="size-5 " /><span class="hidden md:inline">
          Search SQL</span
        ></Tabs.Trigger
      >
      <Tabs.Trigger
        value="EP"
        class="font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
        ><ManageSearch class="size-5 " /><span class="hidden md:inline">
          Execution Plan</span
        ></Tabs.Trigger
      >
      <Tabs.Trigger
        value="LOP"
        class="font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
        ><ReloadTime class="size-5 " /><span class="hidden md:inline">
          Long Operations</span
        ></Tabs.Trigger
      >
      <Tabs.Trigger
        value="AWR"
        class="hidden md:inline-flex font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
        ><Report class="size-5" />
        <span class="hidden md:inline">AWR Reports</span></Tabs.Trigger
      >
    </Tabs.List>
    <Tabs.Content value="CSQL" class=" w-full  ">
      <div class="h-[calc(100vh-8rem)] overflow-hidden">
        <div class=" w-full h-full overflow-hidden">
          <Field.Set class="m-1">
            <RadioGroup.Root
              bind:value={activeDBTab}
              class="flex gap-2 items-center"
              required
              ><Field.Label class="w-30 hidden md:inline-block"
                >Select a Database</Field.Label
              >
              {#each DBs.filter( (db) => db.tags.find((tag) => tag.name === "Diagnose"), ) as db}
                <Field.Label
                  class=" max-w-30 bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
                >
                  <Field.Field>
                    <Field.Content class="">
                      <Field.Title
                        class="w-full flex items-center justify-center"
                        >{db.dbLabel}</Field.Title
                      >
                    </Field.Content>
                    <RadioGroup.Item value={db.ip} id={db.ip} class="hidden" />
                  </Field.Field>
                </Field.Label>
              {/each}
              <Button
                class="   h-8 "
                disabled={!activeDBTab}
                onclick={() => {
                  CSQL();
                }}
              >
                <Switches />
              </Button>
            </RadioGroup.Root>
          </Field.Set>
          <!-- <div class="h-50 bg-red-300">a</div>
          <div class="h-10 bg-green-300">a</div> -->
          {#if activeDB}
            <Pagination.Root
              {count}
              bind:page={currentPage}
              {perPage}
              class="justify-end mb-2"
            >
              {#snippet children({ pages, currentPage })}
                <Pagination.Content>
                  <Pagination.Item>
                    <Pagination.Previous />
                  </Pagination.Item>
                  {#each pages as page (page.key)}
                    {#if page.type === "ellipsis"}
                      <Pagination.Item>
                        <Pagination.Ellipsis />
                      </Pagination.Item>
                    {:else}
                      <Pagination.Item>
                        <Pagination.Link
                          {page}
                          isActive={currentPage === page.value}
                        >
                          {page.value}
                        </Pagination.Link>
                      </Pagination.Item>
                    {/if}
                  {/each}
                  <Pagination.Item>
                    <Pagination.Next />
                  </Pagination.Item>
                </Pagination.Content>
              {/snippet}
            </Pagination.Root>
            <div
              class="border md:rounded-lg w-full max-h-[calc(100vh-11rem)] overflow-auto"
            >
              <Table.Root class="dark:text-muted-foreground ">
                <Table.Header
                  ><Table.Row class="border-none">
                    <Table.Head colspan="3" class="  uppercase "
                    ></Table.Head><Table.Head
                      colspan="2"
                      class="  uppercase  px-1"
                      ><div
                        class="border-b border-foreground h-full flex items-center justify-center uppercase"
                      >
                        CPU
                      </div></Table.Head
                    >
                    <Table.Head colspan="2" class="  uppercase  px-1"
                      ><div
                        class="border-b border-foreground h-full flex items-center justify-center uppercase"
                      >
                        IO
                      </div></Table.Head
                    >
                    <Table.Head colspan="2" class="  uppercase  px-1"
                      ><div
                        class="border-b border-foreground h-full flex items-center justify-center uppercase"
                      >
                        Elapsed
                      </div></Table.Head
                    ><Table.Head class="  uppercase"></Table.Head></Table.Row
                  ></Table.Header
                >
                <Table.Header>
                  <Table.Row>
                    <Table.Head class="text-center  uppercase">PLAN</Table.Head>
                    <Table.Head class="  uppercase ">SQL Text</Table.Head>
                    <Table.Head class="text-center  uppercase">Calls</Table.Head
                    >
                    <Table.Head class="text-center uppercase">Avg</Table.Head>
                    <Table.Head class="text-center uppercase ">TOT</Table.Head>
                    <Table.Head class="text-center  uppercase">Avg</Table.Head>
                    <Table.Head class="text-center uppercase ">TOT</Table.Head>
                    <Table.Head class="text-center  uppercase">Avg</Table.Head>
                    <Table.Head class="text-center uppercase ">TOT</Table.Head>
                    <Table.Head class="text-center  uppercase"
                      >Sql ID</Table.Head
                    >
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {#if loading}
                    <Table.Row>
                      <Table.Cell
                        colspan={isDesktop.current ? "10" : "7"}
                        class=" "
                      >
                        <div
                          class="w-full flex items-center justify-center py-10"
                        >
                          <Spinner class="h-8 w-8" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  {/if}
                  {#key DBCsql}
                    {#each DBCsql.filter((sql, i) => i >= (currentPage - 1) * perPage && i < (currentPage - 1) * perPage + perPage) as sql, i}
                      <Table.Row>
                        <Table.Cell class="text-center">
                          <Button
                            variant="secondary"
                            onclick={() => {
                              sqlID = sql.SQL_ID;
                              tab = "EP";
                              sqlPlan();
                            }}><Article class="size-6" /></Button
                          >
                        </Table.Cell>
                        <Table.Cell
                          class=" max-w-[30vw] overflow-hidden text-ellipsis text-left"
                          >{sql.SQL_TEXT}
                          <!-- <Popover.Root>
                            <Popover.Trigger
                              openOnHover
                              class="w-full text-left"
                              >{sql.SQL_TEXT}</Popover.Trigger
                            >
                            <Popover.Content
                              ><div
                                class="grid grid-cols-[auto_auto_1fr] gap-2"
                              >
                                <span>First Load Date</span><span>:</span><span
                                  >{sql.FIRST_LOAD_TIME}</span
                                ><span> Last Active Time</span><span>:</span
                                ><span> {sql.LAST_ACTIVE_TIME}</span>
                                <span># of Executions</span><span>:</span><span>
                                  {new Intl.NumberFormat("en-GB").format(
                                    sql.EXECUTIONS,
                                  )}</span
                                >
                                <span>Executions / Day</span><span>:</span><span
                                >
                                  {new Intl.NumberFormat("en-GB").format(
                                    sql.PD.toFixed(0),
                                  )}</span
                                >
                              </div></Popover.Content
                            >
                          </Popover.Root> -->
                        </Table.Cell>

                        <Table.Cell class="text-center">
                          <Popover.Root
                            onOpenChange={(open) => {
                              if (open) {
                                sql.loading = true;

                                fetch(
                                  `${page.url.pathname}/api/sqlExecutions`,
                                  {
                                    method: "POST",
                                    body: JSON.stringify({
                                      ip: activeDB.ip,
                                      username: activeDB.dbUser,
                                      password: activeDB.dbPassword,
                                      dbName: activeDB.dbName,
                                      dbPort: activeDB.dbPort,
                                      sql_id: sql.SQL_ID,
                                    }),
                                  },
                                )
                                  .then((res) => res.json())
                                  .then((result) => {
                                    sql.EXECUTIONS = result.data;
                                    // console.log(sql.EXECUTIONS);
                                    sql.loading = false;
                                  });
                              }
                            }}
                          >
                            <Popover.Trigger
                              class={buttonVariants({ variant: "secondary" })}
                              >{sql.EXE}</Popover.Trigger
                            >
                            <Popover.Content class="w-fit">
                              {#if sql.loading}
                                <div
                                  class="w-full flex items-center justify-center py-5 px-20"
                                >
                                  <Spinner class="h-8 w-8" />
                                </div>
                              {:else if sql.EXECUTIONS.length > 0}
                                <Table.Root class="dark:text-muted-foreground ">
                                  <Table.Header>
                                    <Table.Row>
                                      <Table.Head class="text-center uppercase"
                                        >Time</Table.Head
                                      >
                                      <Table.Head class="text-center uppercase"
                                        >Module</Table.Head
                                      >
                                      <Table.Head class="text-center uppercase"
                                        >Program</Table.Head
                                      >
                                      <Table.Head class="text-center uppercase"
                                        >Username</Table.Head
                                      >
                                      <Table.Head class="text-center uppercase"
                                        >CPU</Table.Head
                                      >
                                      <Table.Head class="text-center uppercase"
                                        >IO</Table.Head
                                      >
                                      <Table.Head class="text-center uppercase"
                                        >Elapsed</Table.Head
                                      >
                                    </Table.Row>
                                  </Table.Header>
                                  <Table.Body>
                                    {#each sql.EXECUTIONS as exe}
                                      <Table.Row>
                                        <Table.Cell
                                          class="align-top text-center "
                                        >
                                          {new Date(
                                            exe.SQL_EXEC_START,
                                          ).toLocaleString("en-GB", {
                                            hour: "numeric",
                                            minute: "numeric",
                                            month: "numeric",
                                            day: "numeric",
                                          })}
                                        </Table.Cell>
                                        <Table.Cell
                                          class="align-top text-center "
                                        >
                                          {exe.MODULE}
                                        </Table.Cell>
                                        <Table.Cell
                                          class="align-top text-center "
                                        >
                                          {exe.PROGRAM}
                                        </Table.Cell>
                                        <Table.Cell
                                          class="align-top text-center "
                                        >
                                          {exe.USERNAME}
                                        </Table.Cell>
                                        <Table.Cell
                                          class="align-top  text-center "
                                          >{new Intl.NumberFormat(
                                            "en-GB",
                                          ).format(exe.CPU)}</Table.Cell
                                        >
                                        <Table.Cell
                                          class="align-top  text-center "
                                          >{new Intl.NumberFormat(
                                            "en-GB",
                                          ).format(exe.IO)}</Table.Cell
                                        >
                                        <Table.Cell
                                          class="align-top  text-center "
                                          >{new Intl.NumberFormat(
                                            "en-GB",
                                          ).format(exe.ELAPSED)}</Table.Cell
                                        >
                                      </Table.Row>
                                    {/each}
                                  </Table.Body>
                                </Table.Root>
                              {:else}
                                <div
                                  class="w-full flex items-center justify-center py-5 px-20"
                                >
                                  No Executions Data.
                                </div>
                              {/if}
                            </Popover.Content>
                          </Popover.Root>
                        </Table.Cell>
                        <Table.Cell class="text-center ">
                          <Badge variant={sql.CPU_AVG < 60 ? "" : "destructive"}
                            >{sql.CPU_AVG.toFixed(2)}</Badge
                          >
                        </Table.Cell>
                        <Table.Cell class="text-center ">
                          <Badge variant="">{sql.CPU_TOT.toFixed(2)}</Badge>
                        </Table.Cell>
                        <Table.Cell class="text-center ">
                          <Badge variant={sql.IO_AVG < 60 ? "" : "destructive"}
                            >{sql.IO_AVG.toFixed(2)}</Badge
                          >
                        </Table.Cell>
                        <Table.Cell class="text-center ">
                          <Badge variant="">{sql.IO_TOT.toFixed(2)}</Badge>
                        </Table.Cell>
                        <Table.Cell class="text-center ">
                          <Badge variant={sql.ELA_AVG < 60 ? "" : "destructive"}
                            >{sql.ELA_AVG.toFixed(2)}</Badge
                          >
                        </Table.Cell>
                        <Table.Cell class="text-center ">
                          <Badge variant="">{sql.ELA_TOT.toFixed(2)}</Badge>
                        </Table.Cell>
                        <Table.Cell class=" text-center"
                          ><Copy value={sql.SQL_ID} /></Table.Cell
                        >
                      </Table.Row>
                    {:else}
                      {#if !loading && DBCsql.length === 0}
                        <Table.Row>
                          <Table.Cell colspan="10" class="text-center"
                            >No Current SQLs.</Table.Cell
                          >
                        </Table.Row>
                      {/if}
                    {/each}
                  {/key}
                </Table.Body>
              </Table.Root>
            </div>{/if}
        </div>
      </div>
    </Tabs.Content>
    <Tabs.Content value="BLKCH" class=" w-full  ">
      <div class="h-[calc(100vh-8rem)] overflow-hidden">
        <div class=" w-full h-full overflow-hidden">
          <Field.Set class="m-1 ">
            <RadioGroup.Root
              bind:value={activeDBTab}
              class="flex gap-2 items-center"
              required
              ><Field.Label class="w-30 hidden md:inline-block"
                >Select a Database</Field.Label
              >
              {#each DBs.filter( (db) => db.tags.find((tag) => tag.name === "Diagnose"), ) as db}
                <Field.Label
                  class=" max-w-30 bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
                >
                  <Field.Field>
                    <Field.Content class="">
                      <Field.Title
                        class="w-full flex items-center justify-center"
                        >{db.dbLabel}</Field.Title
                      >
                    </Field.Content>
                    <RadioGroup.Item value={db.ip} id={db.ip} class="hidden" />
                  </Field.Field>
                </Field.Label>
              {/each}
              <Button
                class="   h-8 "
                disabled={!activeDBTab}
                onclick={() => {
                  BLKCH();
                }}
              >
                <Switches />
              </Button>
            </RadioGroup.Root>
          </Field.Set>
          <!-- <div class="h-50 bg-red-300">a</div>
          <div class="h-10 bg-green-300">a</div> -->
          {#if activeDB}
            <div
              class="border border-red-5001 md:rounded-lg max-h-[calc(100vh-11rem)] max-w-200 overflow-auto"
            >
              <Table.Root class="dark:text-muted-foreground ">
                <Table.Header>
                  <Table.Row>
                    <Table.Head class="text-center  uppercase">SQL's</Table.Head
                    >
                    <Table.Head class="text-center  uppercase">sid</Table.Head>
                    <Table.Head class="  uppercase ">username</Table.Head>
                    <Table.Head class="  uppercase">program</Table.Head>
                    <Table.Head class=" uppercase ">machine</Table.Head>
                    <Table.Head class=" uppercase text-right pr-10"
                      >BLOCK CHANGES</Table.Head
                    >
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {#if loading}
                    <Table.Row>
                      <Table.Cell colspan="6" class=" ">
                        <div
                          class="w-full flex items-center justify-center py-10"
                        >
                          <Spinner class="h-8 w-8" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  {/if}
                  {#key DBBch}
                    {#each DBBch as row, i}
                      <Table.Row>
                        <Table.Cell class="text-center">
                          <Button
                            variant="secondary"
                            onclick={() => {
                              sid = row.SID;
                              serial = row.SERIAL;
                              tab = "SH";
                              SH();
                            }}><Article class="size-6" /></Button
                          >
                        </Table.Cell>
                        <Table.Cell class="text-center">
                          {row.SID}
                        </Table.Cell>
                        <Table.Cell class=" ">
                          {row.USERNAME}
                        </Table.Cell>

                        <Table.Cell class="">{row.PROGRAM}</Table.Cell>
                        <Table.Cell class="  ">
                          {row.MACHINE}
                        </Table.Cell>
                        <Table.Cell class="text-right  pr-15">
                          {new Intl.NumberFormat("en-US").format(
                            row.BLOCK_CHANGES,
                          )}
                        </Table.Cell>
                      </Table.Row>
                    {/each}
                  {/key}
                </Table.Body>
              </Table.Root>
            </div>{/if}
        </div>
      </div>
    </Tabs.Content>
    <Tabs.Content value="UH" class=" w-full  ">
      <div class="h-[calc(100vh-8rem)] overflow-hidden">
        <div class=" w-full h-full overflow-hidden">
          <!-- <div class="flex flex-row w-full items-center gap-2 mb-2"> -->
          <Field.Set class="m-1 ">
            <RadioGroup.Root
              bind:value={activeDBTab}
              class="flex gap-2 items-center"
              required
              ><Field.Label class="w-30 hidden md:inline-block"
                >Select a Database</Field.Label
              >
              {#each DBs.filter( (db) => db.tags.find((tag) => tag.name === "Diagnose"), ) as db}
                <Field.Label
                  class=" max-w-30 bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
                >
                  <Field.Field>
                    <Field.Content class="">
                      <Field.Title
                        class="w-full flex items-center justify-center"
                        >{db.dbLabel}</Field.Title
                      >
                    </Field.Content>
                    <RadioGroup.Item value={db.ip} id={db.ip} class="hidden" />
                  </Field.Field>
                </Field.Label>
              {/each}
              <Field.Label for="username" class="hidden md:inline-block w-20"
                >User Name</Field.Label
              >
              <Input
                id="username"
                name="username"
                bind:value={username}
                placeholder={isDesktop.current ? "" : "User Name"}
                class="max-w-30"
              /><Button
                class="  h-8 "
                disabled={!username || !activeDBTab}
                onclick={() => {
                  UH();
                }}>Show</Button
              >
            </RadioGroup.Root>
          </Field.Set>
          <!-- </div> -->
          <!-- <div class="h-50 bg-red-300">a</div>
          <div class="h-10 bg-green-300">a</div> -->
          {#if activeDB && !UserHistoryFirst}
            <div
              class="border border-red-5001 md:rounded-lg max-h-[calc(100vh-11rem)] overflow-auto max-w-300"
            >
              <Table.Root class="dark:text-muted-foreground ">
                <Table.Header>
                  <Table.Row>
                    <Table.Head class="text-center uppercase"
                      >session history</Table.Head
                    >
                    <Table.Head class="text-center uppercase"
                      >session id</Table.Head
                    >
                    <Table.Head class="text-center uppercase"
                      >serial#</Table.Head
                    >
                    <Table.Head class="text-center uppercase "
                      >machine</Table.Head
                    >
                    <Table.Head class="text-center uppercase"
                      >program</Table.Head
                    >
                    <Table.Head class="text-center uppercase "
                      >module</Table.Head
                    >
                    <Table.Head class="text-center uppercase "
                      >Start Time</Table.Head
                    >
                    <Table.Head class="text-center uppercase "
                      >End Time</Table.Head
                    >
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {#if loading}
                    <Table.Row>
                      <Table.Cell colspan="8" class=" ">
                        <div
                          class="w-full flex items-center justify-center py-10"
                        >
                          <Spinner class="h-8 w-8" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  {/if}
                  {#key UserHistory}
                    {#each UserHistory as row, i}
                      <Table.Row>
                        <Table.Cell class="text-center">
                          <Button
                            variant="secondary"
                            onclick={() => {
                              sid = row.SID;
                              serial = row.SERIAL;
                              tab = "SH";
                              SH();
                            }}><Article class="size-6" /></Button
                          >
                        </Table.Cell>
                        <Table.Cell class="text-center">
                          {row.SID}
                        </Table.Cell>
                        <Table.Cell class="text-center ">
                          {row.SERIAL}
                        </Table.Cell>

                        <Table.Cell class="text-center"
                          >{row.PROGRAM}</Table.Cell
                        >
                        <Table.Cell class=" text-center ">
                          {row.MACHINE}
                        </Table.Cell>
                        <Table.Cell class=" text-center ">
                          {row.MODULE}
                        </Table.Cell>
                        <Table.Cell class="align-top  text-center "
                          >{new Date(row.MIN_TIME).toLocaleString("en-GB", {
                            hour: "numeric",
                            minute: "numeric",
                            month: "numeric",
                            day: "numeric",
                          })}</Table.Cell
                        >
                        <Table.Cell class="align-top  text-center "
                          >{new Date(row.MAX_TIME).toLocaleString("en-GB", {
                            hour: "numeric",
                            minute: "numeric",
                            month: "numeric",
                            day: "numeric",
                          })}</Table.Cell
                        >
                      </Table.Row>
                    {:else}
                      {#if !loading && UserHistory.length === 0}
                        <Table.Row>
                          <Table.Cell colspan="8" class="text-center"
                            >No User History.</Table.Cell
                          >
                        </Table.Row>
                      {/if}
                    {/each}
                  {/key}
                </Table.Body>
              </Table.Root>
            </div>{/if}
        </div>
      </div>
    </Tabs.Content>
    <Tabs.Content value="SH" class=" w-full">
      <div class="h-[calc(100vh-8rem)] overflow-hidden">
        <div class=" w-full h-full overflow-hidden">
          <!-- <div class="flex flex-col md:flex-row w-full items-center gap-2 mb-2"> -->
          <Field.Set class="m-1">
            <RadioGroup.Root
              bind:value={activeDBTab}
              class="flex gap-2 items-center"
              required
              ><Field.Label class="w-30 hidden md:inline-block"
                >Select a Database</Field.Label
              >
              {#each DBs.filter( (db) => db.tags.find((tag) => tag.name === "Diagnose"), ) as db}
                <Field.Label
                  class=" max-w-30 bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
                >
                  <Field.Field>
                    <Field.Content class="">
                      <Field.Title
                        class="w-full flex items-center justify-center"
                        >{db.dbLabel}</Field.Title
                      >
                    </Field.Content>
                    <RadioGroup.Item value={db.ip} id={db.ip} class="hidden" />
                  </Field.Field>
                </Field.Label>
              {/each}
              <Field.Label for="sid" class=" ">Session ID</Field.Label>
              <Input id="sid" name="sid" bind:value={sid} class="max-w-30" />
              <Field.Label for="serial" class=" ">Serial #</Field.Label>
              <Input
                id="serial"
                name="serial"
                bind:value={serial}
                class="max-w-30 "
              />
              <Button
                class=" h-8 "
                disabled={!sid || !serial || !activeDBTab}
                onclick={() => {
                  SH();
                }}>Show</Button
              >
            </RadioGroup.Root>
          </Field.Set>

          <!-- </div> -->
          {#if activeDB && !SessionHistoryFirst}
            <div class=" md:rounded-lg h-[calc(100vh-11.5rem)] overflow-auto">
              <div
                class="border md:rounded-lg md:w-[calc(100vw-16rem)] overflow-hidden"
              >
                <Table.Root class="dark:text-muted-foreground ">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class=" text-center  uppercase"
                        >SQL Plan</Table.Head
                      >
                      <Table.Head class=" text-center  uppercase"
                        >SQL ID</Table.Head
                      >
                      <Table.Head class=" text-center  uppercase"
                        >last Time</Table.Head
                      >
                      <Table.Head class=" text-center  uppercase"
                        >first Time</Table.Head
                      >
                      <Table.Head class=" text-center  uppercase"
                        >EXECUTIONS</Table.Head
                      >
                      <Table.Head class="  uppercase">SQL Text</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#if loading}
                      <Table.Row>
                        <Table.Cell colspan={6} class=" ">
                          <div
                            class="w-full flex items-center justify-center py-10"
                          >
                            <Spinner class="h-8 w-8" />
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    {/if}

                    {#each SessionHistory as row, i}
                      <Table.Row>
                        <Table.Cell class="align-top text-center ">
                          <Button
                            variant="secondary"
                            onclick={() => {
                              sqlID = row.SQL_ID;
                              tab = "EP";
                              sqlPlan();
                            }}><Article class="size-6" /></Button
                          ></Table.Cell
                        >
                        <Table.Cell class="align-top text-center "
                          >{row.SQL_ID}
                        </Table.Cell>
                        <Table.Cell class="align-top  text-center "
                          >{new Date(row.MAX_TIME).toLocaleString("en-GB", {
                            hour: "numeric",
                            minute: "numeric",
                            month: "numeric",
                            day: "numeric",
                          })}</Table.Cell
                        >
                        <Table.Cell class="align-top  text-center "
                          >{new Date(row.MIN_TIME).toLocaleString("en-GB", {
                            hour: "numeric",
                            minute: "numeric",
                            month: "numeric",
                            day: "numeric",
                          })}</Table.Cell
                        >
                        <Table.Cell class="align-top text-center  "
                          >{row.EXECS}</Table.Cell
                        >
                        <Table.Cell
                          class="align-top text-left overflow-hidden break-all whitespace-normal min-w-80"
                        >
                          {row.SQL_TEXT}
                        </Table.Cell>
                      </Table.Row>
                    {:else}
                      {#if !loading && SessionHistory.length === 0}
                        <Table.Row>
                          <Table.Cell colspan="6" class="text-center"
                            >No Session History.</Table.Cell
                          >
                        </Table.Row>
                      {/if}
                    {/each}
                  </Table.Body>
                </Table.Root>
              </div>
            </div>
          {/if}
        </div>
      </div></Tabs.Content
    >
    <Tabs.Content value="QS" class=" w-full">
      <div class="h-[calc(100vh-8rem)] overflow-hidden">
        <div class=" w-full h-full overflow-hidden">
          <!-- <div class="flex flex-col md:flex-row w-full items-center gap-2 mb-2"> -->
          <Field.Set class="m-1">
            <RadioGroup.Root
              bind:value={activeDBTab}
              class="flex gap-2 items-center"
              required
              ><Field.Label class="w-30 hidden md:inline-block"
                >Select a Database</Field.Label
              >
              {#each DBs.filter( (db) => db.tags.find((tag) => tag.name === "Diagnose"), ) as db}
                <Field.Label
                  class=" max-w-30 bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
                >
                  <Field.Field>
                    <Field.Content class="">
                      <Field.Title
                        class="w-full flex items-center justify-center"
                        >{db.dbLabel}</Field.Title
                      >
                    </Field.Content>
                    <RadioGroup.Item value={db.ip} id={db.ip} class="hidden" />
                  </Field.Field>
                </Field.Label>
              {/each}
              <Field.Label for="sqlText" class=" ">SQL Text</Field.Label>
              <Input
                id="sqlText"
                name="sqlText"
                bind:value={sqlText}
                class="max-w-40"
              />
              <Button
                class=" h-8 "
                disabled={!sqlText || !activeDBTab}
                onclick={() => {
                  QS();
                }}>Show</Button
              >
            </RadioGroup.Root>
          </Field.Set>

          <!-- </div> -->
          {#if activeDB && !sqlTextFirst}
            <div class=" md:rounded-lg h-[calc(100vh-11.5rem)] overflow-auto">
              <div
                class="border md:rounded-lg md:w-[calc(100vw-16rem)] overflow-hidden"
              >
                <Table.Root class="dark:text-muted-foreground ">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class=" text-center  uppercase"
                        >SQL Plan</Table.Head
                      >
                      <Table.Head class=" text-center  uppercase"
                        >SQL ID</Table.Head
                      >
                      <Table.Head class=" text-center  uppercase"
                        >EXECUTIONS</Table.Head
                      >
                      <Table.Head class=" text-center  uppercase"
                        >first Time</Table.Head
                      >
                      <Table.Head class="  uppercase">SQL Text</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#if loading}
                      <Table.Row>
                        <Table.Cell colspan={6} class=" ">
                          <div
                            class="w-full flex items-center justify-center py-10"
                          >
                            <Spinner class="h-8 w-8" />
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    {/if}

                    {#each SQLs as row, i}
                      <Table.Row>
                        <Table.Cell class="align-top text-center ">
                          <Button
                            variant="secondary"
                            onclick={() => {
                              sqlID = row.SQL_ID;
                              tab = "EP";
                              sqlPlan();
                            }}><Article class="size-6" /></Button
                          ></Table.Cell
                        >
                        <Table.Cell class="align-top text-center "
                          >{row.SQL_ID}
                        </Table.Cell>
                        <Table.Cell class="align-top  text-center ">
                          <Popover.Root
                            onOpenChange={(open) => {
                              if (open) {
                                row.loading = true;

                                fetch(
                                  `${page.url.pathname}/api/sqlExecutions`,
                                  {
                                    method: "POST",
                                    body: JSON.stringify({
                                      ip: activeDB.ip,
                                      username: activeDB.dbUser,
                                      password: activeDB.dbPassword,
                                      dbName: activeDB.dbName,
                                      dbPort: activeDB.dbPort,
                                      sql_id: row.SQL_ID,
                                    }),
                                  },
                                )
                                  .then((res) => res.json())
                                  .then((result) => {
                                    row.EXECUTIONS = result.data;
                                    // console.log(sql.EXECUTIONS);
                                    row.loading = false;
                                  });
                              }
                            }}
                          >
                            <Popover.Trigger
                              class={buttonVariants({ variant: "secondary" })}
                              >{row.EXES}</Popover.Trigger
                            >
                            <Popover.Content class="w-fit">
                              {#if row.loading}
                                <div
                                  class="w-full flex items-center justify-center py-5 px-20"
                                >
                                  <Spinner class="h-8 w-8" />
                                </div>
                              {:else if row.EXECUTIONS.length > 0}
                                <Table.Root class="dark:text-muted-foreground ">
                                  <Table.Header>
                                    <Table.Row>
                                      <Table.Head class="text-center uppercase"
                                        >Time</Table.Head
                                      >
                                      <Table.Head class="text-center uppercase"
                                        >Module</Table.Head
                                      >
                                      <Table.Head class="text-center uppercase"
                                        >Program</Table.Head
                                      >
                                      <Table.Head class="text-center uppercase"
                                        >Username</Table.Head
                                      >
                                      <Table.Head class="text-center uppercase"
                                        >CPU</Table.Head
                                      >
                                      <Table.Head class="text-center uppercase"
                                        >IO</Table.Head
                                      >
                                      <Table.Head class="text-center uppercase"
                                        >Elapsed</Table.Head
                                      >
                                    </Table.Row>
                                  </Table.Header>
                                  <Table.Body>
                                    {#each row.EXECUTIONS as exe}
                                      <Table.Row>
                                        <Table.Cell
                                          class="align-top text-center "
                                        >
                                          {new Date(
                                            exe.SQL_EXEC_START,
                                          ).toLocaleString("en-GB", {
                                            hour: "numeric",
                                            minute: "numeric",
                                            month: "numeric",
                                            day: "numeric",
                                          })}
                                        </Table.Cell>
                                        <Table.Cell
                                          class="align-top text-center "
                                        >
                                          {exe.MODULE}
                                        </Table.Cell>
                                        <Table.Cell
                                          class="align-top text-center "
                                        >
                                          {exe.PROGRAM}
                                        </Table.Cell>
                                        <Table.Cell
                                          class="align-top text-center "
                                        >
                                          {exe.USERNAME}
                                        </Table.Cell>
                                        <Table.Cell
                                          class="align-top  text-center "
                                          >{new Intl.NumberFormat(
                                            "en-GB",
                                          ).format(exe.CPU)}</Table.Cell
                                        >
                                        <Table.Cell
                                          class="align-top  text-center "
                                          >{new Intl.NumberFormat(
                                            "en-GB",
                                          ).format(exe.IO)}</Table.Cell
                                        >
                                        <Table.Cell
                                          class="align-top  text-center "
                                          >{new Intl.NumberFormat(
                                            "en-GB",
                                          ).format(exe.ELAPSED)}</Table.Cell
                                        >
                                      </Table.Row>
                                    {/each}
                                  </Table.Body>
                                </Table.Root>
                              {:else}
                                <div
                                  class="w-full flex items-center justify-center py-5 px-20"
                                >
                                  No Executions Data.
                                </div>
                              {/if}
                            </Popover.Content>
                          </Popover.Root>
                        </Table.Cell>
                        <Table.Cell class="align-top  text-center "
                          >{new Date(row.FIRST_LOAD_TIME).toLocaleString(
                            "en-GB",
                            {
                              hour: "numeric",
                              minute: "numeric",
                              month: "numeric",
                              day: "numeric",
                            },
                          )}</Table.Cell
                        >
                        <Table.Cell
                          class="align-top text-left overflow-hidden break-all whitespace-normal min-w-80"
                        >
                          {row.SQL_TEXT}
                        </Table.Cell>
                      </Table.Row>
                    {:else}
                      {#if !loading && SessionHistory.length === 0}
                        <Table.Row>
                          <Table.Cell colspan="6" class="text-center"
                            >No Session History.</Table.Cell
                          >
                        </Table.Row>
                      {/if}
                    {/each}
                  </Table.Body>
                </Table.Root>
              </div>
            </div>
          {/if}
        </div>
      </div></Tabs.Content
    >
    <Tabs.Content value="EP" class=" w-full">
      <div class="h-[calc(100vh-8rem)] overflow-hidden">
        <div class=" w-full h-full overflow-hidden">
          <!-- <div class="flex flex-col md:flex-row w-full items-center gap-2 mb-2"> -->
          <Field.Set class="m-1">
            <RadioGroup.Root
              bind:value={activeDBTab}
              class="flex gap-2 items-center flex-wrap"
              required
              ><Field.Label class="w-30 hidden md:inline-block"
                >Select a Database</Field.Label
              >
              {#each DBs.filter( (db) => db.tags.find((tag) => tag.name === "Diagnose"), ) as db}
                <Field.Label
                  class=" max-w-30 bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
                >
                  <Field.Field>
                    <Field.Content class="">
                      <Field.Title
                        class="w-full flex items-center justify-center"
                        >{db.dbLabel}</Field.Title
                      >
                    </Field.Content>
                    <RadioGroup.Item value={db.ip} id={db.ip} class="hidden" />
                  </Field.Field>
                </Field.Label>
              {/each}
              <Field.Label for="sqlid" class=" ">Sql ID</Field.Label>
              <Input
                id="sqlid"
                name="sqlid"
                bind:value={sqlID}
                class="max-w-30"
              />
              <Button
                class=" h-8 "
                disabled={!sqlID || !activeDBTab}
                onclick={() => {
                  sqlPlan();
                }}>Show</Button
              >
              <Label for="sqlid" class=" ">Plan ID</Label>
              <Select.Root
                type="single"
                bind:value={planID}
                disabled={!planData.length}
                class=""
              >
                <Select.Trigger
                  id="sqlid"
                  class="data-[size=default]:h-8 flex-1  md:max-w-50 max-w-full w-full"
                >
                  {planID
                    ? planID +
                      " , " +
                      planData.find(
                        (item) => item.ID === 0 && planID === item.planID,
                      ).COST
                    : "No Plan"}
                </Select.Trigger>
                <Select.Content class="max-h-[300px]">
                  {#each planData.filter((item) => item.ID === 0) as item}
                    <Select.Item
                      value={item.planID}
                      class={[planID === item.planID && "text-selected"]}
                      >{item.planID} - {item.COST}</Select.Item
                    >
                  {/each}
                </Select.Content>
              </Select.Root>
            </RadioGroup.Root>
          </Field.Set>

          {#if activeDB && sqlID === planedSqlID && !planDataFirst}
            <div
              class=" md:rounded-lg md:h-[calc(100vh-10.5rem)] h-[calc(100vh-13rem)] overflow-auto w-full"
            >
              <div
                class="border md:rounded-lg md:w-[calc(100vw-16rem)] overflow-hidden"
              >
                {#if planID}
                  <div class="flex p-2 gap-2 items-center bg-accent">
                    <Label class=" ">Hash Value</Label>
                    <Label class=" "
                      >{planData.find(
                        (item) => item.ID === 0 && planID === item.planID,
                      ).HASH_VALUE}</Label
                    ><Copy
                      value={planData.find(
                        (item) => item.ID === 0 && planID === item.planID,
                      ).HASH_VALUE}
                    />
                  </div>
                {/if}
                <Table.Root class="dark:text-muted-foreground ">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class="  uppercase">ID</Table.Head>
                      <Table.Head class="  uppercase">OPERATION</Table.Head>
                      <Table.Head class="  uppercase">OBJECT NAME</Table.Head>
                      <Table.Head class="text-center uppercase">COST</Table.Head
                      >
                      <Table.Head class="text-center uppercase"
                        >CARDINALITY</Table.Head
                      >
                      <Table.Head class="text-center uppercase"
                        >CPU COST</Table.Head
                      >
                      <Table.Head class="text-center uppercase"
                        >IO COST</Table.Head
                      >
                      <Table.Head class="  uppercase">ACCESS</Table.Head>
                      <Table.Head class="  uppercase">FILTER</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#if loading}
                      <Table.Row>
                        <Table.Cell colspan={9} class=" ">
                          <div
                            class="w-full flex items-center justify-center py-10"
                          >
                            <Spinner class="h-8 w-8" />
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    {/if}
                    {#each planData.filter((item) => planID === item.planID) as row, i}
                      <Table.Row>
                        <Table.Cell class="align-top text-left "
                          >{row.ID}</Table.Cell
                        >
                        <Table.Cell class="align-top text-left "
                          ><pre class="w-full">{row.OPERATION}</pre></Table.Cell
                        >
                        <Table.Cell class="align-top text-left "
                          >{row.OBJECT_NAME || ""}</Table.Cell
                        >
                        <Table.Cell class="align-top text-center "
                          >{row.COST
                            ? new Intl.NumberFormat("en-GB").format(
                                row.COST.toFixed(0),
                              )
                            : ""}</Table.Cell
                        >
                        <Table.Cell class="align-top text-center">
                          {row.CARDINALITY
                            ? new Intl.NumberFormat("en-GB").format(
                                row.CARDINALITY.toFixed(0),
                              )
                            : ""}</Table.Cell
                        ><Table.Cell class="align-top text-center"
                          >{row.CPU_COST
                            ? new Intl.NumberFormat("en-GB").format(
                                row.CPU_COST.toFixed(0),
                              )
                            : ""}</Table.Cell
                        >
                        <Table.Cell class="align-top text-center"
                          >{row.IO_COST
                            ? new Intl.NumberFormat("en-GB").format(
                                row.IO_COST.toFixed(0),
                              )
                            : ""}</Table.Cell
                        >
                        <Table.Cell class="align-top  max-w-100"
                          ><div
                            class="h-full text-left whitespace-pre-wrap text-wrap wrap-break-word"
                          >
                            {row.ACCESS_PREDICATES || ""}
                          </div>
                        </Table.Cell>
                        <Table.Cell class="align-top  max-w-100"
                          ><div
                            class="h-full text-left whitespace-pre-wrap text-wrap wrap-break-word"
                          >
                            {row.FILTER_PREDICATES || ""}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    {:else}
                      {#if !loading && planData.length === 0 && !planDataFirst}
                        <Table.Row>
                          <Table.Cell colspan="9" class="text-center"
                            >No Sql Plan.</Table.Cell
                          >
                        </Table.Row>
                      {/if}
                    {/each}
                  </Table.Body>
                </Table.Root>
              </div>
              {#if sql}
                <div
                  class=" my-5 flex relative w-full rounded-md border bg-background py-4 pl-4 dark:text-muted-foreground"
                >
                  <pre class="w-full whitespace-pre-wrap wrap-break-word">
{sqlFormated}</pre>
                  <div class=" absolute right-4 top-4">
                    <Copy value={sqlFormated} />
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div></Tabs.Content
    >
    <Tabs.Content value="LOP" class=" w-full  ">
      <div class="h-[calc(100vh-8rem)] overflow-hidden">
        <div class=" w-full h-full overflow-hidden">
          <Field.Set class="m-1">
            <RadioGroup.Root
              bind:value={activeDBTab}
              class="flex gap-2 items-center"
              required
              ><Field.Label class="w-30 hidden md:inline-block"
                >Select a Database</Field.Label
              >
              {#each DBs.filter( (db) => db.tags.find((tag) => tag.name === "Diagnose"), ) as db}
                <Field.Label
                  class=" max-w-30 bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
                >
                  <Field.Field>
                    <Field.Content class="">
                      <Field.Title
                        class="w-full flex items-center justify-center"
                        >{db.dbLabel}</Field.Title
                      >
                    </Field.Content>
                    <RadioGroup.Item value={db.ip} id={db.ip} class="hidden" />
                  </Field.Field>
                </Field.Label>
              {/each}
              <Button
                class=" h-8 "
                disabled={!activeDBTab}
                onclick={() => {
                  LOP();
                }}><Switches /></Button
              >
            </RadioGroup.Root>
          </Field.Set>
          {#if activeDB}
            <div
              class="border border-red-5001 md:rounded-lg max-h-[calc(100vh-11rem)] overflow-auto"
            >
              <Table.Root class="dark:text-muted-foreground ">
                <Table.Header>
                  <Table.Row>
                    <Table.Head class="  uppercase">SID</Table.Head>
                    <Table.Head class="  uppercase">User Name</Table.Head>
                    <Table.Head class=" uppercase hidden md:table-cell"
                      >Object Name</Table.Head
                    >
                    <Table.Head class=" uppercase hidden md:table-cell"
                      >Operation</Table.Head
                    >
                    <Table.Head class="hidden md:table-cell  uppercase">
                      Machine
                    </Table.Head>
                    <!-- <Table.Head class="uppercase hidden md:table-cell"
                      >Object</Table.Head
                    > -->
                    <Table.Head class="  uppercase md:w-[60%]"
                      >Percent</Table.Head
                    >
                    <Table.Head class="  uppercase">Time Remaining</Table.Head>
                    <Table.Head class="  uppercase">Sql ID</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {#if loading}
                    <Table.Row>
                      <Table.Cell
                        colspan={isDesktop.current ? "8" : "7"}
                        class=" "
                      >
                        <div
                          class="w-full flex items-center justify-center py-10"
                        >
                          <Spinner class="h-8 w-8" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  {/if}
                  {#key DBLop}
                    {#each DBLop as op, i}
                      <Table.Row>
                        <Table.Cell class="">{op.SID}</Table.Cell>
                        <Table.Cell class="text-center"
                          >{op.USERNAME}</Table.Cell
                        >
                        <Table.Cell class="text-left">{op.TARGET}</Table.Cell>
                        <Table.Cell class="text-center hidden md:table-cell"
                          >{op.OPNAME}</Table.Cell
                        >
                        <Table.Cell class=" text-center hidden md:table-cell"
                          >{op.MACHINE}</Table.Cell
                        >
                        <!-- <Table.Cell class="hidden md:table-cell"
                          >{op.OBJECT}</Table.Cell
                        > -->
                        <Table.Cell class="">
                          <div class="flex items-center gap-1">
                            <div class="w-10 flex justify-end">
                              {op.PERCENT}%
                            </div>
                            {#if isDesktop.current}
                              <Progress
                                class="h-5 "
                                barClass="dark:bg-muted-foreground"
                                value={op.PERCENT}
                                max={100}
                              />
                            {/if}
                          </div></Table.Cell
                        ><Table.Cell class=" text-center"
                          >{op.TIME_REMAINING}</Table.Cell
                        >
                        <Table.Cell class=" text-center"
                          ><Copy value={op.SQL_ID} /></Table.Cell
                        >
                      </Table.Row>
                    {:else}
                      {#if !loading && DBLop.length === 0}
                        <Table.Row>
                          <Table.Cell colspan="8" class="text-center"
                            >No Long Operations.</Table.Cell
                          >
                        </Table.Row>
                      {/if}
                    {/each}
                  {/key}
                </Table.Body>
              </Table.Root>
            </div>{/if}
        </div>
      </div></Tabs.Content
    >
    <Tabs.Content value="AWR" class=" w-full">
      <div class="h-[calc(100vh-8rem)] overflow-hidden">
        <div class=" w-full h-full overflow-auto">
          <!-- <div class=" w-full flex flex-col md:flex-row"> -->
          <Field.Set class="m-1">
            <RadioGroup.Root
              bind:value={activeDBTab}
              class="flex gap-2 items-center"
              required
              ><Field.Label class="w-30 hidden md:inline-block"
                >Select a Database</Field.Label
              >
              {#each DBs.filter( (db) => db.tags.find((tag) => tag.name === "Diagnose"), ) as db}
                <Field.Label
                  class=" max-w-30 bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
                >
                  <Field.Field>
                    <Field.Content class="">
                      <Field.Title
                        class="w-full flex items-center justify-center"
                        >{db.dbLabel}</Field.Title
                      >
                    </Field.Content>
                    <RadioGroup.Item value={db.ip} id={db.ip} class="hidden" />
                  </Field.Field>
                </Field.Label>
              {/each}
              {#if activeDB}
                <Select.Root type="multiple" bind:value={AWRselected} class="">
                  <Select.Trigger
                    class="data-[size=default]:h-8 flex-1  md:max-w-100 max-w-full w-full"
                  >
                    {AWRselected.length > 0
                      ? AWRselected.length > 1
                        ? DBawr.find((awr) => awr.SNAPID === AWRselected[0])
                            ?.BEGIN +
                          " - " +
                          DBawr.find(
                            (awr) =>
                              awr.SNAPID ===
                              AWRselected[AWRselected.length - 1],
                          )?.BEGIN
                        : DBawr.find((awr) => awr.SNAPID === AWRselected[0])
                            ?.BEGIN
                      : "Select Snapshots"}
                  </Select.Trigger>
                  <Select.Content class="max-h-[300px]">
                    {#each DBawr as item}
                      <Select.Item
                        value={item.SNAPID}
                        class={[
                          AWRselected.includes(item.SNAPID) && "text-selected",
                        ]}>{item.SNAPID} - {item.BEGIN}</Select.Item
                      >
                    {/each}
                  </Select.Content>
                </Select.Root>
                <Field.Set class="">
                  <RadioGroup.Root
                    bind:value={reportType}
                    class="grid grid-cols-2 gap-2"
                    required
                  >
                    <Field.Label
                      class="[&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
                    >
                      <Field.Field>
                        <Field.Content class="">
                          <Field.Title
                            class="w-full flex items-center justify-center"
                            >AWR</Field.Title
                          >
                        </Field.Content>
                        <RadioGroup.Item value="awr" id="awr" class="hidden" />
                      </Field.Field>
                    </Field.Label>
                    <Field.Label
                      class="[&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
                    >
                      <Field.Field>
                        <Field.Content class="">
                          <Field.Title
                            class="w-full flex items-center justify-center"
                            >ADDM</Field.Title
                          >
                        </Field.Content>
                        <RadioGroup.Item
                          value="addm"
                          id="addm"
                          class="hidden"
                        />
                      </Field.Field>
                    </Field.Label>
                  </RadioGroup.Root>
                </Field.Set>
                <Button
                  class="h-8  "
                  disabled={AWRselected.length < 2 || loading}
                  onclick={() => {
                    loading = true;
                    awrReport = undefined;

                    fetch(`${page.url.pathname}/api/report`, {
                      method: "POST",
                      body: JSON.stringify({
                        ip: activeDB.ip,
                        username: activeDB.username,
                        password: activeDB.password,
                        reportType,
                        startSnapId: Math.min(
                          ...AWRselected.map((item) => {
                            return parseInt(item);
                          }),
                        ),
                        endSnapId: Math.max(
                          ...AWRselected.map((item) => {
                            return parseInt(item);
                          }),
                        ),
                      }),
                    })
                      .then((response) => response.json())
                      .then(({ report }) => {
                        loading = false;
                        awrReport = report;
                      });
                  }}>Generate</Button
                >
                <Button
                  class="h-8 "
                  disabled={!awrReport}
                  onclick={() => {
                    let a = document.createElement("a");
                    document.body.append(a);
                    if (reportType === "awr") {
                      a.download = `${activeDB.dbLabel}-${reportType}-${Math.min(
                        ...AWRselected.map((item) => {
                          return parseInt(item);
                        }),
                      )}-${Math.max(
                        ...AWRselected.map((item) => {
                          return parseInt(item);
                        }),
                      )}.html`;
                      a.href = URL.createObjectURL(
                        new Blob([awrReport], { type: "text/html" }),
                      );
                    } else {
                      a.download = `${activeDB.dbLabel}-${reportType}-${Math.min(
                        ...AWRselected.map((item) => {
                          return parseInt(item);
                        }),
                      )}-${Math.max(
                        ...AWRselected.map((item) => {
                          return parseInt(item);
                        }),
                      )}.txt`;
                      a.href = URL.createObjectURL(
                        new Blob([awrReport], { type: "text/text" }),
                      );
                    }
                    a.click();
                    a.remove();
                  }}>Download</Button
                >
              {/if}
            </RadioGroup.Root>
          </Field.Set>

          <!-- </div> -->
          {#if loading}
            <div
              class=" mb-5 mt-10 flex w-full justify-center items-center text-lg font-semibold text-muted-foreground"
            >
              Please Wait Generating Report<DotsBounce
                class="ml-0.5 translate-y-1"
              />
            </div>
          {/if}
          {#if awrReport}
            {#if reportType === "awr"}
              <div class=" mt-5 bg-white">
                {@html awrReport}
              </div>
            {:else}
              <div class=" mt-5 w-full">
                <pre class="w-full">
{awrReport}
</pre>
              </div>
            {/if}
          {/if}
        </div>
      </div></Tabs.Content
    >
  </Tabs.Root>
</div>
