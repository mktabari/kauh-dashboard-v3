<script>
  let {
    data,
    dataDirection = "horizontal",
    ranges,
    class: className,
  } = $props();
  const bgTo = (value) => {
    if (value >= ranges[6]) return "bg-red-400";
    if (value >= ranges[5] && value < ranges[6]) return "bg-orange-400";
    if (value >= ranges[4] && value < ranges[5]) return "bg-indigo-100";
    if (value >= ranges[3] && value < ranges[4]) return "bg-indigo-200";
    if (value >= ranges[2] && value < ranges[3]) return "bg-indigo-400";
    if (value >= ranges[1] && value < ranges[2]) return "bg-indigo-600";
    if (value >= ranges[0] && value < ranges[1]) return "bg-indigo-800";
  };
  // $inspect(data);
</script>

<div class={className}>
  {#if dataDirection === "horizontal"}
    <div class=" grid grid-cols-[6rem_repeat(24,1fr)] md:gap-1 gap-0">
      {#each data as day}
        <div
          class="flex justify-end items-center capitalize pr-1 text-muted-foreground"
        >
          {day.DAY}
        </div>
        {#each Object.keys(day) as element, i}
          {#if i > 1}
            <div
              class={[
                "flex justify-center items-center text-background font-semibold rounded-sm aspect-square",
                bgTo(parseInt(day[element].trim())),
              ]}
            >
              {day[element].trim() !== "0" ? day[element] : ""}
            </div>
          {/if}
        {/each}
      {/each}
      <div class=""></div>
      {#if data}
        {#each Array(24) as _, i}
          <div class="flex justify-center items-center text-muted-foreground">
            {String(i).padStart(2, "0")}
          </div>
        {/each}
      {/if}
    </div>
  {:else}
    <div
      class=" grid md:grid-cols-[6rem_repeat(24,1fr)] grid-cols-[2rem_repeat(24,1fr)] grid-rows-1 md:gap-0.5 gap-0 text-xs"
    >
      {#each data as hour, i}
        {#if i % 24 === 0}
          <div
            class="flex justify-end items-center capitalize pr-1 text-muted-foreground md:p-0.5 p-0"
          >
            {hour.DAY}
          </div>
        {/if}

        <div
          class={[
            "flex justify-center items-center text-background font-semibold md:rounded-sm rounded-xs aspect-square md:p-0.5 p-0",
            bgTo(hour.C),
          ]}
        >
          {hour.C !== 0 ? hour.C : ""}
        </div>
      {/each}
      {#if data}
        <div class=" "></div>
        {#each Array(24) as _, i}
          <div
            class="flex justify-center items-start text-muted-foreground md:p-0.5 p-0"
          >
            {String(i).padStart(2, "0")}
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
