<script>
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import WLserverCard from "./WLserverCard.svelte";
  import * as InputGroup from "$lib/components/ui/input-group/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import Search from "~icons/mdi/search";
  import { flip } from "svelte/animate";
  let { data } = $props();
  // svelte-ignore state_referenced_locally
  let serverName = $state("");
  let serverType = $state("FR");
  let WLS = $state([]);
  let ContainerWidth = $state(0);
  let cols = $derived(Math.floor(ContainerWidth / 400));
  let colsWithGap = $derived(
    Math.max(
      cols * 400 + 12 * (cols - 1) > ContainerWidth - 15 ? cols - 1 : cols,
      1,
    ),
  );
  // let ContainerHeight = $state(0);
  const sortWLS = () => {
    WLS.sort((a, b) => (a.name > b.name ? -1 : 1)).sort(
      (a, b) => b.metrics - a.metrics,
    );
  };
  $effect(() => {
    WLS = data.WLS.filter(
      (server) =>
        server.name.toUpperCase().includes(serverName.toUpperCase()) &&
        (server.tags.find(
          (tag) => tag.name.includes("FR") && serverType === "FR",
        ) ||
          (!server.tags.find((tag) => tag.name.includes("FR")) &&
            serverType !== "FR")),
    );
  });

  // $inspect(
  //   ContainerWidth,
  //   cols * 400 + 12 * (cols - 1),
  //   ContainerWidth - 15,
  //   cols,
  //   colsWithGap,
  // );
  // $inspect(WLS);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">App Servers</h1>
    <div class="ml-auto">
      <Field.Set class="m-1 w-70 hidden md:block">
        <RadioGroup.Root
          bind:value={serverType}
          class="flex gap-2 items-center"
        >
          <Field.Label
            class="w-40 bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
          >
            <Field.Field>
              <Field.Content class="">
                <Field.Title class="w-full flex items-center justify-center"
                  >Forms & Reports</Field.Title
                >
              </Field.Content>
              <RadioGroup.Item value="FR" id="FR" class="hidden" />
            </Field.Field>
          </Field.Label>
          <Field.Label
            class="  bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
          >
            <Field.Field>
              <Field.Content class="">
                <Field.Title class="w-full flex items-center justify-center"
                  >Three Tier</Field.Title
                >
              </Field.Content>
              <RadioGroup.Item value="3Tier" id="3Tier" class="hidden" />
            </Field.Field>
          </Field.Label>
        </RadioGroup.Root>
      </Field.Set>
    </div>
    <div class="">
      <InputGroup.Root>
        <InputGroup.Input
          class="w-28 md:w-40"
          placeholder="filter by server name"
          bind:value={serverName}
        />
        <InputGroup.Addon>
          <Search />
        </InputGroup.Addon>
        <InputGroup.Addon align="inline-end">
          <!-- {serverName
            ? "results " +
              WLS?.filter((item) =>
                item.name.toUpperCase().includes(serverName.toUpperCase()),
              ).length
            : ""} -->
          <InputGroup.Button
            class="w-full"
            onclick={() => {
              serverName = "";
            }}
          >
            <span class="text-secondary-foreground">clear</span>
          </InputGroup.Button>
        </InputGroup.Addon>
      </InputGroup.Root>
    </div>
  </div>
</header>
<div class=" p-0 md:px-4 h-[calc(100vh-6rem)] overflow-hidden">
  <Field.Set class="m-1 w-70  md:hidden">
    <RadioGroup.Root bind:value={serverType} class="flex gap-2 items-center">
      <Field.Label
        class="w-40 bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
      >
        <Field.Field>
          <Field.Content class="">
            <Field.Title class="w-full flex items-center justify-center"
              >Forms & Reports</Field.Title
            >
          </Field.Content>
          <RadioGroup.Item value="FR" id="FR" class="hidden" />
        </Field.Field>
      </Field.Label>
      <Field.Label
        class="  bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
      >
        <Field.Field>
          <Field.Content class="">
            <Field.Title class="w-full flex items-center justify-center"
              >Three Tier</Field.Title
            >
          </Field.Content>
          <RadioGroup.Item value="3Tier" id="3Tier" class="hidden" />
        </Field.Field>
      </Field.Label>
    </RadioGroup.Root>
  </Field.Set>
  <div
    bind:clientWidth={ContainerWidth}
    class="md:h-[calc(100vh-6rem)] h-[calc(100vh-9rem)] w-full overflow-y-auto"
  >
    <div style="columns:{colsWithGap};" class="md:w-fit space-y-3">
      {#key WLS}
        {#each WLS as server, i (server.id)}
          <!-- <div animate:flip={{ duration: 200, delay: 300 }}> -->
          <div animate:flip={{ duration: 500, delay: 100 }}>
            <WLserverCard bind:server={WLS[i]} {sortWLS} />
          </div>
        {/each}
      {/key}
    </div>
  </div>
</div>
