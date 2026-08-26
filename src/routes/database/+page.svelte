<script>
  import { dev } from "$app/environment";
  import { TableSorter } from "$src/lib/myComponents/TableSorter.svelte";
  import ta from "time-ago";
  import { cn } from "$lib/utils.js";
  import { cubicInOut } from "svelte/easing";
  import { MediaQuery } from "svelte/reactivity";
  import { page } from "$app/state";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Resizable from "$lib/components/ui/resizable/index.js";
  import { Button, buttonVariants } from "$src/lib/components/ui/button";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as InputGroup from "$lib/components/ui/input-group/index.js";
  import { Progress } from "$lib/components/ui/progress/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import {
    Area,
    Axis,
    Bars,
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
  import { timeMonth, timeYear } from "d3-time";
  import { scaleThreshold, scaleTime, scaleBand, scaleLinear } from "d3-scale";
  import SortDir from "~icons/mdi/arrow-up-thin";
  import Database from "~icons/mdi/database";
  import Spinner from "~icons/svg-spinners/bars-scale-fade";
  import Up from "~icons/mdi/trending-up";
  import Backup from "~icons/mdi/backup-restore";
  import Switches from "~icons/fa7-solid/refresh";
  import Cross from "~icons/glyphs/cross-bold";
  import Connection from "~icons/mdi/connection";
  import Updown from "~icons/fluent/arrow-wrap-20-filled";
  import Information from "~icons/mdi/information-outline";
  import Lock from "~icons/mdi/lock";
  import Tablespace from "~icons/mdi/table";
  import Log from "~icons/mdi/alert";
  import Security from "~icons/mdi/security";
  import Search from "~icons/mdi/search";
  import DBCard from "./DBCard.svelte";
  import Reload from "~icons/mdi/reload";
  import Heatmap from "$lib/myComponents/Heatmap.svelte";
  import { onDestroy, tick, untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import Counter from "$src/lib/components/Counter.svelte";

  let tableSorter = new TableSorter();
  const isDesktop = new MediaQuery("(min-width: 768px)");
  let { data } = $props();
  let DBs = $derived(data.DBs);
  let activeDB = $state(null);
  let activeDBTab = $state(null);
  let tab = $state("info");
  let DBData = $state(null);
  let dbSizeRange = $state(0);
  let dbSizeData = $state([]);
  let DBLogSwitch = $state(null);
  let DBUpDown = $state([]);
  let weeks = $state([]);
  let DBBackups = $state([]);
  let DBMachines = $state(null);
  let DBLocks = $state(null);
  let DBTSs = $state(null);
  let DBAlertLog = $state(null);
  let DRtLog = $state(null);
  let reader = $state(null);
  let startReder = $state(false);
  let tsAddEnable = $state(false);
  let loading = $state(false);
  let loadingSize = $state(false);
  let loadingLog = $state(false);
  let loadingUpDown = $state(false);
  let loadingDBBackups = $state(false);
  let blockingLocks = $state(false);
  let objectName = $state("");

  const locks = () => {
    loading = true;
    DBLocks = null;
    objectName = "";
    fetch(`${page.url.pathname}/api/locks`, {
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
        DBLocks = result.data;
        loading = false;
        tableSorter.clearKeys();
      });
  };
  const kill = (sid, serial, instId) => {
    fetch(`${page.url.pathname}/api/locks/kill`, {
      method: "POST",
      body: JSON.stringify({
        dbName: activeDB.dbName,
        ip: activeDB.ip,
        username: activeDB.dbUser,
        password: activeDB.dbPassword,
        dbPort: activeDB.dbPort,
        sid,
        serial,
        instId,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        DBLocks.forEach((lock, index) => {
          if (
            lock.SID === sid &&
            lock.SERIAL === serial &&
            lock.INSTANCE === instId
          ) {
            DBLocks[index].KILLED = true;
          }
        });
      });
  };
  const ts = () => {
    loading = true;
    DBTSs = null;
    fetch(`${page.url.pathname}/api/ts`, {
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
        DBTSs = result.data;
        loading = false;
      });
  };
  const add = (ts) => {
    fetch(`${page.url.pathname}/api/ts/add`, {
      method: "POST",
      body: JSON.stringify({
        dbName: activeDB.dbName,
        ip: activeDB.ip,
        username: activeDB.dbUser,
        password: activeDB.dbPassword,
        dbPort: activeDB.dbPort,
        ts,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (dev) console.log(result);
        if (result.data.includes("error")) {
          toast.error("Datafile add was unsuccessful");
          return;
        }
        toast.success("Datafile added to tablespace");
      });
  };
  const alert = (action) => {
    DBAlertLog = "";
    loading = true;
    fetch(`${page.url.pathname}/api/alert`, {
      method: "POST",
      body: JSON.stringify({
        ip: activeDB.ip,
        username: activeDB.username,
        password: activeDB.password,
        dbPort: activeDB.dbPort,
        dbAlert: activeDB.dbAlert,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        DBAlertLog = result.data;
        loading = false;
      });
  };

  const AlertStream = async () => {
    DBAlertLog = "";
    loading = true;
    stopReader();
    const response = await fetch(`${page.url.pathname}/api/alert`, {
      method: "POST",
      body: JSON.stringify({
        ip: activeDB.ip,
        username: activeDB.username,
        password: activeDB.password,
        dbAlert: activeDB.dbAlert,
        action: "stream",
      }),
    });
    // loading = false;
    // reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      loading = false;
      // DBAlertLog += `${value}`;
      DBAlertLog += decoder.decode(value, { stream: true });
    }
  };
  const stopReader = () => {
    reader?.cancel();
    DBAlertLog += `
stream stopped`;
  };
  const dr = (action) => {
    DBAlertLog = "";
    loading = true;
    fetch(`${page.url.pathname}/api/dr`, {
      method: "POST",
      body: JSON.stringify({
        ip: activeDB.ip,
        username: activeDB.username,
        password: activeDB.password,
        dbName: activeDB.dbName,
        drInstance: activeDB.drInstance,
        action,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        DRtLog = result.data;
        loading = false;
      });
  };
  onDestroy(() => {
    untrack(() => {
      stopReader();
    });
  });
  $effect(() => {
    if (startReder) {
      untrack(() => {
        AlertStream();
      });
    } else {
      untrack(() => {
        stopReader();
      });
    }
  });
  $effect(() => {
    if (activeDBTab && activeDB?.ip !== activeDBTab) {
      untrack(() => {
        activeDB = DBs.find((db) => db.ip === activeDBTab);
      });
    }
    if (activeDB) {
      untrack(() => {
        activeDBTab = activeDB.ip;

        stopReader();
      });
      tab = "info";
      DBLocks = null;
      loadingSize = true;
      loadingLog = true;
      loadingUpDown = true;
      loadingDBBackups = true;
      startReder = false;
      fetch(`${page.url.pathname}/api/dbSize`, {
        method: "POST",
        body: JSON.stringify({
          dbName: activeDB.dbName,
          dbSizeGroup: activeDB.dbSizeGroup,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          dbSizeData = result.data
            .filter((row, index, array) => row.date !== array[index - 1]?.date)
            .map((row, index, array) => {
              return {
                date: new Date(parseInt(row.date)),
                value: row.size,
                change: array[index - 1]?.size
                  ? row.size - array[index - 1]?.size
                  : 0,
              };
            });
          // setTimeout(() => (loadingSize = false), 1000); //loading = false;
          loadingSize = false;
        });
      fetch(`${page.url.pathname}/api/logSwitch`, {
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
          DBLogSwitch = result.data;
          loadingLog = false;
        });
      if (activeDB.tags.find((tag) => tag.name === "UpDown"))
        fetch(`${page.url.pathname}/api/upDown`, {
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
            DBUpDown = [];
            result.data?.forEach((element, i) => {
              if (element.OPERATION === "SDN") {
                for (let j = i + 1; j < result.data.length; j++) {
                  if (result.data[j].OPERATION === "SUP") {
                    DBUpDown.push({
                      down: new Date(element.MON_DATE),
                      up: new Date(result.data[j].MON_DATE),
                      duration:
                        new Date(result.data[j].MON_DATE) -
                        new Date(element.MON_DATE),
                    });
                    break;
                  }
                }
              }
            });
            weeks = [];
            let current = new Date(new Date().setHours(0, 0, 0, 0));
            while (current.getDay() !== 0) {
              current.setDate(current.getDate() + 1);
            }
            current.setFullYear(current.getFullYear() - 1);
            while (current < new Date()) {
              weeks.push({
                start: new Date(current),
                end: new Date(current.setDate(current.getDate() + 7)),
              });
              // current.setDate(current.getDate() + 7);
            }

            weeks.forEach((week) => {
              const eventsInWeek = DBUpDown.filter(
                (event) => event.down >= week.start && event.down < week.end,
              );
              const totalDuration = eventsInWeek.reduce(
                (sum, event) => sum + event.duration,
                0,
              );
              week.totalDuration = totalDuration.toFixed(2);
            });

            loadingUpDown = false;
          });
      fetch(`${page.url.pathname}/api/backups`, {
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
          DBBackups = result.data;
          loadingDBBackups = false;
        });
      fetch(`${page.url.pathname}/api/machines`, {
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
          DBMachines = result.data;
        });
    }
  });
  $effect(() => {
    if (tab === "locks") locks();
    if (tab === "ts") ts();
    if (tab === "log") alert();
    if (tab === "dr") dr("");
  });
  let chartConfig = {
    value: { label: "DB Size", color: "#2563eb" },
    change: { label: "Change", color: "#f59e0b" },
  };
  let filteredData = $derived(
    dbSizeData.filter((data) => {
      return (
        dbSizeRange === 0 ||
        data.date >= new Date().setMonth(new Date().getMonth() - dbSizeRange)
      );
    }),
  );
  let grouwthRate = $derived(
    filteredData.length === 1
      ? filteredData[0]?.value
      : filteredData.length > 1
        ? (
            (1000 *
              60 *
              60 *
              24 *
              (filteredData[filteredData.length - 1]?.value -
                filteredData[0]?.value)) /
            (filteredData[filteredData.length - 1]?.date -
              filteredData[0]?.date)
          ).toFixed(2)
        : 0,
  );
  // $inspect(grouwthRate, filteredData);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">Databases</h1>
  </div>
</header>
<div class="flex flex-col gap-4 p-0 md:px-4 h-[calc(100vh-4rem)] md:h-full">
  <Resizable.PaneGroup direction="horizontal">
    {#if isDesktop.current}
      <Resizable.Pane
        minSize={18}
        maxSize={25}
        defaultSize={20}
        class="flex flex-col gap-4 pr-4"
      >
        {#each DBs.sort((a, b) => a.dbLabel.localeCompare(b.dbLabel)) as db}
          <DBCard {db} bind:activeDBTab bind:activeDB />
        {/each}
      </Resizable.Pane>
      <Resizable.Handle withHandle />
    {/if}
    <Resizable.Pane class="w-full md:pl-4">
      <!-- <Tabs.Root
        class="items-center ml-auto mb-2 md:hidden "
        bind:value={activeDBTab}
      >
        <Tabs.List>
          {#each DBs.sort((a, b) => a.dbLabel.localeCompare(b.dbLabel)) as db}
            <Tabs.Trigger
              class=" text-lg font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-selected dark:data-[state=active]:text-selected"
              value={db.ip}>{db.dbLabel}</Tabs.Trigger
            >
          {/each}
        </Tabs.List>
      </Tabs.Root> -->
      <Field.Set class="m-1 md:hidden mb-2">
        <RadioGroup.Root
          bind:value={activeDBTab}
          class="flex gap-2 justify-center"
          required
        >
          <!-- <Field.Label class="md:w-60 ">Select a Database</Field.Label> -->
          {#each DBs.sort((a, b) => a.dbLabel.localeCompare(b.dbLabel)) as db}
            <Field.Label
              class=" max-w-30 [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
            >
              <Field.Field>
                <Field.Content class="">
                  <Field.Title class="w-full flex items-center justify-center"
                    >{db.dbLabel}</Field.Title
                  >
                </Field.Content>
                <RadioGroup.Item value={db.ip} id={db.ip} class="hidden" />
              </Field.Field>
            </Field.Label>
          {/each}
        </RadioGroup.Root>
      </Field.Set>
      {#if !activeDBTab}
        <div
          class="flex pt-20 flex-col items-center justify-center font-semibold text-2xl flex-1 text-muted-foreground gap-5"
        >
          Select a Database
          <Database class="size-20" />
        </div>
      {:else}
        <Tabs.Root class="items-center ml-auto" bind:value={tab}>
          <Tabs.List>
            <Tabs.Trigger
              value="info"
              class="  font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
              ><Information /> Info</Tabs.Trigger
            >
            <Tabs.Trigger
              value="ts"
              class="  font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
              ><Tablespace /> <span class="hidden md:inline">Tablespaces</span>
              <span class="md:hidden">TS</span>
            </Tabs.Trigger>
            {#if activeDB?.tags.find((tag) => tag.name === "Locks")}
              <Tabs.Trigger
                value="locks"
                class="  font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
                ><Lock /> Locks</Tabs.Trigger
              >
            {/if}
            <Tabs.Trigger
              disabled={!activeDB?.dbAlert}
              value="log"
              class="  font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
              ><Log /> Alert
              <span class="hidden md:inline">Log</span></Tabs.Trigger
            >
            {#if activeDB?.tags.find((tag) => tag.name === "DR")}
              <Tabs.Trigger
                disabled={!activeDB?.drInstance}
                value="dr"
                class="  font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
                ><Security /> DR</Tabs.Trigger
              >
            {/if}
          </Tabs.List>
          <Tabs.Content value="info" class=" w-full ">
            <div class="h-[calc(100vh-8rem)] overflow-hidden">
              <div class=" w-full h-full overflow-auto">
                <div
                  class="text-muted-foreground font-bold border-b-0 border-muted-foreground flex items-center gap-1"
                >
                  <Up class="size-6" /> Database Growth Rate
                </div>
                {#if loadingSize}
                  <div
                    class="flex flex-col items-center justify-center flex-1 text-muted-foreground"
                  >
                    <Spinner class="size-8" />
                  </div>
                {:else}
                  <div class=" h-50 w-full">
                    <Chart
                      data={filteredData}
                      x="date"
                      xScale={scaleBand().padding(0.4)}
                      y="value"
                      y1="change"
                      y1Range={({ yScale }) => yScale.domain()}
                      grid={false}
                      yNice
                      padding={{
                        top: 5,
                        bottom: 24,
                        left: 40,
                        right: 60,
                      }}
                      height={200}
                      tooltipContext={{ mode: "quadtree-x" }}
                    >
                      {#snippet children({ context })}
                        <Layer>
                          <LinearGradient
                            class="from-indigo-400/50 to-indigo-400/1"
                            vertical
                          >
                            {#snippet children({ gradient })}
                              <Area
                                motion="tween"
                                y={(d) => d.value}
                                line={{ class: "stroke-2 stroke-indigo-400" }}
                                fill={gradient}
                                fillOpacity={0.4}
                              />
                            {/snippet}
                          </LinearGradient>
                          <Bars
                            motion="tween"
                            y={(d) => context.y1Scale?.(d.change)}
                            class="fill-primary/30"
                          />
                          <Axis
                            tickLabelProps={{
                              class: "text-selected text-xs",
                            }}
                            label="DB Size in GB"
                            labelProps={{
                              class: "text-selected text-lg font-simibold ",
                            }}
                            placement="right"
                            scale={scaleLinear(
                              [
                                Math.min(...dbSizeData.map((d) => d.value)),
                                Math.max(...dbSizeData.map((d) => d.value)),
                              ],
                              [context.height, 0],
                            )}
                            ticks={5}
                          />
                          <Axis
                            tickLabelProps={{
                              class: "text-gray-400 text-xs",
                            }}
                            label="Size Change in GB"
                            labelProps={{
                              class: "text-gray-400 text-lg  font-simibold",
                            }}
                            placement="left"
                            scale={scaleLinear(
                              [
                                Math.min(...dbSizeData.map((d) => d.change)),
                                Math.max(...dbSizeData.map((d) => d.change)),
                              ],
                              [context.height, 0],
                            )}
                            x={0}
                            ticks={5}
                          />
                          <Axis
                            placement="bottom"
                            rule
                            ticks={isDesktop.current ? 6 : 4}
                            format={(value) => {
                              if (value instanceof Date) {
                                // Formats as MM/DD/YYYY or your locale's default date block
                                return value.toLocaleDateString("en-GB", {
                                  month: "numeric",
                                  day: "numeric",
                                });
                              }
                              return value;
                            }}
                          />
                          <Highlight points lines />
                        </Layer>
                        <Tooltip.Root>
                          {#snippet children({ data })}
                            <Tooltip.Header
                              value={new Date(data.date)}
                              format="day"
                            />
                            <Tooltip.List>
                              <Tooltip.Item
                                label="db size"
                                value={data.value.toFixed(1) + " GB"}
                                color="var(--color-indigo-400)"
                              />
                              <Tooltip.Item
                                label="growth"
                                value={data.change.toFixed(1) + " GB"}
                                color="var(--color-gray-400)"
                              />
                            </Tooltip.List>
                          {/snippet}
                        </Tooltip.Root>
                      {/snippet}
                    </Chart>
                  </div>
                  <div class="flex items-center gap-5">
                    <div
                      class=" ml-auto font-semibold text-sm flex items-center gap-1 text-muted-foreground"
                    >
                      Growth Rate :
                      <div class="translate-y-0.5">
                        <Counter
                          // places={[100, 10, 1, ".", 0.1]}
                          value={grouwthRate}
                          gradientFrom="transparent"
                          fontSize={15}
                          padding={0}
                          horizontalPadding="0"
                          gradientHeight={0}
                          gap={0}
                          containerStyle=""
                        />
                      </div>
                      GB/Day
                    </div>
                    <ButtonGroup.Root class=" me-15">
                      <Button
                        variant="outline"
                        size="sm"
                        onclick={() => {
                          dbSizeRange = 1;
                        }}>1 month</Button
                      >
                      <Button
                        variant="outline"
                        size="sm"
                        onclick={() => {
                          dbSizeRange = 3;
                        }}>3 months</Button
                      >
                      <Button
                        variant="outline"
                        size="sm"
                        onclick={() => {
                          dbSizeRange = 6;
                        }}>6 month</Button
                      >
                      <Button
                        variant="outline"
                        size="sm"
                        onclick={() => {
                          dbSizeRange = 12;
                        }}>1 year</Button
                      >
                      <Button
                        variant="outline"
                        size="sm"
                        onclick={() => {
                          dbSizeRange = 24;
                        }}>2 years</Button
                      >
                      <Button
                        variant="outline"
                        size="sm"
                        onclick={() => {
                          dbSizeRange = 0;
                        }}>all</Button
                      >
                    </ButtonGroup.Root>
                  </div>
                {/if}
                {#if activeDB && activeDB.tags?.find((tag) => tag.name === "UpDown")}
                  <!-- {#if true} -->
                  <div
                    class="text-muted-foreground font-bold border-b-0 border-muted-foreground flex items-center gap-1 pb-4"
                  >
                    <Updown class="size-6 -rotate-90" /> Database Down Events
                  </div>
                  {#if loadingUpDown}
                    <div
                      class="flex flex-col items-center justify-center flex-1 text-muted-foreground"
                    >
                      <Spinner class="size-8" />
                    </div>
                  {:else}
                    <div class="  w-full">
                      <BarChart
                        data={weeks}
                        x="start"
                        y={(d) => 1}
                        c="totalDuration"
                        cScale={scaleThreshold()}
                        cDomain={[1, 1000 * 60 * 60]}
                        cRange={[
                          "var(--color-green-400)",
                          "var(--color-yellow-400)",
                          "var(--color-pink-600)",
                        ]}
                        axis={false}
                        bandPadding={0.1}
                        grid={false}
                        props={{
                          bars: { radius: 4, strokeWidth: 0, rounded: "all" },
                          highlight: {
                            bar: {
                              radius: 4,
                              class: "stroke-current stroke-2 fill-none",
                            },
                          },

                          rule: { y: false },
                        }}
                        height={50}
                      >
                        {#snippet tooltip({ context })}
                          <Tooltip.Root>
                            {#snippet children({ data })}
                              <Tooltip.Header
                                value={data.start}
                                format="month"
                              />
                              <Tooltip.List>
                                <Tooltip.Item
                                  label="Down for"
                                  value={ta
                                    .ago(
                                      new Date().setTime(
                                        new Date().getTime() - context.c(data),
                                      ),
                                    )
                                    .replace(" ago", "")}
                                  color={context.cScale?.(context.c(data))}
                                />
                              </Tooltip.List>
                            {/snippet}
                          </Tooltip.Root>
                        {/snippet}
                      </BarChart>
                      <div
                        class="text-muted-foreground text-sm mb-5 mt-3 flex justify-end"
                      >
                        Total down time in last year was around {ta
                          .ago(
                            new Date().setTime(
                              new Date().getTime() -
                                DBUpDown.reduce(
                                  (sum, event) => sum + event.duration,
                                  0,
                                ),
                            ),
                          )
                          .replace(" ago", "")}
                      </div>
                    </div>
                  {/if}
                {/if}
                <div
                  class="text-muted-foreground font-bold border-b-0 border-muted-foreground mb-3 flex items-center gap-1"
                >
                  <Backup class="size-7" /> Backups in Last 10 Days
                </div>
                {#if loadingDBBackups}
                  <div
                    class="flex flex-col items-center justify-center flex-1 text-muted-foreground"
                  >
                    <Spinner class="size-8" />
                  </div>
                {:else}
                  <div
                    class="flex flex-wrap font-semibold flex-1 text-muted-foreground gap-3 mb-5"
                  >
                    {#each DBBackups as backup}
                      <div
                        class="p-3 rounded-md border grow md:grow-0 md:min-w-54"
                        class:border-green-500={backup.STATUS === "RUNNING"}
                        class:border-red-500={backup.STATUS === "FAILED"}
                        class:border-selected={backup.STATUS != "RUNNING" &&
                          backup.STATUS != "FAILED"}
                      >
                        <div class="flex justify-between text-sm">
                          <span> {ta.ago(backup.START_TIME)}</span>
                          <span>
                            {new Date(backup.END_TIME).toLocaleString("en-GB", {
                              weekday: "long",
                            })}</span
                          >
                        </div>
                        <div
                          class="capitalize text-xs md:text-sm flex gap-0 items-center"
                          class:text-green-500={backup.STATUS === "RUNNING"}
                          class:text-red-500={backup.STATUS === "FAILED"}
                          class:text-selected={backup.STATUS != "RUNNING" &&
                            backup.STATUS != "FAILED"}
                        >
                          {backup.STATUS}
                          {#if backup.STATUS === "RUNNING"}
                            <Switches
                              class="animate-spin animation-duration-[5s]"
                            />
                          {:else if backup.STATUS === "FAILED"}<Cross
                              class="rotate-45"
                            />{/if}
                        </div>
                        <div class="text-sm flex justify-between">
                          <span
                            >{new Date(backup.START_TIME).toLocaleString(
                              "en-GB",
                              {
                                hour: "numeric",
                                minute: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span><span>
                            {backup.END_TIME &&
                              new Date(backup.END_TIME).toLocaleString(
                                "en-GB",
                                {
                                  hour: "numeric",
                                  minute: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}</span
                          >
                        </div>
                        <div class="capitalize text-sm flex justify-between">
                          <span> {backup.TIME_TAKEN_DISPLAY} </span><span>
                            {backup.END_TIME &&
                              ta
                                .ago(
                                  new Date().setTime(
                                    new Date().getTime() -
                                      (new Date(backup.END_TIME) -
                                        new Date(backup.START_TIME)),
                                  ),
                                )
                                .replace(" ago", "")}</span
                          >
                          <span> {backup.OUTPUT_BYTES_DISPLAY} </span>
                        </div>
                        <!-- {#if backup.STATUS === "RUNNING"}{backup.RUNNING}
                  <div>{backup.STATUS} {ta.ago(backup.START_TIME)}</div>{/if} -->
                      </div>
                    {/each}
                  </div>
                {/if}
                <div
                  class="text-muted-foreground font-bold border-b-0 border-muted-foreground mb-5 mt-10 flex items-center gap-1"
                >
                  <Switches class="size-6" /> Archive Log Switch Reate
                </div>
                {#if loadingLog}
                  <div
                    class="flex flex-col items-center justify-center font-semibold flex-1 text-muted-foreground"
                  >
                    <Spinner class="size-8" />
                  </div>
                {:else}
                  <div class="flex w-full overflow-auto">
                    <Heatmap
                      data={DBLogSwitch}
                      ranges={[1, 2, 3, 4, 5, 6, 7]}
                      class="mb-0"
                    />
                  </div>
                  <!-- <div class="h-5"></div> -->
                {/if}
                <div
                  class="text-muted-foreground font-bold border-b-0 border-muted-foreground mt-10 flex items-center gap-1"
                >
                  <Connection class="size-6" /> Top Connections
                </div>
                {#if DBMachines}
                  <BarChart
                    data={DBMachines}
                    x="CONNECTIONS"
                    y="MACHINE"
                    cRange={[
                      "var(--color-pink-600)",
                      "var(--color-fuchsia-600)",
                      // "var(--color-indigo-900)",
                      // "var(--color-indigo-800)",
                      "var(--color-indigo-700)",
                      "var(--color-indigo-600)",
                      "var(--color-indigo-500)",
                      "var(--color-indigo-400)",
                      "var(--color-indigo-300)",
                      "var(--color-indigo-400)",
                      "var(--color-indigo-300)",
                      "var(--color-indigo-400)",
                      "var(--color-indigo-300)",
                      "var(--color-indigo-400)",
                      "var(--color-indigo-300)",
                      "var(--color-indigo-300)",
                      "var(--color-indigo-400)",
                      "var(--color-indigo-300)",
                      "var(--color-indigo-400)",
                      "var(--color-indigo-300)",
                      "var(--color-indigo-400)",
                      "var(--color-indigo-300)",
                    ]}
                    labels
                    orientation="horizontal"
                    axis="y"
                    rule={false}
                    props={{
                      bars: {
                        // class: "stroke-none rounded",
                        stroke: "none",
                        radius: 5,
                        rounded: "all",
                      },
                      yAxis: {
                        tickLabelProps: {
                          textAnchor: "start",
                          dx: 6,
                          dy: 2,
                          class:
                            "text-sm font-semibold fill-background stroke-none",
                        },
                        tickLength: 0,
                      },
                    }}
                    padding={{ left: 0, bottom: 16, right: 50, top: 0 }}
                    height={DBMachines.length * 50}
                  />
                  <div class="h-5"></div>
                {/if}
              </div>
            </div>
          </Tabs.Content>
          <Tabs.Content
            value="ts"
            class=" w-full h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]"
          >
            <div
              class=" overflow-hidden flex flex-col border-0 border-blue-5001 h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]"
            >
              <div
                class="border border-red-5001 md:rounded-lg w-full overflow-auto"
              >
                <Table.Root class="">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class="  uppercase">tablespace</Table.Head>
                      <Table.Head class="hidden md:table-cell  uppercase"
                        >#df</Table.Head
                      >
                      <Table.Head class="hidden md:table-cell uppercase"
                        >bytes(GB)</Table.Head
                      >
                      <Table.Head class="hidden md:table-cell  uppercase">
                        max bytes(gb)
                      </Table.Head>
                      <Table.Head class="  uppercase w-[60%]"
                        >percent</Table.Head
                      >
                      <Table.Head class="  uppercase"
                        ><div class="flex">
                          <Switch id="safety" bind:checked={tsAddEnable} />
                          <Label for="safety">Enable</Label>
                        </div></Table.Head
                      >
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#if loading}
                      <Table.Row>
                        <Table.Cell
                          colspan={isDesktop.current ? "6" : "5"}
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
                    {#key DBTSs}
                      {#each DBTSs as ts, i}
                        <Table.Row>
                          <Table.Cell class="">{ts.TABLESPACE_NAME}</Table.Cell>
                          <Table.Cell class="text-center hidden md:table-cell"
                            >{ts.NOF}</Table.Cell
                          >
                          <Table.Cell class="text-center hidden md:table-cell"
                            >{ts.BYTES}</Table.Cell
                          >
                          <Table.Cell class=" text-center hidden md:table-cell"
                            >{ts.MAXBYTES}</Table.Cell
                          >
                          <Table.Cell class="">
                            <div class="flex items-center gap-1">
                              <div class="w-10 flex justify-end">
                                {ts.PERCENT}%
                              </div>
                              <Progress
                                class="h-5"
                                barClass={[
                                  ts.PERCENT > 90
                                    ? "bg-destructive"
                                    : "bg-primary",
                                ]}
                                value={ts.BYTES}
                                max={ts.MAXBYTES}
                              />
                            </div></Table.Cell
                          >
                          <Table.Cell class="">
                            {#if ts.REMAINING < 3}
                              <Button
                                variant="default"
                                disabled={!tsAddEnable || ts.disabled}
                                onclick={() => {
                                  ts.disabled = true;

                                  add(ts.TABLESPACE_NAME);
                                }}
                                class="text-base uppercase">Add</Button
                              >{/if}</Table.Cell
                          >
                        </Table.Row>
                      {/each}
                    {/key}
                  </Table.Body>
                </Table.Root>
              </div>
            </div>
          </Tabs.Content>
          <Tabs.Content value="locks" class="w-full ">
            <div
              class=" overflow-hidden flex flex-col border-0 border-blue-5001 h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]"
            >
              <div class="flex items-center justify-start gap-5 p-4">
                <div class="ml-auto">
                  <InputGroup.Root>
                    <InputGroup.Input
                      placeholder="filter by object name..."
                      bind:value={objectName}
                    />
                    <InputGroup.Addon>
                      <Search />
                    </InputGroup.Addon>
                    <InputGroup.Addon align="inline-end"
                      >{objectName
                        ? "results " +
                          DBLocks?.filter((lock) =>
                            lock.OBJECT_NAME.includes(objectName.toUpperCase()),
                          ).length
                        : ""}
                    </InputGroup.Addon>
                  </InputGroup.Root>
                </div>
                <Separator orientation="vertical" class=" h-4" />
                <Button
                  variant="secondary"
                  class="text-base uppercase"
                  onclick={() => {
                    let temp = objectName;
                    locks();
                    objectName = temp;
                  }}
                  ><Reload class="size-5" />
                </Button>
                <Separator orientation="vertical" class=" h-4" />
                <div class="flex items-center space-x-2">
                  <Switch id="blockingLocks" bind:checked={blockingLocks} />
                  <Label for="blockingLocks">Blocking Locks</Label>
                </div>
              </div>

              <div
                class="border border-red-5001 md:rounded-lg w-full overflow-auto"
              >
                <Table.Root class="">
                  <Table.Header>
                    <Table.Row class="bg-accent">
                      <Table.Head class="  uppercase">
                        <Button
                          variant="ghost"
                          class=" cursor-pointer text-left uppercase px-0 flex gap-0"
                          onclick={() => tableSorter.sort(DBLocks, "USERNAME")}
                          >USER<SortDir
                            class={[
                              "size-5 hidden ",
                              tableSorter?.sortDirection("USERNAME") ===
                                "desc" && "rotate-0 md:block",
                              tableSorter?.sortDirection("USERNAME") ===
                                "asc" && "rotate-180 md:block",
                            ]}
                          /></Button
                        >
                      </Table.Head>
                      <Table.Head class="  uppercase">
                        <Button
                          variant="ghost"
                          class=" cursor-pointer text-left uppercase px-0 flex gap-0"
                          onclick={() =>
                            tableSorter.sort(DBLocks, "OBJECT_NAME")}
                          >locked object<SortDir
                            class={[
                              "size-5 hidden ",
                              tableSorter?.sortDirection("OBJECT_NAME") ===
                                "desc" && "rotate-0 md:block",
                              tableSorter?.sortDirection("OBJECT_NAME") ===
                                "asc" && "rotate-180 md:block",
                            ]}
                          /></Button
                        >
                      </Table.Head>

                      <Table.Head class=" uppercase">
                        <Button
                          variant="ghost"
                          class=" cursor-pointer text-left uppercase px-0 flex gap-0"
                          onclick={() =>
                            tableSorter.sort(DBLocks, "SECONDS_IN_WAIT")}
                          >duration<SortDir
                            class={[
                              "size-5 hidden ",
                              tableSorter?.sortDirection("SECONDS_IN_WAIT") ===
                                "desc" && "rotate-0 md:block",
                              tableSorter?.sortDirection("SECONDS_IN_WAIT") ===
                                "asc" && "rotate-180 md:block",
                            ]}
                          /></Button
                        >
                      </Table.Head>

                      <Table.Head class="hidden md:table-cell  uppercase">
                        <Button
                          variant="ghost"
                          class=" cursor-pointer text-left uppercase px-0 flex gap-0"
                          onclick={() => tableSorter.sort(DBLocks, "INSTANCE")}
                          >instance<SortDir
                            class={[
                              "size-5",
                              !tableSorter?.sortDirection("INSTANCE") &&
                                "hidden",
                              tableSorter?.sortDirection("INSTANCE") ===
                                "asc" && "rotate-180",
                            ]}
                          /></Button
                        >
                      </Table.Head>
                      <Table.Head class="hidden md:table-cell  uppercase">
                        <Button
                          variant="ghost"
                          class=" cursor-pointer text-left uppercase px-0 flex gap-0"
                          onclick={() => tableSorter.sort(DBLocks, "SID")}
                          >SID<SortDir
                            class={[
                              "size-5",
                              !tableSorter?.sortDirection("SID") && "hidden",
                              tableSorter?.sortDirection("SID") === "asc" &&
                                "rotate-180",
                            ]}
                          /></Button
                        >
                      </Table.Head>
                      <Table.Head class="hidden md:table-cell  uppercase">
                        <Button
                          variant="ghost"
                          class=" cursor-pointer text-left uppercase px-0 flex gap-0"
                          onclick={() => tableSorter.sort(DBLocks, "MACHINE")}
                          >MACHINE<SortDir
                            class={[
                              "size-5",
                              !tableSorter?.sortDirection("MACHINE") &&
                                "hidden",
                              tableSorter?.sortDirection("MACHINE") === "asc"
                                ? "rotate-180"
                                : "",
                            ]}
                          /></Button
                        >
                      </Table.Head>
                      <Table.Head class="hidden md:table-cell  uppercase">
                        <Button
                          variant="ghost"
                          class=" cursor-pointer text-left uppercase px-0 flex gap-0"
                          onclick={() =>
                            tableSorter.sort(DBLocks, "BLOCKED_INSTANCE")}
                          >blk inst.<SortDir
                            class={[
                              "size-5",
                              !tableSorter?.sortDirection("BLOCKED_INSTANCE") &&
                                "hidden",
                              tableSorter?.sortDirection("BLOCKED_INSTANCE") ===
                              "asc"
                                ? "rotate-180"
                                : "",
                            ]}
                          /></Button
                        >
                      </Table.Head>

                      <Table.Head class="    uppercase">
                        <Button
                          variant="ghost"
                          class=" cursor-pointer text-left uppercase px-0 flex gap-0"
                          onclick={() =>
                            tableSorter.sort(DBLocks, "BLOCKED_USERNAME")}
                          >blk user<SortDir
                            class={[
                              "size-5 hidden ",
                              tableSorter?.sortDirection("BLOCKED_USERNAME") ===
                                "desc" && "rotate-0 md:block",
                              tableSorter?.sortDirection("BLOCKED_USERNAME") ===
                                "asc" && "rotate-180 md:block",
                            ]}
                          /></Button
                        >
                      </Table.Head>

                      <Table.Head class="hidden md:table-cell  uppercase">
                        <Button
                          variant="ghost"
                          class=" cursor-pointer text-left uppercase px-0 flex gap-0"
                          onclick={() =>
                            tableSorter.sort(DBLocks, "SECONDS_BLOCKED")}
                          >s.i.b<SortDir
                            class={[
                              "size-5",
                              !tableSorter?.sortDirection("SECONDS_BLOCKED") &&
                                "hidden",
                              tableSorter?.sortDirection("SECONDS_BLOCKED") ===
                                "asc" && "rotate-180",
                            ]}
                          /></Button
                        >
                      </Table.Head>

                      <Table.Head class="  uppercase"></Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#if loading}
                      <Table.Row>
                        <Table.Cell
                          colspan={isDesktop.current ? "10" : "5"}
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
                    {#key DBLocks}
                      {#each DBLocks?.filter( (lock) => lock.OBJECT_NAME.includes(objectName.toUpperCase()), ).filter((lock) => !blockingLocks || lock.BLOCKED_INSTANCE) as lock}
                        <Table.Row
                          class={[
                            lock.KILLED
                              ? "line-through decoration-2 decoration-destructive bg-destructive/10"
                              : "",
                          ]}
                        >
                          <Table.Cell
                            colspan={isDesktop.current ? 1 : 4}
                            class=""
                            ><div class="grid grid-cols-[6rem_auto] gap-0.5">
                              <div
                                class="overflow-hidden
                            "
                              >
                                {lock.USERNAME}
                              </div>
                              <div class="md:hidden overflow-hidden">
                                {lock.OBJECT_NAME ?? ""}
                              </div>
                              <div class="md:hidden">
                                {lock.BLOCKED_USERNAME ?? ""}
                              </div>
                              <div class="md:hidden">
                                {lock.SECONDS_IN_WAIT === 0
                                  ? 0
                                  : ta
                                      .ago(
                                        new Date() -
                                          lock.SECONDS_IN_WAIT * 1000,
                                      )
                                      .replace(" ago", "")}
                              </div>
                            </div></Table.Cell
                          >
                          <Table.Cell class="hidden md:table-cell">
                            <div class="flex flex-col">
                              <div>{lock.OBJECT_NAME ?? ""}</div>
                              <div class="md:hidden">
                                {lock.SECONDS_IN_WAIT === 0
                                  ? 0
                                  : ta
                                      .ago(
                                        new Date() -
                                          lock.SECONDS_IN_WAIT * 1000,
                                      )
                                      .replace(" ago", "")}
                              </div>
                            </div>
                          </Table.Cell>

                          <Table.Cell class="text-center hidden md:table-cell">
                            {lock.SECONDS_IN_WAIT === 0
                              ? 0
                              : ta
                                  .ago(new Date() - lock.SECONDS_IN_WAIT * 1000)
                                  .replace(" ago", "")}
                          </Table.Cell>
                          <Table.Cell class=" text-center hidden md:table-cell"
                            >{lock.INSTANCE}</Table.Cell
                          >
                          <Table.Cell class="hidden md:table-cell"
                            >{lock.SID}</Table.Cell
                          >
                          <Table.Cell class="hidden md:table-cell"
                            >{lock.MACHINE.replace("\x00", "")}</Table.Cell
                          >
                          <Table.Cell class=" text-center hidden md:table-cell"
                            >{lock.BLOCKED_INSTANCE ?? ""}</Table.Cell
                          >

                          <Table.Cell class="hidden md:table-cell"
                            >{lock.BLOCKED_USERNAME ?? ""}</Table.Cell
                          >

                          <Table.Cell class=" hidden md:table-cell"
                            >{#if lock.SECONDS_BLOCKED}{lock.SECONDS_BLOCKED
                                ? 0
                                : ta
                                    .ago(
                                      new Date() - lock.SECONDS_BLOCKED * 1000,
                                    )
                                    .replace(" ago", "")}{/if}
                          </Table.Cell>

                          <Table.Cell class=""
                            ><Button
                              variant="destructive"
                              disabled={lock.KILLED}
                              onclick={() =>
                                kill(lock.SID, lock.SERIAL, lock.INSTANCE)}
                              class="text-base uppercase">kill</Button
                            ></Table.Cell
                          >
                        </Table.Row>
                      {:else}
                        {#if !loading}
                          <Table.Row>
                            <Table.Cell
                              colspan={isDesktop.current ? "10" : "4"}
                              class="text-center text-muted-foreground text-lg font-semibold"
                            >
                              No locks.
                            </Table.Cell>
                          </Table.Row>
                        {/if}
                      {/each}
                    {/key}
                    {#if !DBLocks && !loading}
                      <Table.Row>
                        <Table.Cell
                          colspan={isDesktop.current ? "10" : "4"}
                          class="text-center text-muted-foreground"
                        >
                          No locks.
                        </Table.Cell>
                      </Table.Row>
                    {/if}
                  </Table.Body>
                </Table.Root>
              </div>
            </div>
          </Tabs.Content>
          <Tabs.Content
            value="log"
            class=" w-full h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]"
          >
            <div
              class=" overflow-hidden flex flex-col border-0 border-blue-5001 h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]"
            >
              <div class="ml-auto flex gap-2 p-1 py-2 items-center">
                <Switch
                  id="startReder"
                  bind:checked={startReder}
                  disabled={loading}
                /><Label for="startReder">Start Realtime Alert Log</Label>
              </div>
              <div
                class="border border-red-5001 md:rounded-lg w-full overflow-auto p-5"
              >
                {#if loading}<div
                    class="flex flex-col items-center justify-center font-semibold text-2xl flex-1 text-muted-foreground gap-5"
                  >
                    <Spinner class="size-10" />
                  </div>{:else}
                  <pre class="w-full text-wrap">
{DBAlertLog}
              </pre>
                {/if}
              </div>
            </div>
          </Tabs.Content>
          <Tabs.Content
            value="dr"
            class=" w-full h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]"
          >
            <div
              class=" overflow-hidden flex flex-col border-0 border-blue-5001 h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]"
            >
              <div class="ml-auto flex gap-2 p-1 py-2 items-center">
                Archive log transport :
                <Button
                  onclick={() => {
                    DRtLog = "";
                    dr("start");
                  }}>Start</Button
                >
                <Button
                  variant="destructive"
                  onclick={() => {
                    dr("stop");
                  }}>Stop</Button
                >
              </div>
              <div
                class="border border-red-5001 md:rounded-lg w-full overflow-auto p-5"
              >
                {#if loading}<div
                    class="flex flex-col items-center justify-center font-semibold text-2xl flex-1 text-muted-foreground gap-5"
                  >
                    <Spinner class="size-10" />
                  </div>{:else}
                  <pre class="w-full text-wrap">
{DRtLog}
              </pre>
                {/if}
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      {/if}
    </Resizable.Pane>
  </Resizable.PaneGroup>
</div>
