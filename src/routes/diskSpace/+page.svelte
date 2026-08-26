<script>
  import { MediaQuery } from "svelte/reactivity";
  import { page } from "$app/state";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Progress } from "$lib/components/ui/progress/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import Spinner from "~icons/svg-spinners/bars-scale-fade";
  let { data } = $props();
  // svelte-ignore state_referenced_locally
  let { servers } = data;
  const isDesktop = new MediaQuery("(min-width: 768px)");
  let serverId = $state(servers[0]?.id);
  let serverDiskSpace = $state(null);
  let loading = $state(false);
  const getSpace = async (server) => {
    if (!server) return;
    loading = true;
    const response = await fetch(`${page.url.pathname}/api/getSpace`, {
      method: "POST",
      body: JSON.stringify({
        ip: server.ip,
        username: server.username,
        password: server.password,
      }),
    });
    const data = await response.json();
    serverDiskSpace = data.result;
    loading = false;
  };
  $effect(() => {
    if (serverId) {
      serverDiskSpace = null;
      const server = servers.find((server) => server.id === serverId);
      getSpace(server);
    }
  });
  // $inspect(serverDiskSpace);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">Servers Time</h1>
    <Tabs.Root bind:value={serverId} class="items-center ml-auto">
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
            class="text-lg font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
            >{server.name}</Tabs.Trigger
          >
        {/each}
      </Tabs.List>
    </Tabs.Root>
  </div>
</header>
<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
  {#if isDesktop.current}
    <div class="rounded-lg border overflow-hidden">
      <Table.Root class="dark:text-muted-foreground ">
        <!-- <Table.Caption
          >A list of server {servers.find((server) => server.id === serverId)
            ?.name}
          mount points.</Table.Caption
        > -->
        <Table.Header>
          <Table.Row class="bg-accent">
            <Table.Head>Filesystem</Table.Head>
            <Table.Head class="text-end">Size</Table.Head>
            <Table.Head class="text-end">Used</Table.Head>
            <Table.Head class="text-end">Available</Table.Head>
            <Table.Head class="pl-5 w-[60%]">Use Percent</Table.Head>
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
          {#each serverDiskSpace as diskSpace}
            <Table.Row>
              <Table.Cell class="font-medium">{diskSpace.filesystem}</Table.Cell
              >
              <Table.Cell class="text-end">{diskSpace.size}</Table.Cell>
              <Table.Cell class="text-end">{diskSpace.used}</Table.Cell>
              <Table.Cell class="text-end">{diskSpace.avail}</Table.Cell>
              <Table.Cell class="pl-5 ">
                <div class="flex items-center gap-2">
                  <span class="w-10 mr-5 text-end">
                    {diskSpace.usePercent}</span
                  ><Progress
                    class="h-5"
                    barClass={[
                      diskSpace.usePercent.replace("%", "") > 90
                        ? "bg-destructive"
                        : "bg-muted-foreground ",
                    ]}
                    value={parseInt(
                      diskSpace.used
                        .replace("M", "")
                        .replace("G", "000")
                        .replace("T", "000000")
                        .replace(".", ""),
                    )}
                    max={parseInt(
                      diskSpace.size
                        .replace("M", "")
                        .replace("G", "000")
                        .replace("T", "000000")
                        .replace(".", ""),
                    )}
                  />
                </div>
              </Table.Cell>
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
      {#each serverDiskSpace as diskSpace}
        <Card.Root class="p-1 pb-2">
          <Card.Content class="flex flex-col justify-center items-center p-1">
            <div class="text-master text-2xl font-bold w-full text-center">
              {diskSpace.filesystem}
            </div>

            <div class=" text-lg font-bold w-full text-center">
              Size : {diskSpace.size} | Used : {diskSpace.used} | Avail : {diskSpace.avail}
            </div>
            <div class="flex items-center gap-2 w-full justify-center">
              {diskSpace.usePercent}<Progress
                class="h-5"
                barClass={[
                  diskSpace.usePercent.replace("%", "") > 90
                    ? "bg-destructive"
                    : "bg-primary",
                ]}
                value={parseInt(
                  diskSpace.used
                    .replace("M", "")
                    .replace("G", "000")
                    .replace("T", "000000")
                    .replace(".", ""),
                )}
                max={parseInt(
                  diskSpace.size
                    .replace("M", "")
                    .replace("G", "000")
                    .replace("T", "000000")
                    .replace(".", ""),
                )}
              />
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}
</div>
