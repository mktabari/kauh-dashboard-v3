<script>
  import { MediaQuery } from "svelte/reactivity";
  import { toast } from "svelte-sonner";
  import * as Table from "$lib/components/ui/table/index.js";
  import { page } from "$app/state";
  import { onMount, onDestroy } from "svelte";
  import { getContext } from "svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import Spinner from "~icons/svg-spinners/bars-scale-fade";
  import Plus from "~icons/mdi/plus-circle";
  import Minus from "~icons/mdi/minus-circle";
  let { server } = $props();
  const isDesktop = new MediaQuery("(min-width: 768px)");
  let loading = $state(true);
  let error = $state("");
  let sDate = $state(null);
  let localHourOffset = $state(0);
  let localMinuteOffset = $state(0);
  let offset = getContext("offset");
  let hourOffset = $derived(offset().hour + localHourOffset);
  let minuteOffset = $derived(offset().minute + localMinuteOffset);
  let secondOffset = $state(0);
  let newDate = $derived(
    sDate
      ? new Date(
          sDate.getTime() +
            hourOffset * 3600000 +
            minuteOffset * 60000 +
            secondOffset * 1000,
        )
      : null,
  );

  let intervalId;

  onMount(async () => {
    const response = await fetch(`${page.url.pathname}/api/getTime`, {
      method: "POST",
      body: JSON.stringify({
        ip: server.ip,
        brand: server.brand,
        username: server.username,
        password: server.password,
      }),
    });
    const data = await response.json();

    if (data.result === "error") {
      error = "Error fetching time";
      loading = false;
      return;
    }
    sDate = new Date(
      data.result.split(" ")[0].split("/").reverse().join("-") +
        "T" +
        data.result.split(" ")[1],
    );

    intervalId = setInterval(() => {
      secondOffset++;
    }, 1000);

    loading = false;
  });

  export const setTime = async () => {
    const response = await fetch(`${page.url.pathname}/api/setTime`, {
      method: "POST",
      body: JSON.stringify({
        ip: server.ip,
        brand: server.brand,
        username: server.username,
        password: server.password,
        dateTime: [
          (newDate.getMonth() + 1).toString().padStart(2, "0"),
          newDate.getDate().toString().padStart(2, "0"),
          newDate
            .toLocaleString("en-US", { hour: "numeric", hour12: false })
            .toString()
            .padStart(2, "0"),
          newDate
            .toLocaleString("en-US", { minute: "numeric" })
            .toString()
            .padStart(2, "0"),
        ].join(""),
      }),
    });
    const data = await response.json();

    if (data.result === "error") {
      error = "Error setting time";
      toast.error(server.name + " Time set was unsuccessful", {
        duration: 10000,
        // theme: "light",
      });
      loading = false;
      return;
    }
    toast.success(
      server.name + " Time set successfully. New Time: " + data.result,
      {
        duration: 10000,
        // theme: "light",
      },
    );
  };
  onDestroy(() => {
    clearInterval(intervalId);
  });
</script>

{#if isDesktop.current}
  {#if loading}
    <Table.Cell colspan="2" class="hidden md:table-cell"
      ><div class="md:flex text-xl justify-center hidden">
        <Spinner class="size-10" />
      </div>
    </Table.Cell>
  {:else if error}
    <Table.Cell colspan="2" class="font-digital font-bold text-xl "
      >{error}</Table.Cell
    >
  {:else}
    <Table.Cell class="font-digital text-4xl items-center justify-between flex">
      <Button
        variant="ghost"
        onclick={() =>
          offset().type === "hour" ? localHourOffset-- : localMinuteOffset--}
        ><Minus class="text-muted-foreground size-7" /></Button
      ><span
        >{newDate
          .toLocaleString("en-US", { hour: "numeric", hour12: false })
          .padStart(2, "0")}<span class="animate-caret-blink">:</span>{newDate
          .toLocaleString("en-US", { minute: "numeric" })
          .padStart(2, "0")}<span class="animate-caret-blink">:</span>{newDate
          .toLocaleString("en-US", { second: "numeric" })
          .padStart(2, "0")}</span
      ><Button
        variant="ghost"
        onclick={() =>
          offset().type === "hour" ? localHourOffset++ : localMinuteOffset++}
        ><Plus class="text-muted-foreground size-7" /></Button
      >
    </Table.Cell>
    <Table.Cell class="font-digital text-4xl ">
      {newDate.getDate().toString().padStart(2, "0")}/{(newDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/{newDate.getFullYear()}</Table.Cell
    >
  {/if}
{:else if loading}
  <div class="flex flex-1 items-center justify-center">
    <Spinner />
  </div>
{:else if error}
  <span>
    {error}
  </span>
{:else}
  <div class="flex-1 grid grid-cols-3">
    <Button
      variant="ghost"
      class="w-full h-full flex items-center justify-start"
      onclick={() =>
        offset().type === "hour" ? localHourOffset-- : localMinuteOffset--}
      ><Minus class="text-muted-foreground size-7" /></Button
    >
    <div>
      <div class="flex justify-center items-center">
        <span class="font-digital text-4xl"
          >{newDate
            .toLocaleString("en-US", { hour: "numeric", hour12: false })
            .padStart(2, "0")}<span class="animate-caret-blink">:</span>{newDate
            .toLocaleString("en-US", { minute: "numeric" })
            .padStart(2, "0")}<span class="animate-caret-blink">:</span>{newDate
            .toLocaleString("en-US", { second: "numeric" })
            .padStart(2, "0")}</span
        >
      </div>
      <div class="flex justify-center items-center font-digital text-4xl">
        {newDate.getDate().toString().padStart(2, "0")}/{(
          newDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/{newDate.getFullYear()}
      </div>
    </div>
    <Button
      variant="ghost"
      class="w-full h-full flex items-center justify-end"
      onclick={() =>
        offset().type === "hour" ? localHourOffset++ : localMinuteOffset++}
      ><Plus class="text-muted-foreground size-7" /></Button
    >
  </div>
{/if}
