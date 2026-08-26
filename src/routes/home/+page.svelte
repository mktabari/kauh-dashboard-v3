<script>
  import * as Alert from "$lib/components/ui/alert/index.js";
  import CheckCircle2Icon from "@lucide/svelte/icons/check-circle-2";
  import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
  import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
  import PopcornIcon from "@lucide/svelte/icons/popcorn";

  import ta from "time-ago";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { page } from "$app/state";
  import { onMount, onDestroy } from "svelte";
  import {
    ClipPath,
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
    ArcChart,
    Group,
    Text,
    Arc,
    Svg,
    Grid,
  } from "layerchart";
  import { scaleThreshold, scaleTime, scaleBand, scaleLinear } from "d3-scale";
  import { timeFormat } from "d3-time-format";
  import { timeDay, timeHour } from "d3-time";
  import Spinner from "~icons/svg-spinners/bars-scale-fade";
  import LoadingLoop from "~icons/line-md/loading-loop";
  import Up from "~icons/icon-park-solid/up-two";
  import Database from "~icons/mdi/database";
  // import { date } from "drizzle-orm/mysql-core";
  // import { duration } from "drizzle-orm/gel-core";
  let { data } = $props();
  // svelte-ignore state_referenced_locally
  let checkVeeam = $state(data.veeam);
  // svelte-ignore state_referenced_locally
  let metricsServers = $state(data.metrics);
  // svelte-ignore state_referenced_locally
  let dbStatusServers = $state(data.dbStatus);
  // svelte-ignore state_referenced_locally
  let checkMountServers = $state(data.checkMount);
  // svelte-ignore state_referenced_locally
  let checkSANServers = $state(data.SANs);
  // svelte-ignore state_referenced_locally
  let checkDBBackups = $state([]);
  // svelte-ignore state_referenced_locally
  data.DBs.forEach((db) => {
    if (!checkDBBackups.some((d) => d.dbSizeGroup === db.dbSizeGroup)) {
      checkDBBackups.push(db);
    }
  });
  let alerts = $state([]);
  let checksCount = $state(1 + checkDBBackups.length + checkVeeam.length);
  let socket = $state();
  let METRICS = $state([]);
  let dbStatus = $state([]);
  let checkMount = $state([]);
  let checkSAN = $state([]);
  let checkBackups = $state([]);
  let server_metrics = $derived(
    metricsServers.map((server) => {
      return {
        name: server.name,
        metrics: METRICS.filter((metric) => metric.server === server.name).map(
          (m) => {
            return {
              server: m.server,
              date: new Date(m.date),

              io: m.io,
              cpu: 100 - m.cpu,
            };
          },
        ),
      };
    }),
  );
  let server_mount = $derived(
    checkMountServers.map((server) => {
      return {
        name: server.name,
        mountPoints: server.mountPoint
          .toUpperCase()
          .split(" ")
          .map((point) => {
            return {
              path: "/" + point.replace("/", ""),
              used:
                checkMount.find(
                  (m) =>
                    m.mountPoint === "/" + point.replace("/", "") &&
                    m.server === server.name,
                )?.used || 0,
            };
          }),
      };
    }),
  );
  let server_dbStatus = $derived(
    dbStatusServers.map((server) => {
      return {
        name: server.dbLabel,
        dbStatus:
          dbStatus.find((d) => d.server === server.dbLabel)?.dbStatus || "down",
      };
    }),
  );
  let server_san = $derived(
    checkSANServers.map((server) => {
      return {
        name: server.name,
        sanStatus: {
          size:
            checkSAN.find((d) => d.server === server.name)?.sanStatus.size || 0,
          used:
            checkSAN.find((d) => d.server === server.name)?.sanStatus.used || 0,
          free:
            checkSAN.find((d) => d.server === server.name)?.sanStatus.free || 0,
          usedPercent:
            checkSAN.find((d) => d.server === server.name)?.sanStatus
              .usedPercent || 0,
          sizeFormated:
            checkSAN.find((d) => d.server === server.name)?.sanStatus
              .sizeFormated || 0,
          usedFormated:
            checkSAN.find((d) => d.server === server.name)?.sanStatus
              .usedFormated || 0,
          freeFormated:
            checkSAN.find((d) => d.server === server.name)?.sanStatus
              .freeFormated || 0,
        },
      };
    }),
  );

  onMount(async () => {
    fetch(`faults/api/getData`)
      .then((res) => res.json())
      .then((result) => {
        checksCount--;
        result.san.forEach((server) => {
          if (server.result.length > 0) {
            alerts.push({
              type: server.result.some((r) => r.content.severity < 3)
                ? "error"
                : "alert",
              title: server.result.some((r) => r.content.severity < 3)
                ? "SAN Faults"
                : "SAN Alerts",
              message: `${server.name.toUpperCase()} has ${server.result.some((r) => r.content.severity < 3) ? "critical" : "non critical"} alerts!`,
            });
          }
        });
        result.ovs.forEach((server) => {
          if (server.result !== "") {
            alerts.push({
              type: "error",

              title: "OVS Faults",
              message: `${server.name.toUpperCase()} has Faults!`,
            });
          }
        });
      });
    checkDBBackups.forEach((server) => {
      fetch(`/database/api/backups`, {
        method: "POST",
        body: JSON.stringify({
          ip: server.ip,
          username: server.dbUser,
          password: server.dbPassword,
          dbName: server.dbName,
          dbPort: server.dbPort,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          checksCount--;
          if (
            !result.data.filter(
              (backup) =>
                new Date(backup.START_TIME) >
                new Date(new Date().getTime() - 1000 * 60 * 60 * 24).setHours(
                  0,
                  0,
                  0,
                  0,
                ),
            ).length
          )
            alerts.push({
              type: "alert",
              title: "No Recent Backups",
              message: `No Backups for ${server.dbName.toUpperCase()} sence yesterday!`,
            });
          result.data.forEach((backup) => {
            if (backup.STATUS === "FAILED") {
              alerts.push({
                type: "error",
                title: "Backup Failed",
                message: `Backup failed for ${server.dbName.toUpperCase()} at ${new Date(
                  backup.START_TIME,
                ).toLocaleString()}`,
              });
            }
            if (
              new Date(backup.END_TIME) <
              new Date().setHours(0, 0, 0, 0) - 1000 * 60 * 60 * 24 * 6
            )
              return;
            checkBackups.push({
              category: server.dbName.toUpperCase(),
              start: new Date(backup.START_TIME),
              end: backup.END_TIME
                ? new Date(backup.END_TIME)
                : new Date(
                    new Date(backup.START_TIME).setSeconds(
                      new Date(backup.START_TIME).getSeconds() + 60 * 60,
                    ),
                  ),
              status: backup.STATUS.replace(
                "COMPLETED WITH WARNINGS",
                "Completed",
              ),
              duration: ta
                .ago(
                  new Date() -
                    (new Date(backup.END_TIME) - new Date(backup.START_TIME)),
                )
                .replace(" ago", ""),
            });
          });
        });
    });

    checkVeeam.forEach((server) =>
      fetch(
        `/cloudBackup/api/getData/${server.id}`,
        // , {
        //   method: "POST",
        //   body: JSON.stringify({
        //     ip: server.ip,
        //     username: server.username,
        //     password: server.password,
        //   }),
        // }
      )
        .then((res) => res.json())
        .then(({ result }) => {
          checksCount--;
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          result.forEach((job) => {
            if (new Date(job.EndTime) > cutoffDate)
              if (job.Result !== "Success")
                alerts.push({
                  type: "error",
                  title: "Cloud Backup Failed",
                  message: `Backup job started on ${job.CreationTime} failed`,
                });
          });
        }),
    );

    checkMountServers.forEach((server) =>
      fetch(`${page.url.pathname}/api/checkMountPoint`, {
        method: "POST",
        body: JSON.stringify({
          ip: server.ip,
          username: server.username,
          password: server.password,
          mountPoint: server.mountPoint,
        }),
      })
        .then((res) => res.json())
        .then(({ result }) => {
          result.forEach((mount) => {
            let data = mount.split(" ");
            checkMount.push({
              server: server.name,
              mountPoint: data[3].toUpperCase(),
              used: Number(data[2].replace("%", "")),
            });
          });
        }),
    );
    dbStatusServers.forEach((server) =>
      fetch(`${page.url.pathname}/api/dbStatus`, {
        method: "POST",
        body: JSON.stringify({
          ip: server.ip,
          username: server.dbUser,
          password: server.dbPassword,
          dbName: server.dbName,
          dbPort: server.dbPort,
        }),
      })
        .then((res) => res.json())
        .then(({ result }) => {
          dbStatus.push({ server: server.dbLabel, dbStatus: result });
        }),
    );
    metricsServers.forEach((server) => {
      if (server.name != "test isoft 66") return;
      fetch(`${page.url.pathname}/api/metrics`, {
        method: "POST",
        body: JSON.stringify({
          ip: server.ip,
          username: server.username,
          password: server.password,
        }),
      })
        .then((res) => res.json())
        .then(({ result }) => {
          let cpu = result.cpu
            .split("\n")
            .filter((item) => item)
            .map((item) => {
              let time = item.split(" ")[0].split(":").map(Number);
              return {
                date: new Date().setHours(
                  Number(time[0]),
                  Number(time[1]),
                  Number(time[2]),
                ),
                cpu: Number(item.split(" ")[1]),
              };
            });

          let time;
          let io = result.io
            .split("\n")
            .map((item) => {
              let line = item.replace(/\s+/g, " ").trim();
              if (line) return line;
              else return null;
            })
            .filter((item) => item)
            .filter((item, index, array) => {
              if (index >= array.length - 5 || index < 2) return false;
              return true;
            })
            .map((item) => {
              if (isNaN(item.substring(0, 2)))
                return {
                  date: time,
                  io: Number(item.split(" ")[1]),
                };
              else {
                time = item.substring(0, 8);
                return {
                  date: time,
                  io: Number(item.split(" ")[2]),
                };
              }
            });
          const grouped = Object.groupBy(io, (item) => item.date);
          io = Object.entries(grouped).map(([date, group]) => ({
            date: new Date().setHours(
              Number(date.substring(0, 2)),
              Number(date.substring(3, 5)),
              Number(date.substring(6, 8)),
            ),
            io: Math.max(...group.map((i) => i.io)),
          }));
          io.forEach((item, i) => {
            METRICS.push({
              server: server.name,
              io: item.io,
              cpu: cpu[i].cpu,
              date: item.date,
            });
          });
        });
    });
    checkSANServers.forEach((server) =>
      fetch(`${page.url.pathname}/api/san`, {
        method: "POST",
        body: JSON.stringify({
          ip: server.ip,
          username: server.username,
          password: server.password,
        }),
      })
        .then((res) => res.json())
        .then(({ result }) => {
          checkSAN.push({
            server: server.name,
            sanStatus: {
              size: result.sizeTotal,
              sizeFormated: new Intl.NumberFormat("en-US", {
                style: "unit",
                unit: "byte",
                unitDisplay: "narrow",
                notation: "compact",
              }).format(result.sizeTotal),
              used: result.sizeUsed,
              usedFormated: new Intl.NumberFormat("en-US", {
                style: "unit",
                unit: "byte",
                unitDisplay: "narrow",
                notation: "compact",
              }).format(result.sizeUsed),
              usedPercent: Math.round(
                100 * (result.sizeUsed / result.sizeTotal),
              ),
              free: result.sizeFree,
              freeFormated: new Intl.NumberFormat("en-US", {
                style: "unit",
                unit: "byte",
                unitDisplay: "narrow",
                notation: "compact",
              }).format(result.sizeFree),
            },
          });
        }),
    );
    setTimeout(() => {
      socket = new WebSocket(`${page.url.pathname}/ws`);
      socket.onmessage = (event) => {
        JSON.parse(event.data).forEach((element) => {
          METRICS.push(element);
        });
      };
    }, 1000);
  });
  onDestroy(() => {
    socket?.close();
  });
  // $inspect([
  //   ...new Set(
  //     checkBackups.map((item) => {
  //       return item.category;
  //     }),
  //   ),
  // ]);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <span class="text-lg font-bold text-muted-foreground">Dashboard</span>
  </div>
</header>
<div class=" h-[calc(100vh-5rem)] overflow-hidden">
  <div class="overflow-auto h-[calc(100vh-6rem)] w-full p-0 md:px-4">
    <div class="flex flex-wrap gap-4">
      <div
        class="md:min-w-200 border rounded-md md:h-54 md:overflow-hidden w-full md:w-fit"
      >
        <div class="text-muted-foreground font-bold border-b p-2 bg-muted">
          Alerts
        </div>
        <div
          class="p-2 md:h-42 flex flex-col gap-2 overflow-auto w-full items-start"
        >
          {#if checksCount > 0}
            <Alert.Root variant="default">
              <AlertTriangleIcon />
              <Alert.Title class="flex items-center gap-2"
                >Still {checksCount} checks left <LoadingLoop /></Alert.Title
              >
            </Alert.Root>
          {/if}
          {#each alerts as alert}
            <Alert.Root
              variant={alert.type === "error" ? "destructive" : "default"}
            >
              {#if alert.type === "error"}
                <AlertCircleIcon />
              {:else}
                <AlertTriangleIcon />
              {/if}
              <Alert.Title>{alert.title}</Alert.Title>
              <Alert.Description>{alert.message}</Alert.Description>
            </Alert.Root>
          {/each}
          {#if alerts.length === 0 && checksCount === 0}
            <Alert.Root variant="default">
              <AlertTriangleIcon />
              <Alert.Title>No Alerts</Alert.Title>
            </Alert.Root>
          {/if}
        </div>
      </div>
      <div class="grid grid-cols-2 items-center gap-4 flex-1 p-0 w-full md:">
        {#each server_dbStatus as server}
          <!-- <Card.Root class="p-3  rounded-md h-full">
            <Card.Content
              class="flex justify-between items-center gap-1 h-full  p-3"
            >
              <div
                class="text-indigo-400 flex items-center h-full font-bold text-lg"
              >
                {server.name}
              </div>
              <div
                data-status={server.dbStatus}
                class="flex gap-1 group rounded-full border-2 border-rose-500 bg-rose-500/10 p-1 data-[status=OPEN]:bg-emerald-500/10 data-[status=OPEN]:border-emerald-500"
              >
                <Database
                  class="text-xl group-data-[status=OPEN]:text-emerald-400 text-rose-400 size-5"
                /><Up
                  class=" text-xl size-5 group-data-[status=OPEN]:text-emerald-400 text-rose-400 rotate-180 group-data-[status=OPEN]:rotate-0"
                />
              </div>
            </Card.Content>
          </Card.Root> -->
          <Card.Root
            data-status={server.dbStatus}
            class="p-3 border-0 border-t-4 border-red-500 data-[status=OPEN]:border-teal-500  rounded-none h-full"
          >
            <Card.Content
              class="flex justify-between items-center gap-1 h-full  p-3"
            >
              <div
                class="text-indigo-400 flex items-center h-full font-bold text-lg"
              >
                {server.name}
              </div>
              <div
                data-status={server.dbStatus}
                class="flex gap-1 group rounded-full border-2 border-rose-500 bg-rose-500/10 p-1 data-[status=OPEN]:bg-emerald-500/10 data-[status=OPEN]:border-teal-500"
              >
                <Database
                  class="text-xl group-data-[status=OPEN]:text-emerald-400 text-rose-400 size-5"
                /><Up
                  class=" text-xl size-5 group-data-[status=OPEN]:text-emerald-400 text-rose-400 rotate-180 group-data-[status=OPEN]:rotate-0"
                />
              </div>
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
      {#each server_san as server}
        <Card.Root class="pt-3 pb-0 rounded-md md:min-w-50 min-w-full">
          <Card.Content>
            <div class="text-indigo-400 flex items-center font-bold text-lg">
              {server.name}
            </div>
            <div class="flex gap-5 pb-5 h-32">
              <Chart height={20} class="translate-y-3 ">
                <Layer center>
                  <Group y={40}>
                    <Arc
                      value={100}
                      domain={[0, 100]}
                      outerRadius={55}
                      innerRadius={-10}
                      cornerRadius={1}
                      range={[-180, 180]}
                      class="fill-primary/20"
                      track={{ class: "fill-none stroke-primary/20" }}
                    />
                    <LinearGradient
                      class={[
                        server.sanStatus.usedPercent < 80
                          ? "from-teal-500  to-teal-500"
                          : server.sanStatus.usedPercent < 90
                            ? "from-yellow-500 to-yellow-500"
                            : "from-red-500 to-red-500",
                      ]}
                    >
                      {#snippet children({ gradient })}
                        <ClipPath>
                          {#snippet clip()}
                            <Arc
                              value={server.sanStatus.usedPercent}
                              domain={[0, 100]}
                              outerRadius={58}
                              innerRadius={-16}
                              cornerRadius={1}
                              range={[-180, 180]}
                              motion="spring"
                            />
                          {/snippet}
                          <Arc
                            value={100}
                            domain={[0, 100]}
                            outerRadius={58}
                            innerRadius={-16}
                            cornerRadius={1}
                            range={[-180, 180]}
                            fill={gradient}
                          />
                        </ClipPath>
                      {/snippet}
                    </LinearGradient>

                    <Text
                      value={Math.round(server.sanStatus.usedPercent) + "%"}
                      y={5}
                      textAnchor="middle"
                      verticalAnchor="middle"
                      class="text-3xl font-bold tabular-nums text-muted-foreground "
                    />
                  </Group>
                </Layer>
              </Chart>
            </div>
            <div class="text-sm text-muted-foreground grid grid-cols-3">
              <span class="text-center">Used</span><span class="text-center"
                >Free</span
              ><span class="text-center">Total</span>
              <span class="text-center font-bold tabular-nums">
                {server.sanStatus.usedFormated}</span
              ><span class="text-center font-bold tabular-nums"
                >{server.sanStatus.freeFormated}</span
              ><span class="text-center font-bold tabular-nums"
                >{server.sanStatus.sizeFormated}</span
              >
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
      <div class="md:flex md:flex-wrap space-y-1 columns-2 md:gap-4">
        {#each server_mount as server}
          <Card.Root class="py-3 rounded-md flex-1 break-inside-avoid">
            <Card.Content>
              <div class="text-indigo-400 flex items-center font-bold text-lg">
                {server.name}
              </div>
              <div class="flex gap-5 justify-around flex-wrap md:flex-nowrap">
                {#each server.mountPoints as mount}
                  <div class=" min-w-20">
                    <div class="mb-5">
                      <Chart height={45}>
                        <Layer center>
                          <Group y={20}>
                            <LinearGradient
                              class={[
                                mount.used < 80
                                  ? "from-teal-500  to-teal-500"
                                  : mount.used < 90
                                    ? "from-yellow-500 to-yellow-500"
                                    : "from-red-500 to-red-500",
                              ]}
                            >
                              {#snippet children({ gradient })}
                                <ClipPath>
                                  {#snippet clip()}
                                    <Arc
                                      value={mount.used}
                                      domain={[0, 100]}
                                      outerRadius={40}
                                      innerRadius={30}
                                      cornerRadius={5}
                                      range={[-120, 120]}
                                      motion="spring"
                                    />
                                  {/snippet}
                                  <Arc
                                    value={100}
                                    domain={[0, 100]}
                                    outerRadius={40}
                                    innerRadius={30}
                                    cornerRadius={5}
                                    range={[-120, 120]}
                                    fill={gradient}
                                  />
                                </ClipPath>
                              {/snippet}
                            </LinearGradient>
                            <Arc
                              value={100}
                              domain={[0, 100]}
                              outerRadius={40}
                              innerRadius={30}
                              cornerRadius={5}
                              range={[-120, 120]}
                              class="fill-primary/20"
                              track={{ class: "fill-none stroke-primary/20" }}
                            />
                            <Text
                              value={Math.round(mount.used) + "%"}
                              textAnchor="middle"
                              verticalAnchor="middle"
                              class="text-xl font-bold tabular-nums text-muted-foreground"
                            />
                          </Group>
                        </Layer>
                      </Chart>
                    </div>
                    <div
                      class="w-full flex justify-center text-[0.66rem] text-muted-foreground font-semibold"
                    >
                      {mount.path}
                    </div>
                  </div>
                {/each}
              </div>
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
      {#each metricsServers as server}
        <Card.Root
          class="p-2 rounded-md md:min-w-1/5 min-w-full min-h-12 flex-1 text-muted-foreground font-bold gap-0"
        >
          <Card.Header class=" py-0 px-4 flex  w-full text-indigo-400 text-lg">
            <span>{server.name}</span><span
              class="ml-auto text-muted-foreground text-base"
            >
              I/O Utilization <span
                class="text-base text-indigo-400 tabular-nums font-semibold"
                >{server_metrics.find((s) => s.name === server.name).metrics[
                  server_metrics.find((s) => s.name === server.name).metrics
                    .length - 1
                ]?.io ?? 0}%</span
              ></span
            >
          </Card.Header>
          <Card.Content
            class="flex justify-between items-center gap-1 h-full px-2 pb-5 "
          >
            {#if server_metrics.find((s) => s.name === server.name).metrics.length > 0}
              <Chart
                data={server_metrics.find((s) => s.name === server.name)
                  .metrics}
                x="date"
                y="io"
                yNice
                yDomain={[0, 100]}
                padding={{ top: 10, bottom: 5, left: 5, right: 0 }}
                height={110}
                tooltipContext={{ mode: "quadtree-x" }}
                >{#snippet children({ context })}
                  <Layer>
                    <Grid y />

                    <Axis placement="left" rule />
                    <Axis
                      placement="bottom"
                      rule
                      tickMultiline
                      tickSpacing={200}
                    />
                    <Highlight
                      points={true}
                      lines={true}
                      area={true}
                      axis={undefined}
                    />
                    <LinearGradient
                      class="from-indigo-400/50 to-indigo-400/1"
                      vertical
                    >
                      {#snippet children({ gradient })}
                        <Area
                          line={{ class: "stroke-1 stroke-indigo-400" }}
                          fill={gradient}
                          fillOpacity={0.4}
                        />
                      {/snippet}
                    </LinearGradient>
                  </Layer>
                  <Tooltip.Root>
                    {#snippet children({ data })}
                      <Tooltip.Header
                        value={new Date(data.date)}
                        format="time"
                      />
                      <Tooltip.List>
                        <Tooltip.Item
                          label="IO Utilization"
                          value={data.io + "%"}
                          color="var(--color-indigo-400)"
                        />
                      </Tooltip.List>
                    {/snippet}
                  </Tooltip.Root>
                {/snippet}
              </Chart>
            {:else}
              <div class="min-h-28 w-full flex items-center justify-center">
                <Spinner />
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
        <Card.Root
          class="p-2 rounded-md md:min-w-1/5 min-h-12 flex-1 w-full text-muted-foreground font-bold gap-0"
        >
          <Card.Header
            class=" py-0 px-4 flex w-full text-indigo-400 text-lg justify-between"
          >
            <span>{server.name}</span>
            <span class="ml-auto text-muted-foreground text-base">
              CPU Utilization <span
                class="text-base text-indigo-400 tabular-nums font-semibold"
                >{server_metrics.find((s) => s.name === server.name).metrics[
                  server_metrics.find((s) => s.name === server.name).metrics
                    .length - 1
                ]?.cpu ?? 0}%</span
              ></span
            >
          </Card.Header>
          <Card.Content
            class="flex justify-between items-center gap-1 h-full px-2 pb-5 "
          >
            {#if server_metrics.find((s) => s.name === server.name).metrics.length > 0}
              <Chart
                data={server_metrics.find((s) => s.name === server.name)
                  .metrics}
                x="date"
                y="cpu"
                yNice
                yDomain={[0, 100]}
                padding={{ top: 10, bottom: 5, left: 5, right: 0 }}
                height={110}
                tooltipContext={{ mode: "quadtree-x" }}
                >{#snippet children({ context })}
                  <Layer>
                    <Grid y />

                    <Axis placement="left" rule />
                    <Axis
                      placement="bottom"
                      rule
                      tickMultiline
                      tickSpacing={200}
                    />
                    <Highlight
                      points={true}
                      lines={true}
                      area={true}
                      axis={undefined}
                    />
                    <LinearGradient
                      class="from-indigo-400/50 to-indigo-400/1"
                      vertical
                    >
                      {#snippet children({ gradient })}
                        <Area
                          line={{ class: "stroke-1 stroke-indigo-400" }}
                          fill={gradient}
                          fillOpacity={0.4}
                        />
                      {/snippet}
                    </LinearGradient>
                  </Layer>
                  <Tooltip.Root>
                    {#snippet children({ data })}
                      <Tooltip.Header
                        value={new Date(data.date)}
                        format="time"
                      />
                      <Tooltip.List>
                        <Tooltip.Item
                          label="IO Utilization"
                          value={data.io + "%"}
                          color="var(--color-indigo-400)"
                        />
                      </Tooltip.List>
                    {/snippet}
                  </Tooltip.Root>
                {/snippet}
              </Chart>
            {:else}
              <div class="min-h-28 w-full flex items-center justify-center">
                <Spinner />
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      {/each}
      <div
        class="rounded-lg border p-4 pt-5 pb-0 font-bold bg-card w-full mb-3 relative hidden md:block"
      >
        <div class="absolute top-3 left-6 text-indigo-400">Backup Map</div>
        <div class="absolute flex gap-5 flex-wrap right-6 top-3">
          {#each new Set(checkBackups.map((item) => item.category)) as category, i}
            <div
              class="text-sm {[
                'text-teal-500',
                'text-orange-500',
                'text-blue-500',
                'text-pink-500',
                'text-yellow-500',
                'text-fuchsia-500',
                'text-red-500',
                'text-indigo-500',
              ][i % 8]}"
            >
              {category}
            </div>
          {/each}
        </div>

        <BarChart
          data={checkBackups}
          x={["start", "end"]}
          xScale={scaleTime()}
          y="category"
          xBaseline={undefined}
          xNice={false}
          axis={"x"}
          c="category"
          cRange={[
            "var(--color-teal-500)",
            "var(--color-orange-500)",
            "var(--color-blue-500)",
            "var(--color-pink-500)",
            "var(--color-yellow-500)",
            "var(--color-fuchsia-500)",
            "var(--color-red-500)",
            "var(--color-indigo-500)",
          ]}
          grid={{ y: true, bandAlign: "between" }}
          orientation="horizontal"
          // legend
          props={{
            legend: {
              placement: "top",
            },
            xAxis: {
              // format: { type: "week", options: { variant: "short" } },
              format: timeFormat("%A"),
              ticks: 8,
              tickMultiline: true,
            },
            // yAxis: {
            //   tickLabelProps: {
            //     class: "font-semibold text-indigo-400 text-lg",
            //   },
            // },
            tooltip: {
              context: { mode: "bounds" },
            },
          }}
          padding={defaultChartPadding({ bottom: 30 })}
          height={200}
        >
          {#snippet tooltip({ context })}
            <Tooltip.Root>
              {#snippet children({ data })}
                <Tooltip.Header
                  ><span>{data.category}</span><span class="ml-auto"
                    >{data.status}</span
                  ></Tooltip.Header
                >
                <Tooltip.List>
                  <Tooltip.Item
                    label="Start"
                    value={data.start}
                    format={timeFormat("%b %d, %Y %I:%M %p")}
                  />
                  <Tooltip.Item
                    label="End"
                    value={data.end}
                    format={timeFormat("%b %d, %Y %I:%M %p")}
                  />
                  <Tooltip.Item label="Duration" value={data.duration} />
                </Tooltip.List>
              {/snippet}
            </Tooltip.Root>
          {/snippet}
        </BarChart>
      </div>
    </div>
  </div>
</div>
