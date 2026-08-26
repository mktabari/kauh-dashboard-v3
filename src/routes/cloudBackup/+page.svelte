<script>
  import { MediaQuery } from "svelte/reactivity";
  import { page } from "$app/state";
  import ta from "time-ago";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Progress } from "$lib/components/ui/progress/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import Spinner from "~icons/svg-spinners/bars-scale-fade";
  let { data } = $props();
  // svelte-ignore state_referenced_locally
  let { servers } = data;
  const isDesktop = new MediaQuery("(min-width: 768px)");
  let serverId = $state(servers[0]?.id || null);
  let serverData = $state(null);
  let loading = $state(false);
  const getData = async (server) => {
    if (!server) return;
    loading = true;
    console.log(server.id);
    const response = await fetch(
      `${page.url.pathname}/api/getData/${server.id}`,
      // , {
      //   method: "POST",
      //   body: JSON.stringify({
      //     ip: server.ip,
      //     username: server.username,
      //     password: server.password,
      //   }),
      // }
    );
    const data = await response.json();
    serverData = data.result;
    loading = false;
  };
  const duration = (startDate, endDate) => {
    if (endDate === "1/1/1900 12:00:00 AM") endDate = new Date();
    let diff = Date.parse(endDate) - Date.parse(startDate);
    return ta
      .ago(new Date().setTime(new Date().getTime() - diff))
      .replace(
        " ago",
        diff / (1000 * 3600) > 24
          ? " (" + (diff / (1000 * 3600)).toFixed(0) + " H)"
          : "",
      );

    // return (
    //   (Date.parse(endDate) - Date.parse(startDate)) /
    //   (1000 * 3600)
    // ).toFixed(0);
  };
  $effect(() => {
    if (serverId) {
      serverData = null;
      const server = servers.find((server) => server.id === serverId);
      getData(server);
    }
  });
  // $inspect(serverData);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">Cloud Backups</h1>
  </div>
</header>
<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
  {#if !serverId}
    <div class="w-full flex items-center justify-center py-10">
      <span class="text-muted-foreground text-lg"
        >No server with Veeam tag found</span
      >
    </div>
  {:else}
    <!-- <Tabs.Root bind:value={serverId} class="w-full items-center mb-1">
    <Tabs.List>
      <Tabs.Trigger
        disabled
        value=""
        class="text-lg  font-bold hidden md:inline-flex "
        >Server :
      </Tabs.Trigger>
      {#each servers as server, index}
        <Tabs.Trigger
          value={server.id}
          class="text-lg  font-bold data-[state=active]:text-master data-[state=active]:dark:text-master"
          >{server.name}</Tabs.Trigger
        >
      {/each}
    </Tabs.List>
  </Tabs.Root> -->
    {#if isDesktop.current}
      <div class=" border rounded-lg overflow-hidden w-fit min-w-1/2">
        <Table.Root class="">
          <!-- <Table.Caption
          >A list of server {servers.find((server) => server.id === serverId)
            ?.name}
          backup logs.</Table.Caption
        > -->
          <Table.Header>
            <Table.Row class="bg-accent">
              <Table.Head class="text-center">Start Time</Table.Head>
              <Table.Head class="text-center">End Time</Table.Head>
              <Table.Head class="text-center">Result</Table.Head>
              <Table.Head class="text-center">State</Table.Head>
              <Table.Head class="text-center">Duration (hours)</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#if loading}
              <Table.Row>
                <Table.Cell colspan="5" class=" ">
                  <div class="w-full flex items-center justify-center py-10">
                    <Spinner class="h-8 w-8" />
                  </div>
                </Table.Cell>
              </Table.Row>
            {/if}
            {#each serverData as job}
              <Table.Row>
                <Table.Cell class="text-center ">{job.CreationTime}</Table.Cell>
                <Table.Cell class="text-center"
                  >{job.EndTime === "1/1/1900 12:00:00 AM"
                    ? ""
                    : job.EndTime}</Table.Cell
                >
                <Table.Cell class="text-center"
                  ><div class="w-full flex items-center justify-center">
                    <Badge
                      variant={job.Result === "Success"
                        ? "secondary"
                        : "destructive"}
                      class={[
                        job.Result === "Success" &&
                          "bg-green-500/15 dark:bg-green-600/15 text-green-500",
                        job.Result !== "Success" &&
                          job.Result !== "Failed" &&
                          "bg-yellow-500/15 dark:bg-yellow-600/15  text-yellow-500",
                        ,
                      ]}>{job.Result}</Badge
                    >
                  </div>
                </Table.Cell>
                <Table.Cell
                  class={[
                    "text-center",
                    job.State === "Working" && "text-blue-500 font-bold",
                  ]}>{job.State}</Table.Cell
                >
                <Table.Cell class="text-center"
                  ><div class="w-full flex items-center justify-center">
                    <Badge variant="secondary">
                      {duration(job.CreationTime, job.EndTime)}</Badge
                    >
                  </div></Table.Cell
                >
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    {:else}
      <div class="w-full flex gap-2 flex-col">
        {#if loading}
          <div class="w-full flex items-center justify-center py-10">
            <Spinner class="h-8 w-8" />
          </div>
        {/if}
        {#each serverData as job}
          <Card.Root class="p-1 pb-2">
            <Card.Content class="grid grid-cols-4 p-1 gap-2">
              <div
                class="font-bold col-span-1 flex items-center justify-center"
              >
                <Badge
                  variant={job.Result === "Success"
                    ? "secondary"
                    : "destructive"}
                  class={[
                    "text-base rounded-md",
                    job.Result === "Success" &&
                      "bg-green-500 dark:bg-green-600 text-white",
                    job.Result !== "Success" &&
                      job.Result !== "Failed" &&
                      "bg-yellow-500 dark:bg-yellow-600  text-white",
                    ,
                  ]}>{job.Result}</Badge
                >
              </div>
              <div
                class="font-bold col-span-1 flex items-center justify-center"
                class:text-blue-500={job.State === "Working"}
                class:font-bold={job.State === "Working"}
              >
                {job.State}
              </div>
              <div
                class="font-bold col-span-2 flex items-center justify-center"
              >
                <Badge variant="secondary" class="text-base">
                  {duration(job.CreationTime, job.EndTime)}</Badge
                >
              </div>
              <div class="text-master font-bold w-full text-center col-span-2">
                {new Date(job.CreationTime).toLocaleString("en-GB", {
                  hour: "numeric",
                  minute: "numeric",
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div class="text-master font-bold w-full text-center col-span-2">
                {job.EndTime === "1/1/1900 12:00:00 AM"
                  ? ""
                  : new Date(job.EndTime).toLocaleString("en-GB", {
                      hour: "numeric",
                      minute: "numeric",
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                    })}
              </div>
              <!-- <div class=" text-lg font-bold w-full text-center">
                Result : {job.Result} | State : {job.State}| Duration : {duration(
                  job.CreationTime,
                  job.EndTime,
                )} hours
              </div> -->
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
    {/if}
  {/if}
</div>
