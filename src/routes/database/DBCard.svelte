<script>
  import { page } from "$app/state";
  import Copy from "$lib/myComponents/Copy.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import Spinner from "~icons/svg-spinners/bars-scale-fade";
  import { onMount } from "svelte";

  let { db, activeDB = $bindable(), activeDBTab = $bindable() } = $props();
  let serverData = $state({});
  let loading = $state(true);
  onMount(() => {
    fetch(`${page.url.pathname}/api/info`, {
      method: "POST",
      body: JSON.stringify({
        ip: db.ip,
        username: db.dbUser,
        password: db.dbPassword,
        dbName: db.dbName,
        dbPort: db.dbPort,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        serverData = data;
        loading = false;
      });
  });
  // $inspect(serverData);
</script>

<Card.Root
  class={[
    "w-full overflow-hidden py-3  gap-1 bg-card hover:bg-accent hover:cursor-pointer",
    activeDB?.id === db.id && "bg-accent",
  ].join(" ")}
  onclick={() => {
    if (activeDB?.id !== db.id) {
      activeDB = db;
      activeDBTab = db.ip;
    }
  }}
>
  <div
    class="grid grid-cols-[0.3rem_1fr_0.3rem] gap-0 px-1 justify-center items-center"
  >
    <div
      class={[
        "bg-selected rounded transition duration-300 h-full",
        activeDB?.id === db.id && "scale-100",
        activeDB?.id !== db.id && "scale-0",
      ]}
    ></div>
    <div class="">
      <Card.Header class="pl-2 pr-2">
        <Card.Title class=" text-lg flex justify-between items-center"
          ><span class="font-bold text-selected"
            >{db.dbLabel}
          </span>{#if loading}
            <Spinner />{:else}<span
              class="text-muted-foreground text-base py-1 px-2 bg-background border rounded-md"
              >Sessions: {serverData.sessions?.current} ({serverData.sessions
                ?.active}) / {serverData.maxSessions}
            </span>{/if}</Card.Title
        >
      </Card.Header>
      {#if !loading}
        <Card.Content class="flex flex-col font-semibold pl-2 pr-2 gap-2">
          <div class="flex items-center justify-between gap-3">
            <div
              class="flex flex-col text-muted-foreground text-base py-1 px-4 bg-background rounded-md border flex-1"
            >
              <span class="border-b"> SGA</span><span>{serverData.sga} GB</span>
            </div>
            <div
              class="flex flex-col text-muted-foreground text-base py-1 px-4 bg-background rounded-md border flex-1"
            >
              <span class="border-b"> Size</span><span
                >{serverData.size} GB</span
              >
            </div>
          </div>
          <span
            class="text-muted-foreground text-base py-1 px-4 bg-background rounded-md border flex-1"
            >DB Version : {serverData.version}</span
          >
        </Card.Content>
        <!-- <Card.Footer class="flex items-center justify-between text-muted-foreground"
      >DB Version : {serverData.version}</Card.Footer
    > -->
      {/if}
    </div>

    <div
      class={[
        "bg-selected rounded transition duration-300 h-full",
        activeDB?.id === db.id && "scale-100",
        activeDB?.id !== db.id && "scale-0",
      ]}
    ></div>
  </div>
</Card.Root>
