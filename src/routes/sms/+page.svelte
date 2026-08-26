<script>
  import { MediaQuery } from "svelte/reactivity";
  import { page } from "$app/state";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Progress } from "$lib/components/ui/progress/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import {
    Axis,
    BarChart,
    Polygon,
    Text,
    Tooltip,
    Labels,
    Legend,
  } from "layerchart";
  import { scaleSequential } from "d3-scale";
  import Heatmap from "$lib/myComponents/Heatmap.svelte";
  import Spinner from "~icons/svg-spinners/bars-scale-fade";
  import { onMount } from "svelte";
  let { data } = $props();
  let loading = $state(true);
  let SMSs = $state([]);
  // svelte-ignore state_referenced_locally
  let { servers } = data;
  let tab = $state("heatmap");
  const isDesktop = new MediaQuery("(min-width: 768px)");

  const getSMS = async () => {
    // loading = true;
    const response = await fetch(`${page.url.pathname}/api/getSmsHM`, {
      method: "POST",
      body: JSON.stringify({
        ip: servers[0].ip,
        username: servers[0].dbUser,
        password: servers[0].dbPassword,
        dbName: servers[0].dbName,
        dbPort: servers[0].dbPort,
      }),
    });
    const data = await response.json();

    return data.result;
  };
  const getFailedSMS = async () => {
    const response = await fetch(`${page.url.pathname}/api/failed`, {
      method: "POST",
      body: JSON.stringify({
        ip: servers[0].ip,
        username: servers[0].dbUser,
        password: servers[0].dbPassword,
        dbName: servers[0].dbName,
        dbPort: servers[0].dbPort,
      }),
    });
    const data = await response.json();

    return data.result;
  };
  const getData = async () => {
    return await Promise.all([getSMS(), getFailedSMS()]);
  };

  let smsByModule = $derived(
    SMSs[0]?.MODULE?.map((d, i, all) => ({
      label: d.MODULE
        ? d.MODULE?.replace("SMS", "") +
          " - " +
          d.C +
          " - " +
          ((d.C / all.reduce((c, b) => c + b.C, 0)) * 100).toFixed(0) +
          "%"
        : "Direct SMS " +
          " - " +
          d.C +
          " - " +
          ((d.C / all.reduce((c, b) => c + b.C, 0)) * 100).toFixed(0) +
          "%",
      start: all.filter((_, x) => x < i).reduce((c, b) => c + b.C, 0),
      end: all.filter((_, x) => x <= i).reduce((c, b) => c + b.C, 0),
      c: d.C,
    })),
  );
  onMount(async () => {
    SMSs = await getData();
    loading = false;
  });
  // $inspect(SMSs, smsByModule);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">SMS Heatmap and Logs</h1>
    <Tabs.Root class="items-center ml-auto hidden md:flex" bind:value={tab}>
      <Tabs.List>
        <Tabs.Trigger
          value="heatmap"
          class="p-3 text-lg font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
          >Heatmap</Tabs.Trigger
        >
        <Tabs.Trigger
          value="failed"
          class="p-3 text-lg font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
          >Failed SMSs</Tabs.Trigger
        >
      </Tabs.List>
    </Tabs.Root>
  </div>
</header>
{#if loading}
  <div
    class="flex flex-col items-center justify-center font-semibold text-2xl flex-1 text-muted-foreground gap-5"
  >
    <Spinner class="size-10" />
  </div>
{:else}
  <Tabs.Root class="items-center  md:hidden " bind:value={tab}>
    <Tabs.List>
      <Tabs.Trigger
        value="heatmap"
        class="p-3 text-lg font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
        >Heatmap</Tabs.Trigger
      >
      <Tabs.Trigger
        value="failed"
        class="p-3 text-lg font-bold data-[state=active]:bg-background dark:data-[state=active]:bg-background text-muted-foreground data-[state=active]:text-foreground"
        >Failed SMSs</Tabs.Trigger
      >
    </Tabs.List>
  </Tabs.Root>
  <Tabs.Root bind:value={tab} class="p-5">
    <Tabs.Content value="heatmap">
      <div
        class="text-muted-foreground font-bold text-lg border-b-0 border-muted-foreground flex items-center gap-1"
      >
        SMSs by Module
      </div>
      <div class="p-0 md:p-4">
        <BarChart
          data={smsByModule}
          x={["start", "end"]}
          y={(d) => 1}
          xBaseline={null}
          xNice={false}
          axis={false}
          c="label"
          cRange={[
            "var(--color-blue-500)",
            "var(--color-teal-500)",
            "var(--color-pink-500)",
            "var(--color-yellow-500)",
            "var(--color-orange-500)",
            "var(--color-fuchsia-500)",
            "var(--color-red-500)",
            "var(--color-indigo-500)",
          ]}
          bandPadding={0}
          padding={{ top: 22, bottom: 12 }}
          orientation="horizontal"
          props={{
            tooltip: {
              context: { mode: "bounds" },
            },
            bars: {
              class: "stroke-background",
            },
          }}
          height={60}
        >
          <!-- {#snippet aboveMarks()}
            <Labels
              x={(d) => d.end - d.c}
              value="percent"
              class="text-sm fill-surface-300 stroke-none"
            />
          {/snippet} -->
          <!-- {#snippet axis({ context })}
            <Axis
              placement="bottom"
              tickLength={0}
              // ticks={[15, 16, 18.5, 25, 30, 35, 40]}
              ticks={smsByModule.map((d) => d.end)}
            >
              {#snippet tickLabel({ props })}
                <Text
                  {...props}
                  textAnchor={props.value === "40" ? "end" : "start"}
                />
              {/snippet}
            </Axis>
          {/snippet} -->
          {#snippet tooltip({ context })}
            <Tooltip.Root>
              {#snippet children({ data })}
                <Tooltip.List>
                  <Tooltip.Item label="Module:" value={data.label} />
                  <Tooltip.Item label="Count:" value={data.c} />
                </Tooltip.List>
              {/snippet}
            </Tooltip.Root>
          {/snippet}
          {#snippet legend({ context })}
            <Legend
              variant="swatches"
              placement="top-left"
              classes={{
                root: "w-full",
                item: "text-xs",
              }}
            />
          {/snippet}
        </BarChart>
      </div>
      <div
        class="text-muted-foreground font-bold text-lg border-b-0 border-muted-foreground flex items-center gap-1"
      >
        New SMS Method
      </div>
      <div class="flex p-4">
        <Heatmap
          data={SMSs[0].new}
          ranges={[1, 10, 50, 100, 200, 300, 500]}
          dataDirection="vertical"
        />
      </div>

      <div
        class="text-muted-foreground font-bold text-lg border-b-0 border-muted-foreground flex items-center gap-1"
      >
        Old SMS Method
      </div>
      <div class="flex p-4">
        <Heatmap
          data={SMSs[0].old}
          ranges={[1, 10, 50, 100, 200, 300, 500]}
          dataDirection="vertical"
        />
      </div>
    </Tabs.Content>
    <Tabs.Content value="failed">
      {#if SMSs[1]}
        <div
          class="text-muted-foreground font-bold text-lg border-b-0 border-muted-foreground flex items-center gap-1"
        >
          Failed SMSs
        </div>
        <div class="rounded-lg border overflow-hidden">
          <Table.Root>
            <Table.Header>
              <Table.Row class="bg-accent">
                <Table.Head>Patient ID</Table.Head>
                <Table.Head class="text-center">Phone Number</Table.Head>
                <Table.Head class="">Message</Table.Head>
                <Table.Head class="text-center">module</Table.Head>
                <Table.Head class="text-center">Reference ID</Table.Head>
                <Table.Head class="text-center"
                  >Request Status Description</Table.Head
                >
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each SMSs[1] as sms}
                <Table.Row>
                  <Table.Cell class="font-medium">{sms.PATIENT_ID}</Table.Cell>
                  <Table.Cell class="text-center">{sms.PHONE_NUMBER}</Table.Cell
                  >
                  <Table.Cell class="" dir="rtl">{sms.MESSAGE}</Table.Cell>
                  <Table.Cell class="text-center">{sms.MODULE}</Table.Cell>
                  <Table.Cell class="text-center">{sms.REFERENCE_ID}</Table.Cell
                  >
                  <Table.Cell class="text-center">
                    {JSON.parse(sms.REQUEST_STATUS_DESCRIPTION).message}
                  </Table.Cell>
                </Table.Row>
              {:else}
                <Table.Row>
                  <Table.Cell
                    class="text-center text-muted-foreground"
                    colspan="6"
                  >
                    No failed SMSs found.
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      {/if}
    </Tabs.Content>
  </Tabs.Root>
  <!-- <div class="flex flex-col p-4">
    <div
      class="text-muted-foreground font-bold text-lg border-b-0 border-muted-foreground flex items-center gap-1"
    >
      New SMS Method
    </div>
    <div class="flex p-4">
      <Heatmap
        data={data[0].new}
        ranges={[1, 10, 50, 100, 200, 300, 500]}
        dataDirection="vertical"
      />
    </div>

    <div
      class="text-muted-foreground font-bold text-lg border-b-0 border-muted-foreground flex items-center gap-1"
    >
      Old SMS Method
    </div>
    <div class="flex p-4">
      <Heatmap
        data={data[0].old}
        ranges={[1, 10, 50, 100, 200, 300, 500]}
        dataDirection="vertical"
      />
    </div>

    {#if data[1]}
      <div
        class="text-muted-foreground font-bold text-lg border-b-0 border-muted-foreground flex items-center gap-1"
      >
        Failed SMSs
      </div>
      <div class="rounded-lg border overflow-hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row class="bg-accent">
              <Table.Head>Patient ID</Table.Head>
              <Table.Head class="text-center">Phone Number</Table.Head>
              <Table.Head class="text-center">Message</Table.Head>
              <Table.Head class="text-center">module</Table.Head>
              <Table.Head class="text-center">Reference ID</Table.Head>
              <Table.Head class="text-center"
                >Request Status Description</Table.Head
              >
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each data[1] as sms}
              <Table.Row>
                <Table.Cell class="font-medium">{sms.PATIENT_ID}</Table.Cell>
                <Table.Cell class="text-center">{sms.PHONE_NUMBER}</Table.Cell>
                <Table.Cell class="text-center" dir="rtl"
                  >{sms.MESSAGE}</Table.Cell
                >
                <Table.Cell class="text-center">{sms.MODULE}</Table.Cell>
                <Table.Cell class="text-center">{sms.REFERENCE_ID}</Table.Cell>
                <Table.Cell class="text-center">
                  {JSON.parse(sms.REQUEST_STATUS_DESCRIPTION).message}
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    {/if}
  </div> -->
{/if}
