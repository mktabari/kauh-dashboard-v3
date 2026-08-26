<script>
  import { page } from "$app/state";
  import { MediaQuery } from "svelte/reactivity";
  import { toast } from "svelte-sonner";
  import Copy from "$lib/myComponents/Copy.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  import ChevronsUpDown from "~icons/charm/chevrons-up-down";
  import Spinner from "~icons/svg-spinners/bars-scale-fade";
  import Loading from "~icons/eos-icons/loading";
  import Shutdown from "~icons/mdi/shutdown";
  import TaskTime from "~icons/tdesign/task-time-filled";
  import Error from "~icons/icon-park-solid/error";
  import Success from "~icons/mdi/success-bold";
  import Printer from "~icons/mdi/printer";
  import Report from "~icons/boxicons/file-report";
  import DateIcon from "~icons/uiw/date";
  import Refresh from "~icons/fa7-solid/refresh";
  import Down from "~icons/icon-park-outline/down-two";
  import Up from "~icons/icon-park-outline/up-two";
  import Open from "~icons/majesticons/open";
  import { onMount } from "svelte";
  import Badge from "$src/lib/components/ui/badge/badge.svelte";
  import Separator from "$src/lib/components/ui/separator/separator.svelte";
  import ta from "time-ago";
  let { server, sortWLS } = $props();
  const isDesktop = new MediaQuery("(min-width: 768px)");
  const refreshInterval = 10000;
  let loading = $state(true);
  let alive = $state(false);
  let RTServers = $state([]);
  let intervals = $state([]);
  let reportActiveQueue = $state([]);
  let reportJobs = $state([]);
  let currentJobs = $state(0);
  let metrics = $state(false);
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };
  const formatToText = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    if (seconds > 0 || parts.length === 0)
      parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

    return parts.join(", ");
  };
  const getReportJobs = () => {
    fetch(`/appServers/api/reportJobs?v=${Math.random()}`, {
      method: "POST",
      body: JSON.stringify({
        ip: server.ip,
        username: server.wlUser,
        password: server.wlPassword,
        queue: "current",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
        reportActiveQueue = [];
        if (data.serverQueues.job)
          if (Array.isArray(data.serverQueues.job)) {
            reportActiveQueue = [...data.serverQueues.job];
          } else {
            reportActiveQueue.push(data.serverQueues.job);
          }
        fetch(`/appServers/api/reportJobs?v=${Math.random()}`, {
          method: "POST",
          body: JSON.stringify({
            ip: server.ip,
            username: server.wlUser,
            password: server.wlPassword,
            queue: "past",
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            reportJobs = [];
            if (data.serverQueues.job)
              if (Array.isArray(data.serverQueues.job)) {
                reportJobs = [...data.serverQueues.job];
              } else {
                reportJobs.push(data.serverQueues.job);
              }
          });
      });
  };
  const getRuntimeServers = () => {
    loading = true;
    RTServers = [];
    fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
      method: "POST",
      body: JSON.stringify({
        ip: server.ip,
        username: server.wlUser,
        password: server.wlPassword,
        url: "/management/weblogic/latest/domainRuntime/serverLifeCycleRuntimes?fields=name,state&links=none",
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        // console.log(result);
        RTServers = result.items.sort((a, b) => a.name.localeCompare(b.name));

        RTServers.forEach((rtServer) => {
          if (rtServer.state === "RUNNING") {
            fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
              method: "POST",
              body: JSON.stringify({
                ip: server.ip,
                username: server.wlUser,
                password: server.wlPassword,
                url: `/management/weblogic/latest/domainRuntime/serverRuntimes/${rtServer.name}?links=none&fields=healthState,activationTime`,
              }),
            })
              .then((res) => res.json())
              .then((result) => {
                rtServer.healthState = result.healthState;
                rtServer.activationTime = result.activationTime;
                loading = false;
              });
            if (
              rtServer.name === "WLS_REPORTS" &&
              rtServer.state === "RUNNING"
            ) {
              showReportJobsCount(rtServer);
              rtServer.reportjobsInterval = setInterval(() => {
                showReportJobsCount(rtServer);
              }, refreshInterval);
            }
            if (false) {
              //threadPoolRuntime
              fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
                method: "POST",
                body: JSON.stringify({
                  ip: server.ip,
                  username: server.wlUser,
                  password: server.wlPassword,
                  url: `/management/weblogic/latest/domainRuntime/serverRuntimes/${rtServer.name}/threadPoolRuntime?links=none&fields=executeThreadIdleCount,queueLength,completedRequestCount,executeThreadTotalCount,pendingUserRequestCount,healthState,stuckThreadCount,throughput,hoggingThreadCount,standbyThreadCount`,
                }),
              })
                .then((res) => res.json())
                .then((result) => {
                  rtServer.threadPoolRuntime = result;
                });
              //JVMRuntime memeory size
              fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
                method: "POST",
                body: JSON.stringify({
                  ip: server.ip,
                  username: server.wlUser,
                  password: server.wlPassword,
                  url: `/management/weblogic/latest/domainRuntime/serverRuntimes/${rtServer.name}/JVMRuntime?links=none&fields=heapSizeCurrent,heapFreeCurrent,heapFreePercent`,
                }),
              })
                .then((res) => res.json())
                .then((result) => {
                  // console.log(result);
                  rtServer.heapSizeCurrent = result.heapSizeCurrent;
                  rtServer.heapFreeCurrent = result.heapFreeCurrent;
                  rtServer.heapFreePercent = result.heapFreePercent;
                });
              if (rtServer.name !== "AdminServer") {
                //JDBCServiceRuntime MBeans connection
                fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
                  method: "POST",
                  body: JSON.stringify({
                    ip: server.ip,
                    username: server.wlUser,
                    password: server.wlPassword,
                    url: `/management/weblogic/latest/domainRuntime/serverRuntimes/${rtServer.name}/JDBCServiceRuntime/JDBCDataSourceRuntimeMBeans?links=none&fields=activeConnectionsCurrentCount,activeConnectionsHighCount,activeConnectionsAverageCount,currCapacityHighCount,highestNumAvailable,numAvailable,numUnavailable,connectionDelayTime,leakedConnectionCount,waitingForConnectionFailureTotal,connectionsTotalCount,currCapacity,reserveRequestCount,failedReserveRequestCount,name,state`,
                  }),
                })
                  .then((res) => res.json())
                  .then((result) => {
                    // console.log(result);
                    rtServer.connectionRuntime = result.items[0];
                  });
              }
            }
          }
        });
      });
  };
  const showReportJobsCount = (rtserver) => {
    // console.log("showReportJobsCount");
    fetch(`/appServers/api/reportJobs?v=${Math.random()}`, {
      method: "POST",
      body: JSON.stringify({
        ip: server.ip,
        username: server.wlUser,
        password: server.wlPassword,
        queue: "current",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.serverQueues.job) {
          if (Array.isArray(data.serverQueues.job))
            currentJobs = data.serverQueues.job.length;
          else currentJobs = 1;
        } else currentJobs = 0;
      });
  };

  const showServerMetrics = (rtServer) => {
    if (rtServer.state === "RUNNING") {
      //threadPoolRuntime
      fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
        method: "POST",
        body: JSON.stringify({
          ip: server.ip,
          username: server.wlUser,
          password: server.wlPassword,
          url: `/management/weblogic/latest/domainRuntime/serverRuntimes/${rtServer.name}/threadPoolRuntime?links=none&fields=executeThreadIdleCount,queueLength,completedRequestCount,executeThreadTotalCount,pendingUserRequestCount,healthState,stuckThreadCount,throughput,hoggingThreadCount,standbyThreadCount`,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          // console.log(result);
          rtServer.threadPoolRuntime = result;
        });
      if (rtServer.name !== "AdminServer") {
        //connection
        fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
          method: "POST",
          body: JSON.stringify({
            ip: server.ip,
            username: server.wlUser,
            password: server.wlPassword,
            url: `/management/weblogic/latest/domainRuntime/serverRuntimes/${rtServer.name}/JDBCServiceRuntime/JDBCDataSourceRuntimeMBeans?links=none&fields=activeConnectionsCurrentCount,activeConnectionsHighCount,activeConnectionsAverageCount,currCapacityHighCount,highestNumAvailable,numAvailable,numUnavailable,connectionDelayTime,leakedConnectionCount,waitingForConnectionFailureTotal,connectionsTotalCount,currCapacity,reserveRequestCount,failedReserveRequestCount,name,state`,
          }),
        })
          .then((res) => res.json())
          .then((result) => {
            // console.log(result);
            rtServer.connectionRuntime = result.items[0];
          });
      }
      //JVMRuntime memeory size
      fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
        method: "POST",
        body: JSON.stringify({
          ip: server.ip,
          username: server.wlUser,
          password: server.wlPassword,
          url: `/management/weblogic/latest/domainRuntime/serverRuntimes/${rtServer.name}/JVMRuntime?links=none&fields=heapSizeCurrent,heapFreeCurrent,heapFreePercent`,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          // console.log(result);
          rtServer.heapSizeCurrent = result.heapSizeCurrent;
          rtServer.heapFreeCurrent = result.heapFreeCurrent;
          rtServer.heapFreePercent = result.heapFreePercent;
        });
      rtServer.metricsInterval = setInterval(() => {
        fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
          method: "POST",
          body: JSON.stringify({
            ip: server.ip,
            username: server.wlUser,
            password: server.wlPassword,
            url: `/management/weblogic/latest/domainRuntime/serverRuntimes/${rtServer.name}/threadPoolRuntime?links=none&fields=executeThreadIdleCount,queueLength,completedRequestCount,executeThreadTotalCount,pendingUserRequestCount,healthState,stuckThreadCount,throughput,hoggingThreadCount,standbyThreadCount`,
          }),
        })
          .then((res) => res.json())
          .then((result) => {
            // console.log(result);
            rtServer.threadPoolRuntime = result;
          });
        if (rtServer.name !== "AdminServer") {
          //connection
          fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
            method: "POST",
            body: JSON.stringify({
              ip: server.ip,
              username: server.wlUser,
              password: server.wlPassword,
              url: `/management/weblogic/latest/domainRuntime/serverRuntimes/${rtServer.name}/JDBCServiceRuntime/JDBCDataSourceRuntimeMBeans?links=none&fields=activeConnectionsCurrentCount,activeConnectionsHighCount,activeConnectionsAverageCount,currCapacityHighCount,highestNumAvailable,numAvailable,numUnavailable,connectionDelayTime,leakedConnectionCount,waitingForConnectionFailureTotal,connectionsTotalCount,currCapacity,reserveRequestCount,failedReserveRequestCount,name,state`,
            }),
          })
            .then((res) => res.json())
            .then((result) => {
              // console.log(result);
              rtServer.connectionRuntime = result.items[0];
            });
        }
        //JVMRuntime memeory size
        fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
          method: "POST",
          body: JSON.stringify({
            ip: server.ip,
            username: server.wlUser,
            password: server.wlPassword,
            url: `/management/weblogic/latest/domainRuntime/serverRuntimes/${rtServer.name}/JVMRuntime?links=none&fields=heapSizeCurrent,heapFreeCurrent,heapFreePercent`,
          }),
        })
          .then((res) => res.json())
          .then((result) => {
            // console.log(result);
            rtServer.heapSizeCurrent = result.heapSizeCurrent;
            rtServer.heapFreeCurrent = result.heapFreeCurrent;
            rtServer.heapFreePercent = result.heapFreePercent;
          });
      }, refreshInterval);
    }
  };

  const showMetrics = () => {
    // console.log("showMetrics");
    RTServers.forEach((rtServer) => {
      showServerMetrics(rtServer);
    });
  };
  const serverAction = (rtserver, e) => {
    e.target.disabled = true;
    rtserver.working = true;
    if (rtserver.state === "RUNNING") {
      if (rtserver.metricsInterval) clearInterval(rtserver.metricsInterval);
      if (rtserver.reportjobsInterval)
        clearInterval(rtserver.reportjobsInterval);
      rtserver.state = "SHUTTING DOWN";
      fetch(`/appServers/api/action?v=${Math.random()}`, {
        method: "POST",
        body: JSON.stringify({
          ip: server.ip,
          username: server.wlUser,
          password: server.wlPassword,
          url: `/management/weblogic/latest/domainRuntime/serverRuntimes/${rtserver.name}/forceShutdown`,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          // console.log(result);
          rtserver.state = "CHECKING";
          if (result.status !== "ok") {
            toast.error("Error while shutting down server");
          }
          rtserver.working = false;
          e.target.disabled = false;
          fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
            method: "POST",
            body: JSON.stringify({
              ip: server.ip,
              username: server.wlUser,
              password: server.wlPassword,
              url: `/management/weblogic/latest/domainRuntime/serverLifeCycleRuntimes/${rtserver.name}?fields=state&links=none`,
            }),
          })
            .then((res) => res.json())
            .then((result) => {
              rtserver.state = result.state;
              if (rtserver.state !== "RUNNING") {
                rtserver.off = true;
              }
            });
        });
    } else {
      rtserver.state = "STARTING";
      fetch(`/appServers/api/action?v=${Math.random()}`, {
        method: "POST",
        body: JSON.stringify({
          ip: server.ip,
          username: server.wlUser,
          password: server.wlPassword,
          url: `/management/weblogic/latest/domainRuntime/serverLifeCycleRuntimes/${rtserver.name}/start`,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          rtserver.working = false;
          e.target.disabled = false;
          if (result.status !== "ok") {
            toast.error("Error while starting server");
          }
          rtserver.state = "CHECKING";
          fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
            method: "POST",
            body: JSON.stringify({
              ip: server.ip,
              username: server.wlUser,
              password: server.wlPassword,
              url: `/management/weblogic/latest/domainRuntime/serverLifeCycleRuntimes/${rtserver.name}?fields=state&links=none`,
            }),
          })
            .then((res) => res.json())
            .then((result) => {
              rtserver.state = result.state;
              if (rtserver.state === "RUNNING") {
                rtserver.off = false;

                fetch(`/appServers/api/getRuntimeServers?v=${Math.random()}`, {
                  method: "POST",
                  body: JSON.stringify({
                    ip: server.ip,
                    username: server.wlUser,
                    password: server.wlPassword,
                    url: `/management/weblogic/latest/domainRuntime/serverRuntimes/${rtserver.name}?links=none&fields=healthState,activationTime`,
                  }),
                })
                  .then((res) => res.json())
                  .then((result) => {
                    rtserver.healthState = result.healthState;
                    rtserver.activationTime = result.activationTime;
                  });
                if (metrics) {
                  showServerMetrics(rtserver);
                }
                if (rtserver.name === "WLS_REPORTS") {
                  showReportJobsCount(rtserver);
                  rtserver.reportjobsInterval = setInterval(() => {
                    showReportJobsCount(rtserver);
                  }, refreshInterval);
                }
              }
            });
        });
    }
  };
  onMount(() => {
    server.metrics = 0;
    fetch(`/servers/api/ping/${server.ip}`)
      .then((res) => res.json())
      .then((data) => {
        alive = data.isAlive;
      })
      .catch(() => {
        alive = false;
      });
    getRuntimeServers();
    return () => {
      // console.log("clearing interval");

      RTServers.forEach((rtserver) => {
        if (rtserver.metricsInterval) {
          clearInterval(rtserver.metricsInterval);
        }
        if (rtserver.reportjobsInterval) {
          clearInterval(rtserver.reportjobsInterval);
        }
      });
    };
  });
  // $inspect(server);
</script>

<div class=" break-inside-avoid w-full">
  <Card.Root
    class="relative md:w-100 w-full  gap-1 text-sm pt-1 pb-0 rounded-none"
  >
    <Card.Header
      class="pb-0 mb-0 w-full flex justify-between [.border-b]:pb-0 px-2 has-data-[slot=card-action]:flex"
    >
      <Card.Title class="flex justify-between items-center py-0 w-full"
        ><div class="flex-1 text-lg font-bold">{server.name}</div>
        {#if alive}
          <div class=" flex gap-1 items-center top-1 left-2 text-xs">
            <div class=" size-3 bg-green-500 rounded-full"></div>
            UP
          </div>
        {:else}
          <div class=" flex gap-1 items-center top-1 left-2 text-xs">
            <div class="size-3 bg-red-500 rounded-full"></div>
            DOWN
          </div>
        {/if}
        <Button
          class="ml-3"
          variant="ghost"
          onclick={() => {
            window.open(`http://${server.ip}:${server.wlPort}/console`);
          }}
          target="_blank"
        >
          Console <Open /></Button
        >
        <Button
          variant="ghost"
          onclick={() => {
            if (isDesktop.current) {
              if (!metrics) {
                server.metrics = 1;
                sortWLS();
                showMetrics();
                setTimeout(() => {
                  metrics = !metrics;
                }, 800);
              } else {
                server.metrics = 0;
                metrics = !metrics;
                setTimeout(() => {
                  sortWLS();
                }, 800);
                RTServers.forEach((rtserver) => {
                  if (rtserver.metricsInterval)
                    clearInterval(rtserver.metricsInterval);
                });
              }
            } else {
              metrics = !metrics;
              if (metrics) {
                showMetrics();
              } else {
                RTServers.forEach((rtserver) => {
                  if (rtserver.metricsInterval)
                    clearInterval(rtserver.metricsInterval);
                });
              }
            }
          }}
        >
          Metrics <ChevronsUpDown /></Button
        >
      </Card.Title>
    </Card.Header>
    <Card.Content class="px-0">
      {#if loading}
        <div
          class=" h-51 p-2 flex flex-col items-center justify-center text-muted-foreground bg-background"
        >
          <Spinner class="size-5" />
        </div>
      {:else}
        {#each RTServers as rtserver}
          {#if metrics}
            <div class="grid grid-cols-[2fr_1fr_1fr_2fr_1fr] border">
              <div
                class="p-1 flex justify-start items-center bg-accent font-bold"
              >
                {rtserver.name}
              </div>
              <div
                class:col-span-3={rtserver.state !== "RUNNING"}
                class="p-1 flex justify-start items-center bg-accent"
              >
                <Badge
                  data-running={rtserver.state === "RUNNING"}
                  class="data-[running=true]:bg-green-500 dark:data-[running=true]:bg-green-400 data-[running=false]:bg-destructive rounded-sm px-0.5"
                  >{rtserver.state}</Badge
                >
              </div>
              {#if rtserver.state === "RUNNING"}
                <div class="p-1 flex justify-center items-center bg-accent">
                  <!-- {#if rtserver.state === "RUNNING"} -->
                  <Badge
                    data-state={rtserver.healthState?.state === "ok"
                      ? "ok"
                      : "notok"}
                    class="data-[state=ok]:bg-green-500 dark:data-[state=ok]:bg-green-400 data-[state=notok]:bg-red-500 dark:data-[state=notok]:bg-red-400 rounded-sm px-0.5"
                    >State:<span class="uppercase font-bold">
                      {rtserver.healthState?.state}
                    </span></Badge
                  >
                  <!-- {/if} -->
                </div>
                <div
                  class="p-1 flex justify-center items-center bg-accent text-xs"
                >
                  <!-- {#if rtserver.state === "RUNNING"} -->
                  {ta.ago(new Date(rtserver.activationTime))}
                  <!-- {/if} -->
                </div>
              {/if}
              <div class=" flex justify-center items-center bg-accent">
                {#if rtserver.name === "AdminServer"}
                  <Sheet.Root
                    onOpenChange={(e) => {
                      if (e) getReportJobs();
                    }}
                  >
                    <Sheet.Trigger
                      disabled={!server.tags.find((tag) => tag.name === "WLFR")}
                      class={buttonVariants({ variant: "ghost" })}
                      ><div class="relative">
                        <TaskTime
                          class="size-5 text-selected data-[FR=false]:text-muted-foreground"
                          data-FR={server.tags.find(
                            (tag) => tag.name === "WLFR",
                          )?.id
                            ? true
                            : false}
                        />
                        <span
                          class:bg-red-500={currentJobs > 0}
                          class="absolute -top-1 -left-2 text-xs text-background rounded-full aspect-square size-4"
                          >{currentJobs > 0 ? currentJobs : ""}</span
                        >
                      </div></Sheet.Trigger
                    >
                    <Sheet.Content
                      side="right"
                      class=" overflow-auto sm:max-w-150 w-full gap-2 px-1"
                    >
                      <Sheet.Header>
                        <Sheet.Title>Report Jobs</Sheet.Title>
                        <Sheet.Description></Sheet.Description>
                      </Sheet.Header>
                      <Button
                        variant="ghost"
                        class="ml-auto mr-3 cursor-pointer"
                        onclick={async () => {
                          reportActiveQueue = [];
                          reportJobs = [];
                          getReportJobs();
                        }}><Refresh class="text-green-500 size-6" /></Button
                      >
                      {#if reportActiveQueue.length > 0}
                        <div class="text-sm font-bold">Active Queue</div>
                        {#each reportActiveQueue as job}
                          <div
                            class="w-full flex flex-wrap gap-2 md:grid md:grid-cols-[1fr_5fr_5fr] p-2 border"
                          >
                            <div
                              class="md:row-span-2 gap-2 flex md:flex-col items-center"
                            >
                              <Button
                                variant="destructive"
                                disabled={job.parentJob}
                                onclick={() => {
                                  // console.log(job);
                                  fetch(
                                    `/appServers/api/reportJobs/killJob?v=${Math.random()}`,
                                    {
                                      method: "POST",
                                      body: JSON.stringify({
                                        ip: server.ip,
                                        username: server.wlUser,
                                        password: server.wlPassword,
                                        id: job._id,
                                      }),
                                    },
                                  )
                                    .then((res) => res.json())
                                    .then((data) => {
                                      console.log(data);
                                      toast.success(
                                        "Report job killed successfully",
                                      );
                                    });
                                }}>Kill Job</Button
                              >
                              <Button
                                variant="destructive"
                                disabled={job.parentJob}
                                onclick={() => {
                                  // console.log(job);
                                  fetch(
                                    `/appServers/api/reportJobs/killEngine?v=${Math.random()}`,
                                    {
                                      method: "POST",
                                      body: JSON.stringify({
                                        ip: server.ip,
                                        username: server.wlUser,
                                        password: server.wlPassword,
                                        id: job._id,
                                      }),
                                    },
                                  )
                                    .then((res) => res.json())
                                    .then((data) => {
                                      console.log(data);
                                      toast.success(
                                        "Report job killed successfully",
                                      );
                                    });
                                }}>Kill Engine</Button
                              >
                            </div>
                            <div class="flex items-center justify-start gap-2">
                              <Report />{job.name}
                            </div>
                            <div class="flex items-center justify-start gap-2">
                              <DateIcon />{ta.ago(
                                new Date(job.timingInfo.started),
                              )}
                            </div>

                            <div class="flex items-center justify-start gap-2">
                              <Printer />{job.destination["desName"]}
                            </div>
                            <div class="flex items-center justify-start gap-2">
                              {job.status["#text"]}
                            </div>
                          </div>
                        {/each}
                      {/if}
                      <div class="text-sm font-bold mt-3">
                        Paste report jobs
                      </div>
                      <Accordion.Root type="multiple">
                        {#each reportJobs as job}
                          <Accordion.Item value={job._id}>
                            <Accordion.Trigger class="hover:no-underline"
                              ><div
                                class="flex items-center justify-between w-full px-3 cursor-pointer"
                              >
                                <div
                                  class="flex items-center justify-start gap-3"
                                >
                                  {#if job.status._code === "4"}
                                    <Success class="text-green-500 size-5" />
                                  {:else if job.status._code === "5"}
                                    <Error class="text-destructive " />
                                  {/if}{job.name}
                                </div>
                                <div>{job.timingInfo.finished}</div>
                              </div></Accordion.Trigger
                            >
                            <Accordion.Content>
                              <div
                                class="grid grid-cols-[auto_auto_auto] gap-2 text-muted-foreground border-t pt-2"
                              >
                                <div class="flex items-center justify-center">
                                  <DateIcon />
                                </div>
                                <div>{job.timingInfo.started}</div>
                                <div>{job.timingInfo.finished}</div>
                                <div class="flex items-center justify-center">
                                  <Printer />
                                </div>
                                <div class="">
                                  {job.destination["desName"]}
                                </div>
                                <div>
                                  {formatToText(
                                    (new Date(job.timingInfo.finished) -
                                      new Date(job.timingInfo.started)) /
                                      1000,
                                  )}
                                </div>
                                <div class="col-span-3 px-3">
                                  <pre
                                    class="w-145 whitespace-pre-wrap break-words px-3">{job
                                      .status["#text"]}</pre>
                                </div>
                              </div>
                            </Accordion.Content>
                          </Accordion.Item>
                        {/each}
                      </Accordion.Root>
                    </Sheet.Content>
                  </Sheet.Root>
                {:else if rtserver.state === "RUNNING"}
                  <Dialog.Root>
                    <Dialog.Trigger>
                      {#if rtserver.working}
                        <Loading class="size-6 text-selected" />
                      {:else}
                        <Shutdown
                          data-shutdown={rtserver.state === "RUNNING"}
                          class="data-[shutdown=true]:text-destructive size-6 text-green-500"
                        />
                      {/if}
                    </Dialog.Trigger>
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>Shuting down {rtserver.name}</Dialog.Title
                        >
                      </Dialog.Header>
                      <Dialog.Footer class="sm:justify-between">
                        <Dialog.Close
                          class={buttonVariants({ variant: "secondary" })}
                          >Close</Dialog.Close
                        >
                        <Dialog.Close
                          class={buttonVariants({ variant: "secondary" })}
                        >
                          <Button
                            variant="ghost"
                            onclick={(e) => {
                              serverAction(rtserver, e);
                            }}
                          >
                            {#if rtserver.working}
                              <Loading class="size-6 text-selected" />
                            {:else}
                              <Shutdown
                                data-shutdown={rtserver.state === "RUNNING"}
                                class="data-[shutdown=true]:text-destructive size-6 text-green-500"
                              />
                            {/if}
                          </Button>
                        </Dialog.Close>
                      </Dialog.Footer>
                    </Dialog.Content>
                  </Dialog.Root>
                {:else}
                  <Button
                    variant="ghost"
                    onclick={(e) => {
                      serverAction(rtserver, e);
                    }}
                  >
                    {#if rtserver.working}
                      <Loading class="size-6 text-selected" />
                    {:else}
                      <Shutdown
                        data-shutdown={rtserver.state === "RUNNING"}
                        class="data-[shutdown=true]:text-destructive size-6 text-green-500"
                      />
                    {/if}
                  </Button>
                {/if}
              </div>
            </div>
          {:else}
            <div class="grid grid-cols-[2fr_3fr_1fr] border p-1 bg-background">
              <div class="p-1 flex justify-start items-center font-bold">
                {rtserver.name}
              </div>
              <div
                // class:col-span-3={rtserver.state !== "RUNNING"}
                class="p-1 flex justify-start items-center"
              >
                State: <div
                  data-running={rtserver.state === "RUNNING"}
                  class="flex data-[running=true]:text-green-500 dark:data-[running=true]:text-green-400 data-[running=false]:text-destructive px-1 font-bold"
                >
                  {rtserver.state}
                  {#if rtserver.state === "RUNNING"}<Refresh
                      class=" ml-1 animate-spin animation-duration-[5s]"
                    />
                  {:else if rtserver.state === "SHUTTING DOWN"}
                    <Down
                      class="ml-1 animate-bounce animation-duration-[2s] translate-y-1"
                    />
                  {:else if rtserver.state === "STARTING"}
                    <Up
                      class="ml-1 animate-bounce animation-duration-[2s]  translate-y-1"
                    />
                  {/if}
                </div>
              </div>
              <div class="row-span-2 flex justify-center items-center">
                {#if rtserver.name === "AdminServer"}
                  <Sheet.Root
                    onOpenChange={(e) => {
                      if (e) getReportJobs();
                    }}
                  >
                    <Sheet.Trigger
                      disabled={!server.tags.find((tag) => tag.name === "WLFR")}
                      class={buttonVariants({ variant: "ghost" })}
                      ><div class="relative">
                        <TaskTime
                          class="size-5 text-selected data-[FR=false]:text-muted-foreground"
                          data-FR={server.tags.find(
                            (tag) => tag.name === "WLFR",
                          )?.id
                            ? true
                            : false}
                        />
                        <span
                          class:bg-red-500={currentJobs > 0}
                          class="absolute -top-1 -left-2 text-xs text-background rounded-full aspect-square size-4"
                          >{currentJobs > 0 ? currentJobs : ""}</span
                        >
                      </div></Sheet.Trigger
                    >
                    <Sheet.Content
                      side="right"
                      class=" overflow-hidden sm:max-w-150 w-full gap-2 px-1"
                    >
                      <Sheet.Header>
                        <Sheet.Title>Report Jobs</Sheet.Title>
                        <Sheet.Description></Sheet.Description>
                      </Sheet.Header>
                      <Button
                        variant="ghost"
                        class="ml-auto mr-3 cursor-pointer"
                        onclick={async () => {
                          reportActiveQueue = [];
                          reportJobs = [];
                          getReportJobs();
                        }}><Refresh class="text-green-500 size-6" /></Button
                      >
                      <div class="w-full overflow-auto">
                        {#if reportActiveQueue.length > 0}
                          <div class="text-sm font-bold">Active Queue</div>
                          {#each reportActiveQueue as job}
                            <div
                              class="w-full flex flex-wrap gap-2 md:grid md:grid-cols-[1fr_5fr_5fr] p-2 border"
                            >
                              <div
                                class="md:row-span-2 gap-2 flex md:flex-col items-center"
                              >
                                <Button
                                  variant="destructive"
                                  disabled={job.parentJob}
                                  onclick={() => {
                                    // console.log(job);
                                    fetch(
                                      `/appServers/api/reportJobs/killJob?v=${Math.random()}`,
                                      {
                                        method: "POST",
                                        body: JSON.stringify({
                                          ip: server.ip,
                                          username: server.wlUser,
                                          password: server.wlPassword,
                                          id: job._id,
                                        }),
                                      },
                                    )
                                      .then((res) => res.json())
                                      .then((data) => {
                                        console.log(data);
                                        toast.success(
                                          "Report job killed successfully",
                                        );
                                      });
                                  }}>Kill Job</Button
                                >
                                <Button
                                  variant="destructive"
                                  disabled={job.parentJob}
                                  onclick={() => {
                                    // console.log(job);
                                    fetch(
                                      `/appServers/api/reportJobs/killEngine?v=${Math.random()}`,
                                      {
                                        method: "POST",
                                        body: JSON.stringify({
                                          ip: server.ip,
                                          username: server.wlUser,
                                          password: server.wlPassword,
                                          id: job._id,
                                        }),
                                      },
                                    )
                                      .then((res) => res.json())
                                      .then((data) => {
                                        console.log(data);
                                        toast.success(
                                          "Report job killed successfully",
                                        );
                                      });
                                  }}>Kill Engine</Button
                                >
                              </div>
                              <div
                                class="flex items-center justify-start gap-2"
                              >
                                <Report />{job.name}
                              </div>
                              <div
                                class="flex items-center justify-start gap-2"
                              >
                                <DateIcon />{ta.ago(
                                  new Date(job.timingInfo.started),
                                )}
                              </div>

                              <div
                                class="flex items-center justify-start gap-2"
                              >
                                <Printer />{job.destination["desName"]}
                              </div>
                              <div
                                class="flex items-center justify-start gap-2"
                              >
                                {job.status["#text"]}
                              </div>
                            </div>
                          {/each}
                        {/if}
                        <div class="text-sm font-bold mt-3">
                          Paste report jobs
                        </div>
                        <Accordion.Root type="multiple">
                          {#each reportJobs as job}
                            <Accordion.Item value={job._id}>
                              <Accordion.Trigger class="hover:no-underline"
                                ><div
                                  class="flex items-center justify-between w-full px-3 cursor-pointer"
                                >
                                  <div
                                    class="flex items-center justify-start gap-3"
                                  >
                                    {#if job.status._code === "4"}
                                      <Success class="text-green-500 size-5" />
                                    {:else if job.status._code === "5"}
                                      <Error class="text-destructive " />
                                    {/if}{job.name}
                                  </div>
                                  <div>{job.timingInfo.finished}</div>
                                </div></Accordion.Trigger
                              >
                              <Accordion.Content>
                                <div
                                  class="grid grid-cols-[auto_auto_auto] gap-2 text-muted-foreground border-t pt-2"
                                >
                                  <div class="flex items-center justify-center">
                                    <DateIcon />
                                  </div>
                                  <div>{job.timingInfo.started}</div>
                                  <div>{job.timingInfo.finished}</div>
                                  <div class="flex items-center justify-center">
                                    <Printer />
                                  </div>
                                  <div class="">
                                    {job.destination["desName"]}
                                  </div>
                                  <div>
                                    <!-- {ta.ago(
                                      new Date().setTime(
                                        new Date().getTime() -
                                          (new Date(job.timingInfo.finished) -
                                            new Date(job.timingInfo.started)),
                                      ),
                                    )} -->
                                    {formatToText(
                                      (new Date(job.timingInfo.finished) -
                                        new Date(job.timingInfo.started)) /
                                        1000,
                                    )}
                                    <!-- -
                                    {new Date(
                                      new Date(job.timingInfo.finished) -
                                        new Date(job.timingInfo.started),
                                    )
                                      .toISOString()
                                      .slice(11, 19)} -->
                                  </div>
                                  <div class="col-span-3 px-3">
                                    <pre
                                      class="w-145 whitespace-pre-wrap break-words px-3">{job
                                        .status["#text"]}</pre>
                                  </div>
                                </div>
                              </Accordion.Content>
                            </Accordion.Item>
                          {/each}
                        </Accordion.Root>
                      </div>
                    </Sheet.Content>
                  </Sheet.Root>
                {:else if rtserver.state === "RUNNING"}
                  <Dialog.Root>
                    <Dialog.Trigger
                      class={buttonVariants({ variant: "destructive" })}
                    >
                      {#if rtserver.working}
                        <Loading class="size-6 text-selected" />
                      {:else}
                        <Shutdown
                          data-shutdown={rtserver.state === "RUNNING"}
                          class="data-[shutdown=true]:text-destructive size-6 text-green-500"
                        />
                      {/if}
                    </Dialog.Trigger>
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>Shuting down {rtserver.name}</Dialog.Title
                        >
                      </Dialog.Header>
                      <Dialog.Footer class="sm:justify-between">
                        <Dialog.Close
                          class={buttonVariants({ variant: "secondary" })}
                          >Close</Dialog.Close
                        >
                        <Dialog.Close
                          class={buttonVariants({ variant: "secondary" })}
                        >
                          <Button
                            variant="ghost"
                            onclick={(e) => {
                              serverAction(rtserver, e);
                            }}
                          >
                            {#if rtserver.working}
                              <Loading class="size-6 text-selected" />
                            {:else}
                              <Shutdown
                                data-shutdown={rtserver.state === "RUNNING"}
                                class="data-[shutdown=true]:text-destructive size-6 text-green-500"
                              />
                            {/if}
                          </Button>
                        </Dialog.Close>
                      </Dialog.Footer>
                    </Dialog.Content>
                  </Dialog.Root>
                {:else}
                  <Button
                    variant="ghost"
                    class="bg-green-500/10 hover:bg-green-500/20 dark:hover:bg-green-500/30"
                    onclick={(e) => {
                      serverAction(rtserver, e);
                    }}
                  >
                    {#if rtserver.working}
                      <Loading class="size-6 text-selected" />
                    {:else}
                      <Shutdown
                        data-shutdown={rtserver.state === "RUNNING"}
                        class="data-[shutdown=true]:text-destructive  size-6 text-green-500"
                      />
                    {/if}
                  </Button>
                {/if}
              </div>

              {#if rtserver.state === "RUNNING"}
                <div class="p-1 flex justify-start items-center">
                  Health State: <span
                    data-state={rtserver.healthState?.state === "ok"
                      ? "ok"
                      : "notok"}
                    class="ml-1 font-bold uppercase data-[state=ok]:text-green-500 dark:data-[state=ok]:text-green-400 data-[state=notok]:text-destructive"
                    >{rtserver.healthState?.state}</span
                  >
                </div>
                <div class="p-1 flex justify-start gap-2 items-center">
                  <DateIcon />
                  {ta.ago(new Date(rtserver.activationTime))}
                </div>
              {/if}
            </div>
          {/if}
          <div class="grid grid-cols-[2fr_1fr_1fr_2fr_1fr] border">
            <Collapsible.Root
              bind:open={metrics}
              data-off={rtserver.off === true}
              class="  data-[off=true]:opacity-20 col-span-5 border-b last:border-b-0 "
            >
              <!-- <div class="flex items-center justify-between space-x-4 px-4 py-1">
              <h4 class="font-semibold">Metrics</h4>
              <Collapsible.Trigger
                class={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  class: "w-9 p-0",
                })}
              >
                <ChevronsUpDown />
              </Collapsible.Trigger>
            </div> -->
              <Collapsible.Content
                class=" data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up  grid grid-cols-[2fr_1fr_2fr_1fr] gap-0  py-1 px-3 text-muted-foreground bg-background"
              >
                {#if rtserver.threadPoolRuntime}
                  <div
                    class="w-full data-[off=true]:opacity-20 col-span-4 flex justify-between gap-3 border-b py-1"
                  >
                    <div class="text-foreground font-bold text-left flex-1">
                      Heap
                    </div>
                    <div class="">
                      Size: {formatBytes(rtserver.heapSizeCurrent)}
                    </div>

                    <div class="">
                      Free: {formatBytes(rtserver.heapFreeCurrent)}
                    </div>

                    <div class="text-right">
                      Free Percent : <span
                        class:text-red-500={rtserver.heapFreePercent < 20}
                        >{rtserver.heapFreePercent}</span
                      >%
                    </div>
                  </div>
                  <div class="col-span-4 text-foreground font-bold">
                    Thread Pool
                  </div>
                  <div class="">Status:</div>
                  <div class="border-r pr-2 flex justify-end">
                    <Popover.Root>
                      <Popover.Trigger
                        class="  data-[notok=true]:text-destructive uppercase data-[notok=true]:cursor-pointer"
                        disabled={rtserver.threadPoolRuntime?.healthState
                          ?.state === "ok"}
                        data-notok={rtserver.threadPoolRuntime?.healthState
                          ?.state !== "ok"}
                      >
                        {rtserver.threadPoolRuntime?.healthState
                          ?.state}</Popover.Trigger
                      >

                      <Popover.Content
                        class=" text-sm grid grid-cols-[auto_auto] "
                      >
                        {#each rtserver.threadPoolRuntime.healthState.symptoms as symptom}
                          <div>{symptom.severity}</div>
                          <div>{symptom.info}</div>
                        {/each}
                      </Popover.Content>
                    </Popover.Root>
                  </div>
                  <div class="pl-2">Queue :</div>
                  <div
                    class="text-right data-[high=true]:text-destructive"
                    data-high={rtserver.threadPoolRuntime?.queueLength > 0}
                  >
                    {rtserver.threadPoolRuntime?.queueLength}
                  </div>
                  <div>Execute</div>
                  <div class="text-right pr-2 border-r">
                    {rtserver.threadPoolRuntime?.executeThreadTotalCount}
                  </div>
                  <div class="pl-2">Throughput :</div>
                  <div class="text-right">
                    {Number(rtserver.threadPoolRuntime?.throughput).toFixed(2)}
                  </div>
                  <div>Idle :</div>
                  <div class="text-right pr-2 border-r">
                    {rtserver.threadPoolRuntime?.executeThreadIdleCount}
                  </div>
                  <div class="pl-2">Stuck :</div>
                  <div
                    class="text-right data-[stuck=true]:text-destructive"
                    data-stuck={rtserver.threadPoolRuntime?.stuckThreadCount >
                      0}
                  >
                    {rtserver.threadPoolRuntime?.stuckThreadCount}
                  </div>
                  <div>Standby :</div>
                  <div class="text-right pr-2 border-r">
                    {rtserver.threadPoolRuntime?.standbyThreadCount}
                  </div>
                  <div class="pl-2">Hogging :</div>
                  <div
                    class="text-right data-[hogging=true]:text-yellow-500"
                    data-hogging={rtserver.threadPoolRuntime
                      ?.hoggingThreadCount > 0}
                  >
                    {rtserver.threadPoolRuntime?.hoggingThreadCount}
                  </div>
                  <div>Completed:</div>
                  <div class="text-right pr-2 border-r">
                    {new Intl.NumberFormat("en-US").format(
                      rtserver.threadPoolRuntime?.completedRequestCount,
                    )}
                  </div>
                  <div class="pl-2">Pending :</div>
                  <div
                    class="text-right data-[pending=true]:text-destructive mb-1"
                    data-pending={rtserver.threadPoolRuntime
                      ?.pendingUserRequestCount > 0}
                  >
                    {rtserver.threadPoolRuntime?.pendingUserRequestCount}
                  </div>
                {/if}
                {#if rtserver.connectionRuntime}
                  <div class="col-span-4 text-foreground font-bold border-t">
                    Connections
                  </div>
                  <div>State:</div>
                  <div class="border-r pr-2 flex justify-end">
                    {rtserver.connectionRuntime?.state}
                    <!-- <Popover.Root>
                  <Popover.Trigger
                    class="  data-[notok=true]:text-destructive uppercase data-[notok=true]:cursor-pointer"
                    disabled={server.threadPoolRuntime.healthState.state ===
                      "ok"}
                    data-notok={server.threadPoolRuntime.healthState.state !==
                      "ok"}
                  >
                    {server.threadPoolRuntime.healthState
                      .state}</Popover.Trigger
                  >

                  <Popover.Content class=" text-sm grid grid-cols-[auto_auto] ">
                    {#each server.threadPoolRuntime.healthState.symptoms as symptom}
                      <div>{symptom.severity}</div>
                      <div>{symptom.info}</div>
                    {/each}
                  </Popover.Content>
                </Popover.Root> -->
                  </div>
                  <div class="pl-2">Average :</div>
                  <div class=" pr-2 text-right">
                    {rtserver.connectionRuntime?.activeConnectionsAverageCount}
                  </div>
                  <div class="">Capacity :</div>
                  <div class="text-right pr-2 border-r">
                    {rtserver.connectionRuntime?.currCapacity}
                  </div>
                  <div class="pl-2">Peack :</div>
                  <div class="pr-2 text-right">
                    {rtserver.connectionRuntime?.currCapacityHighCount}
                  </div>
                  <div class="text-selected font-bold">Active :</div>
                  <div class="text-right pr-2 border-r text-selected font-bold">
                    {rtserver.connectionRuntime?.activeConnectionsCurrentCount}
                  </div>
                  <div class="pl-2">Highest:</div>
                  <div class="text-right pr-2">
                    {rtserver.connectionRuntime?.activeConnectionsHighCount}
                  </div>
                  <div class="">Idle:</div>
                  <div class="text-right pr-2 border-r">
                    {rtserver.connectionRuntime?.numAvailable}
                  </div>
                  <div class="pl-2">Hst Idle:</div>
                  <div class="text-right pr-2">
                    {rtserver.connectionRuntime?.highestNumAvailable}
                  </div>
                  <div class="">Unavailable:</div>
                  <div
                    class="text-right pr-2 border-r data-[ua=true]:text-destructive"
                    data-ua={rtserver.connectionRuntime?.numUnavailable > 0}
                  >
                    {rtserver.connectionRuntime?.numUnavailable}
                  </div>
                  <div class="pl-2">Delay Time:</div>
                  <div class="text-right pr-2">
                    {rtserver.connectionRuntime?.connectionDelayTime}
                  </div>
                  <div class="">Leaked :</div>
                  <div
                    class="text-right pr-2 border-r data-[leaked=true]:text-destructive"
                    data-leaked={rtserver.connectionRuntime
                      ?.leakedConnectionCount > 0}
                  >
                    {new Intl.NumberFormat("en-US").format(
                      rtserver.connectionRuntime?.leakedConnectionCount,
                    )}
                  </div>
                  <div class="pl-2">Total:</div>
                  <div class="text-right pr-2">
                    {new Intl.NumberFormat("en-US").format(
                      rtserver.connectionRuntime?.connectionsTotalCount,
                    )}
                  </div>
                  <div class="">Lease:</div>
                  <div class="text-right pr-2 border-r">
                    {new Intl.NumberFormat("en-US").format(
                      rtserver.connectionRuntime?.reserveRequestCount,
                    )}
                  </div>
                  <div class="pl-2">Failed:</div>
                  <div class="text-right pr-2">
                    {new Intl.NumberFormat("en-US").format(
                      rtserver.connectionRuntime?.failedReserveRequestCount,
                    )}
                  </div>
                {/if}
              </Collapsible.Content>
            </Collapsible.Root>
          </div>
        {/each}
      {/if}
    </Card.Content>
  </Card.Root>
</div>
