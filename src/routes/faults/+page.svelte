<script>
  import { MediaQuery } from "svelte/reactivity";
  import { page } from "$app/state";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Progress } from "$lib/components/ui/progress/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import Spinner from "~icons/svg-spinners/bars-scale-fade";
  import { onMount } from "svelte";

  const isDesktop = new MediaQuery("(min-width: 768px)");

  let loading = $state(false);
  let serversFaults = $state({});
  let selectedServer = $state(null);
  let faultType = $state("san");
  let servers = $derived(
    serversFaults[faultType]?.map((server) => server.name),
  );
  $effect(() => {
    selectedServer = servers ? servers[0] : null;
  });
  const getData = async (server) => {
    loading = true;
    const response = await fetch(`${page.url.pathname}/api/getData`);
    serversFaults = await response.json();

    loading = false;
  };
  onMount(() => {
    getData();
  });

  // $inspect(
  //   serversFaults.ovs?.find((server) => server.name === selectedServer)?.result,
  // );
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">Hardware Faults</h1>
    <Tabs.Root bind:value={faultType} class="items-center ml-auto">
      <Tabs.List>
        <Tabs.Trigger
          disabled
          value=""
          class="text-lg  font-bold hidden md:inline-flex "
          >Fault Sorce :
        </Tabs.Trigger>

        <Tabs.Trigger
          value="san"
          class="text-lg font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
          >SAN</Tabs.Trigger
        >
        <Tabs.Trigger
          value="ovs"
          class="text-lg font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
          >OVS</Tabs.Trigger
        >
      </Tabs.List>
    </Tabs.Root>

    <Tabs.Root bind:value={selectedServer} class="items-center ml-3">
      <Tabs.List class=" min-w-50">
        <Tabs.Trigger
          disabled
          value=""
          class="text-lg  font-bold hidden md:inline-flex "
          >Server :
        </Tabs.Trigger>
        {#each servers as server, index}
          <Tabs.Trigger
            value={server}
            class="text-lg font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
            >{server}</Tabs.Trigger
          >
        {/each}
      </Tabs.List>
    </Tabs.Root>
  </div>
</header>
<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
  {#if loading}
    <div class="w-full flex items-center justify-center py-10">
      <Spinner class="h-8 w-8" />
    </div>
  {/if}
  {#if faultType === "san" && selectedServer && serversFaults.san}
    <div class="rounded-lg border overflow-hidden">
      <Table.Root>
        <Table.Header>
          <Table.Row class="bg-accent">
            <Table.Head class="text-center">Alert Serverity</Table.Head>
            <Table.Head class="text-left">Date</Table.Head>
            <Table.Head class="text-left">Alert Component</Table.Head>
            <Table.Head class="text-left">Message</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each [...serversFaults.san?.find((server) => server.name === selectedServer).result].sort((a, b) => new Date(b.content.timestamp) - new Date(a.content.timestamp)) as faults}
            <Table.Row>
              <Table.Cell class="font-medium text-center"
                >{#if faults.content.severity == "1" || faults.content.severity == "2"}
                  <Badge variant="destructive">{faults.content.severity}</Badge>
                {:else if faults.severity == "3" || faults.content.severity == "4"}
                  <Badge
                    variant="secondary"
                    class="bg-yellow-500 text-white dark:bg-yellow-600"
                    >{faults.content.severity}</Badge
                  >
                {:else}
                  <Badge
                    variant="secondary"
                    class="bg-green-500 text-white dark:bg-green-600"
                    >{faults.content.severity}</Badge
                  >
                {/if}</Table.Cell
              >
              <Table.Cell class="text-left"
                >{new Date(
                  faults.content.timestamp,
                ).toLocaleString()}</Table.Cell
              >
              <Table.Cell class="text-left"
                >{faults.content.component?.id} - {faults.content.component
                  ?.resource}</Table.Cell
              >
              <Table.Cell class="text-left">{faults.content.message}</Table.Cell
              >
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  {/if}
  {#if faultType === "ovs" && selectedServer && serversFaults.ovs}
    <pre
      class="text-wrap w-full rounded-md border border-gray-300 bg-background py-4 pl-4 text-gray-700 dark:text-gray-300 dark:border-gray-600">{serversFaults.ovs?.find(
        (server) => server.name === selectedServer,
      )?.result}</pre>
  {/if}
</div>
