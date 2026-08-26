<script>
  import { MediaQuery } from "svelte/reactivity";
  import Lines from "~icons/el/lines";
  import Oracle from "~icons/cib/oracle";
  import Windows from "~icons/fontisto/windows";
  import Linux from "~icons/fontisto/linux";
  import Dell from "~icons/simple-icons/dell";
  import Plus from "~icons/mdi/plus-circle";
  import Minus from "~icons/mdi/minus-circle";
  import Clock from "~icons/mdi/clock-check-outline";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import Copy from "$lib/myComponents/Copy.svelte";
  import ServerTime from "./ServerTime.svelte";
  import { setContext } from "svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  let { data } = $props();
  const isDesktop = new MediaQuery("(min-width: 768px)");
  let servers = $derived(data.servers);
  let offset = $state({ hour: 0, minute: 0, type: "hour" });
  let timeCards = $state([]);
  setContext("offset", () => offset);
  // $inspect(offset);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">Servers Time</h1>
  </div>
</header>
<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
  <div class="w-full flex justify-end mb-2">
    <Tabs.Root bind:value={offset.type}>
      <Tabs.List>
        <Tabs.Trigger disabled value="" class="text-lg  font-bold "
          >Adjust :
        </Tabs.Trigger>
        <Tabs.Trigger
          value="hour"
          class="text-lg font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
          >Hours</Tabs.Trigger
        >
        <Tabs.Trigger
          value="minute"
          class="text-lg  font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
          >Minutes</Tabs.Trigger
        >
      </Tabs.List>
    </Tabs.Root>
  </div>
  {#if isDesktop.current}
    <div class="rounded-lg border overflow-hidden">
      <Table.Root class="text-muted-foreground">
        <Table.Header>
          <Table.Row class="bg-accent">
            <Table.Head>Brand</Table.Head>
            <Table.Head>Name</Table.Head>
            <Table.Head class="flex items-center justify-between"
              ><Button
                variant="ghost"
                onclick={() =>
                  offset.type === "hour" ? offset.hour-- : offset.minute--}
                ><Minus class="text-muted-foreground size-7" /></Button
              >Time<Button
                variant="ghost"
                onclick={() =>
                  offset.type === "hour" ? offset.hour++ : offset.minute++}
                ><Plus class="text-muted-foreground size-7" /></Button
              ></Table.Head
            >
            <Table.Head>Date</Table.Head>
            <Table.Head>IP</Table.Head>
            <Table.Head>Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each servers as server, i}
            <Table.Row>
              <Table.Cell>
                {#if server.brand === "oracle"}<Oracle class="size-8" />
                {:else if server.brand === "windows"}<Windows class="size-8" />
                {:else if server.brand === "linux"}<Linux class="size-8" />
                {:else if server.brand === "dell"}<Dell class="size-8" />{/if}
              </Table.Cell>
              <!-- <Table.Cell class="">
            <div
              class=" w-4 h-4 rounded-full"
              class:bg-green-500={server.isAlive}
              class:bg-red-500={!server.isAlive}
            ></div>
          </Table.Cell> -->
              <Table.Cell class="text-master text-lg font-bold">
                {server.name}
              </Table.Cell>
              <ServerTime bind:this={timeCards[i]} {server} />
              <Table.Cell class="text-lg font-bold">
                {server.ip}<Copy value={server.ip} class="ml-1" />
              </Table.Cell>
              <Table.Cell>
                <Button onclick={() => timeCards[i].setTime()}
                  ><Clock class="size-7" /></Button
                >
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  {:else}
    {#each servers as server, i}
      <Card.Root class="p-1 pb-2">
        <Card.Content class="flex flex-col justify-center items-center h-40">
          <div class="text-master text-2xl font-bold w-full text-center">
            {server.name}
          </div>
          <ServerTime bind:this={timeCards[i]} {server} />
          <div class="flex items-center justify-center">
            <Button onclick={() => timeCards[i].setTime()}
              ><Clock class="size-7" /></Button
            >
          </div>
        </Card.Content>
      </Card.Root>
    {/each}
  {/if}
</div>
