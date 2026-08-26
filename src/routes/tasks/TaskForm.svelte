<script>
  import cronstrue from "cronstrue";
  import cron from "cron-validate";
  import Copy from "$lib/myComponents/Copy.svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import * as Select from "$lib/components/ui/select/index.js";

  let { task: taskData, class: className, DBs } = $props();

  $effect(() => {
    taskData.schedule = `${taskData.scheduleMinute} ${taskData.scheduleHour} ${taskData.scheduleDayOfMonth} ${taskData.scheduleMonth} ${taskData.scheduleDayOfWeek}`;
  });
</script>

{#if taskData?.id}
  <input type="hidden" name="id" value={taskData.id} />
{/if}
<input type="hidden" name="schedule" value={taskData.schedule} />
<input type="hidden" name="status" value={taskData.status} />
<div class={className}>
  <div class="hidden md:block"></div>
  <div>
    <div class="border-b-2 border-primary font-semibold">Task Details</div>
    <Field.Group class="my-2 flex flex-col gap-2 p-2">
      <Field.Field>
        <Field.Label class="col-span-3" for="taskName">Name</Field.Label>

        <Input
          id="taskName"
          name="taskName"
          bind:value={taskData.taskName}
          required
        />
      </Field.Field>
      <Field.Field>
        <Field.Label>schedule</Field.Label>
        <span
          aria-invalid={!cron(
            `${taskData.scheduleMinute} ${taskData.scheduleHour} ${taskData.scheduleDayOfMonth} ${taskData.scheduleMonth} ${taskData.scheduleDayOfWeek}`,
          ).isValid()}
          class="dark:bg-input/30 min-h-8 aria-invalid:text-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors aria-invalid:ring-3 md:text-sm w-full min-w-0 outline-none"
          >{#if cron(`${taskData.scheduleMinute} ${taskData.scheduleHour} ${taskData.scheduleDayOfMonth} ${taskData.scheduleMonth} ${taskData.scheduleDayOfWeek}`).isValid()}
            {cronstrue.toString(
              `${taskData.scheduleMinute} ${taskData.scheduleHour} ${taskData.scheduleDayOfMonth} ${taskData.scheduleMonth} ${taskData.scheduleDayOfWeek}`,
            )}
          {:else}
            Invalid Expression
          {/if}
        </span>
      </Field.Field>
      <Field.Field class="grid grid-cols-3 gap-2">
        <Field.Label class="col-span-3" for="scheduleMinute">Minute</Field.Label
        >
        <Input
          class="text-center"
          aria-invalid={!cron(`${taskData.scheduleMinute} * * * *`).isValid()}
          id="scheduleMinute"
          name="scheduleMinute"
          bind:value={taskData.scheduleMinute}
          required
        />
        <span
          class=" text-sm col-span-2 flex items-end"
          class:text-destructive={!cron(
            `${taskData.scheduleMinute} * * * *`,
          ).isValid()}
        >
          {#if cron(`${taskData.scheduleMinute} * * * *`).isValid()}
            {cronstrue.toString(`${taskData.scheduleMinute} * * * *`)}
          {:else}
            invalid expression
          {/if}
        </span>
      </Field.Field>
      <Field.Field class="grid grid-cols-3 gap-2">
        <Field.Label class="col-span-3" for="scheduleHour">Hour</Field.Label>
        <Input
          class="text-center"
          aria-invalid={!cron(`* ${taskData.scheduleHour} * * *`).isValid()}
          id="scheduleHour"
          name="scheduleHour"
          bind:value={taskData.scheduleHour}
          required
        />
        <span
          class=" text-sm col-span-2 flex items-end"
          class:text-destructive={!cron(
            `* ${taskData.scheduleHour} * * *`,
          ).isValid()}
        >
          {#if cron(`* ${taskData.scheduleHour} * * *`).isValid()}
            {#if taskData.scheduleHour === "*"}
              Every hour
            {:else}
              {cronstrue
                .toString(`* ${taskData.scheduleHour} * * *`)
                .replace("minute,", "hour")
                .replace(" hour every ", " ")}
            {/if}
          {:else}
            invalid expression
          {/if}
        </span>
      </Field.Field>
      <Field.Field class="grid grid-cols-3 gap-2">
        <Field.Label class="col-span-3" for="scheduleDayOfMonth"
          >Day Of Month</Field.Label
        >
        <Input
          class="text-center"
          aria-invalid={!cron(
            `* * ${taskData.scheduleDayOfMonth} * *`,
          ).isValid()}
          id="scheduleDayOfMonth"
          name="scheduleDayOfMonth"
          bind:value={taskData.scheduleDayOfMonth}
          required
        />
        <span
          class="text-sm col-span-2 flex items-end"
          class:text-destructive={!cron(
            `* * ${taskData.scheduleDayOfMonth} * *`,
          ).isValid()}
          >{#if cron(`* * ${taskData.scheduleDayOfMonth} * *`).isValid()}
            {#if taskData.scheduleDayOfMonth === "*"}
              Every day of the month
            {:else}
              {cronstrue
                .toString(`* * ${taskData.scheduleDayOfMonth} * *`)
                .replace(" minute, on", "")
                .replace(" minute,", " day")}
            {/if}
          {:else}
            invalid expression
          {/if}
        </span>
      </Field.Field>
      <Field.Field class="grid grid-cols-3 gap-2">
        <Field.Label class="col-span-3" for="scheduleMonth">Month</Field.Label>
        <Input
          class="text-center"
          aria-invalid={!cron(`* * * ${taskData.scheduleMonth} *`).isValid()}
          id="scheduleMonth"
          name="scheduleMonth"
          bind:value={taskData.scheduleMonth}
          required
        />
        <span
          class="text-sm col-span-2 flex items-end"
          class:text-destructive={!cron(
            `* * * ${taskData.scheduleMonth} *`,
          ).isValid()}
          >{#if cron(`* * * ${taskData.scheduleMonth} *`).isValid()}
            {#if taskData.scheduleMonth === "*"}
              every month
            {:else}
              {cronstrue
                .toString(`* * * ${taskData.scheduleMonth} *`)
                .replace("minute, only in ", "")
                .replace("minute, ", "")}
            {/if}
          {:else}
            invalid expression
          {/if}
        </span>
      </Field.Field>
      <Field.Field class="grid grid-cols-3 gap-2">
        <Field.Label class="col-span-3" for="scheduleDayOfWeek"
          >Day Of Week</Field.Label
        >
        <Input
          class="text-center"
          aria-invalid={!cron(
            `* * * * ${taskData.scheduleDayOfWeek}`,
          ).isValid()}
          id="scheduleDayOfWeek"
          name="scheduleDayOfWeek"
          bind:value={taskData.scheduleDayOfWeek}
          required
        />
        <span
          class=" text-sm col-span-2 flex items-end"
          class:text-destructive={!cron(
            `* * * * ${taskData.scheduleDayOfWeek}`,
          ).isValid()}
          >{#if cron(`* * * * ${taskData.scheduleDayOfWeek}`).isValid()}
            {#if taskData.scheduleDayOfWeek === "*"}
              every day of the week
            {:else}
              {cronstrue
                .toString(`* * * * ${taskData.scheduleDayOfWeek}`)
                .replace("minute, only on ", "")
                .replace("minute, ", "")}
            {/if}
          {:else}
            invalid expression
          {/if}
        </span>
      </Field.Field>
      <Field.Field>
        <Field.Label for="sql">Server</Field.Label>
        <Select.Root
          type="single"
          bind:value={taskData.serverId}
          name="serverId"
        >
          <Select.Trigger class="">
            {taskData.serverId
              ? DBs.filter((db) => db.id === taskData.serverId).map(
                  (db) => db.name,
                )
              : "Select Server"}
          </Select.Trigger>
          <Select.Content>
            {#each DBs as db}
              <Select.Item value={db.id}>{db.name}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </Field.Field>
      <Field.Field class="grid grid-cols-3 gap-2">
        <Field.Label class="col-span-3" for="scheduleDayOfWeek"
          >Task Type</Field.Label
        >
        <RadioGroup.Root
          bind:value={taskData.taskType}
          class="flex gap-2 col-span-3"
          name="taskType"
          required
        >
          <Field.Label
            class=" max-w-30 bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
          >
            <Field.Field>
              <Field.Content class="">
                <Field.Title class="w-full flex items-center justify-center"
                  >SQL</Field.Title
                >
              </Field.Content>
              <RadioGroup.Item value="sql" id="sql" class="hidden" />
            </Field.Field>
          </Field.Label>
          <Field.Label
            class=" max-w-30 bg-secondary text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
          >
            <Field.Field>
              <Field.Content class="">
                <Field.Title class="w-full flex items-center justify-center"
                  >API</Field.Title
                >
              </Field.Content>
              <RadioGroup.Item value="api" id="api" class="hidden" />
            </Field.Field>
          </Field.Label>
        </RadioGroup.Root>
      </Field.Field>
      <Field.Field>
        <Field.Label for="sql">Sql</Field.Label>
        <textarea
          id="sql"
          name="sql"
          disabled={taskData.taskType !== "sql"}
          bind:value={taskData.sql}
          class="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-20 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors focus-visible:ring-3 aria-invalid:ring-3 md:text-sm placeholder:text-muted-foreground w-full min-w-0 outline-none"
        ></textarea>
      </Field.Field>
      <Field.Field>
        <Field.Label for="api">Api</Field.Label>
        <Input
          class=""
          id="api"
          name="api"
          bind:value={taskData.api}
          disabled={taskData.taskType !== "api"}
        />
      </Field.Field>
    </Field.Group>
  </div>
</div>
