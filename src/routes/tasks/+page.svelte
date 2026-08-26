<script>
  import { CronExpressionParser } from "cron-parser";
  import cronstrue from "cronstrue";
  import cron from "cron-validate";
  import { PUBLIC_VAPID_KEY } from "$env/static/public";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { MediaQuery } from "svelte/reactivity";
  import { twMerge } from "tailwind-merge";
  import { toast } from "svelte-sonner";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import Plus from "~icons/mdi/plus";
  import Gear from "~icons/mdi/gear-outline";
  import Subscribed from "~icons/fluent-mdl2/subscribe";
  import Unsubscribed from "~icons/fluent-mdl2/unsubscribe";
  import TaskForm from "./TaskForm.svelte";

  const isDesktop = new MediaQuery("(min-width: 768px)");
  let { data, form } = $props();

  let cronTasks = $state(data.cronTasks);
  let DBs = $state(data.DBs);
  let taskSubscriptions = $state(data.taskSubscriptions);
  let loading = $state(false);
  let sheetIsOpen = $state(false);
  let isSubscribed = $state(false);
  let permission = $state("denied");
  let registration = $state(null);
  let subscription = $state(null);
  let subscriptionId = $state(false);
  let deleteTaskSwitch = $state(false);
  let newTask = $state({
    id: "",
    taskName: "",
    scheduleMinute: "*",
    scheduleHour: "*",
    scheduleDayOfMonth: "*",
    scheduleMonth: "*",
    scheduleDayOfWeek: "*",
    schedule: "* * * * *",
    status: "inactive",
    taskType: "",
    serverId: "",
    api: "",
    sql: "",
  });
  let expression = $derived(
    `${newTask.scheduleMinute} ${newTask.scheduleHour} ${newTask.scheduleDayOfMonth} ${newTask.scheduleMonth} ${newTask.scheduleDayOfWeek}`,
  );
  const disableNotifications = async () => {
    if (registration) {
      taskSubscriptions = [
        ...taskSubscriptions.filter(
          (sub) => sub.subscriptionId !== subscriptionId,
        ),
      ];
      await registration.pushManager
        .getSubscription()
        .then(async (subscription) => {
          if (subscription) {
            subscription.unsubscribe();
            await fetch(`${page.url.pathname}/api/deleteSubscription`, {
              method: "POST",
              body: JSON.stringify(subscription),
              headers: { "Content-Type": "application/json" },
            });
          }
        });

      isSubscribed = false;
      subscriptionId = null;
      subscription = null;
    } else {
      toast.error("Service worker not registered.");
    }
  };
  const enableNotifications = async () => {
    if (registration) {
      permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission denied.");
        return;
      }
      await registration.pushManager
        .getSubscription()
        .then(async (subscription) => {
          if (!subscription) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: PUBLIC_VAPID_KEY,
            });
            fetch(`${page.url.pathname}/api/saveSubscription`, {
              method: "POST",
              body: JSON.stringify(subscription),
              headers: { "Content-Type": "application/json" },
            })
              .then((response) => response.json())
              .then((data) => {
                subscriptionId = data.id;
              });
          }
        });

      isSubscribed = true;
    } else {
      toast.error("Service worker not registered.");
    }
  };

  onMount(async () => {
    if (form?.message) {
      toast.success(form.message);
    }
    if (form?.error) {
      toast.error(form.error);
    }
    permission = await Notification.permission;
    registration = await navigator.serviceWorker.ready;
    subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      isSubscribed = true;
      fetch(`${page.url.pathname}/api/getSubsicrptionId`, {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data) => {
          subscriptionId = data.id;
          console.log(data);
        });
    }
  });
  // $effect(() => {
  //   if (form?.message) {
  //     toast.success(form.message);
  //   }
  //   if (form?.error) {
  //     toast.error(form.error);
  //   }
  // });
  // $inspect(taskSubscriptions);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">Scheduled Tasks</h1>
  </div>
</header>
<div class="flex flex-col gap-4 p-4 pt-0 h-[calc(100vh-5rem)]">
  <div class="grid grid-cols-[auto_1fr_auto] gap-4">
    {#if isSubscribed}
      <div class="flex items-center">
        Push Notifications :<Badge
          variant="secondary"
          class="bg-green-500 text-white dark:bg-green-600 text-sm ml-1 py-3"
          >Enabled</Badge
        >
      </div>
      <div class="flex items-center">
        <Separator orientation="horizontal" class="h-4" />
      </div>
      <Button onclick={disableNotifications}>Disable</Button>
    {:else}
      <div class="flex items-center">
        Push Notifications :<Badge variant="destructive" class="text-base"
          >Disable</Badge
        >
      </div>
      <div class="flex items-center">
        <Separator orientation="horizontal" class="h-4" />
      </div>
      <Button onclick={enableNotifications}>Enable</Button>
    {/if}
  </div>
  <!-- class={twMerge(buttonVariants({ variant: "default" }, "max-w-20"))} -->
  <div class="flex items-center gap-2 px-4 w-full">
    <Sheet.Root bind:open={sheetIsOpen}>
      <Sheet.Trigger
        class={twMerge(buttonVariants({ variant: "default" }), "max-w-30")}
        ><Plus class="size-6" />New Task
      </Sheet.Trigger>
      <Sheet.Content side="right" class=" overflow-auto sm:max-w-100 w-full">
        <Sheet.Header>
          <Sheet.Title>Add Server Task</Sheet.Title>
          <Sheet.Description></Sheet.Description>
        </Sheet.Header>
        <form method="POST">
          <TaskForm bind:task={newTask} {DBs} class="px-4" />
          <Sheet.Footer>
            <Button
              disabled={!cron(expression).isValid() ||
                !newTask.taskName ||
                !newTask.taskType ||
                (!newTask.sql && newTask.taskType === "sql") ||
                (!newTask.api && newTask.taskType === "api") ||
                !newTask.serverId}
              type="submit"
              formaction="?/addTask">Add Task</Button
            >
            <Sheet.Close
              onclick={(e) => {
                e.preventDefault();
                sheetIsOpen = false;
              }}
              class={buttonVariants({ variant: "outline" })}
            >
              Close
            </Sheet.Close>
          </Sheet.Footer>
        </form>
      </Sheet.Content>
    </Sheet.Root>
    <div class="ml-auto text-sm">SQL Tasks</div>
    <div class="md:w-20 w-5 h-5 md:h-3 rounded bg-red-500"></div>
    <div class="text-sm">API Tasks</div>
    <div class="md:w-20 w-5 h-5 md:h-3 rounded bg-fuchsia-500"></div>
  </div>
  <div
    class="md:border md:rounded-lg w-full max-h-[calc(100vh-9rem)] overflow-auto bg-red-5001"
  >
    <Table.Root class="table-auto">
      <Table.Header
        ><Table.Row class="border-none hidden md:table-row">
          <Table.Head class="  uppercase " colspan="5"></Table.Head>
          <Table.Head colspan="5" class="  uppercase  px-1"
            ><div
              class="border-b border-foreground h-full flex items-center justify-center uppercase"
            >
              Schedule
            </div></Table.Head
          >
          <Table.Head colspan="7" class="  uppercase  px-1"></Table.Head>
        </Table.Row></Table.Header
      >
      <Table.Header>
        <Table.Row class="hidden md:table-row">
          <Table.Head class="text-center uppercase"></Table.Head>
          <Table.Head class="text-center uppercase">Sub</Table.Head>
          <Table.Head class="text-center uppercase">Task Name</Table.Head>
          <Table.Head class="text-center uppercase">Status</Table.Head>
          <Table.Head class="text-center uppercase">Server</Table.Head>
          <Table.Head class="text-center uppercase ">M</Table.Head>
          <Table.Head class="text-center uppercase">H</Table.Head>
          <Table.Head class="text-center uppercase">M/D</Table.Head>
          <Table.Head class="text-center uppercase ">MON</Table.Head>
          <Table.Head class="text-center uppercase">W/D</Table.Head>
          <Table.Head class="uppercase ">Schedule</Table.Head>
          <Table.Head class="uppercase ">SQL/API</Table.Head>
          <Table.Head class="text-center uppercase">last Run</Table.Head>
          <Table.Head class="text-center uppercase">Next Run</Table.Head>
          <Table.Head class="text-center uppercase">Created At</Table.Head>
          <Table.Head class="text-center uppercase">Updated At</Table.Head>
          <Table.Head class="text-center uppercase">actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if loading}
          <Table.Row>
            <Table.Cell colspan={isDesktop.current ? "17" : "7"} class=" ">
              <div class="w-full flex items-center justify-center py-10">
                <Spinner class="h-8 w-8" />
              </div>
            </Table.Cell>
          </Table.Row>
        {/if}

        {#each cronTasks as job, i}
          {@const scheduleSplit = job.schedule.split(" ")}
          <Table.Row class="md:hidden table-row border-b-0 md:border-b ">
            <Table.Cell class=" text-center font-bold ">
              <div
                class="grid grid-cols-[auto_1fr_1fr] gap-2 border rounded-lg p-3"
              >
                <div class="text-pretty font-bold col-span-2 text-left">
                  {job.taskName}
                </div>
                <div class="flex justify-end col-span-1">
                  {#if job.status === "active"}
                    {new Date(
                      CronExpressionParser.parse(job.schedule).next(),
                    ).toLocaleString("en-GB", {
                      hour: "numeric",
                      minute: "numeric",
                      month: "numeric",
                      day: "numeric",
                    })}
                  {/if}
                  <div
                    class="ml-auto size-5 rounded {job.taskType === 'sql'
                      ? 'bg-red-500'
                      : 'bg-fuchsia-500'}"
                  ></div>
                </div>
                <div class="flex justify-start items-center row-span-2">
                  <Switch
                    disabled={!isSubscribed}
                    class="data-[state=checked]:bg-green-500 "
                    checked={taskSubscriptions.find(
                      (sub) =>
                        sub.taskId === job.id &&
                        sub.subscriptionId === subscriptionId,
                    )?.id}
                    onCheckedChange={(cheched) => {
                      if (cheched) {
                        fetch(`${page.url.pathname}/api/saveTaskSubscription`, {
                          method: "POST",
                          body: JSON.stringify({
                            taskId: job.id,
                            subscriptionId: subscriptionId,
                          }),
                          headers: { "Content-Type": "application/json" },
                        })
                          .then((response) => response.json())
                          .then((data) => {
                            taskSubscriptions.push({
                              id: data.id,
                              taskId: job.id,
                              subscriptionId: subscriptionId,
                            });
                          });
                      } else {
                        let id = taskSubscriptions.find(
                          (sub) =>
                            sub.taskId === job.id &&
                            sub.subscriptionId === subscriptionId,
                        )?.id;
                        fetch(
                          `${page.url.pathname}/api/deleteTaskSubscription`,
                          {
                            method: "POST",
                            body: JSON.stringify({
                              id,
                            }),
                            headers: { "Content-Type": "application/json" },
                          },
                        )
                          .then((response) => response.json())
                          .then((data) => {
                            taskSubscriptions = taskSubscriptions.filter(
                              (sub) => sub.id !== id,
                            );
                          });
                      }
                    }}
                  />
                </div>
                <div class="flex justify-center items-center">
                  <Badge
                    variant="secondary"
                    class="{job.status === 'active'
                      ? 'bg-green-500 dark:bg-green-600 text-white'
                      : 'bg-yellow-300 dark:bg-yellow-300 dark:text-background text-black'}  py-3 text-sm uppercase"
                  >
                    {job.status}</Badge
                  >
                </div>
                <div class="text-right text-pretty font-bold">
                  {cronstrue.toString(job.schedule)}
                </div>

                <div class="flex justify-center items-center">
                  <Badge
                    variant="secondary"
                    class="bg-blue-500 text-white dark:bg-blue-600 py-3 text-sm"
                    >{DBs.filter((db) => db.id === job.serverId).map(
                      (db) => db.name,
                    )}</Badge
                  >
                </div>
                <div class="flex justify-end items-center">
                  <Dialog.Root>
                    <Dialog.Trigger
                      class={buttonVariants({ variant: "default" })}
                      ><Gear class="size-5" /></Dialog.Trigger
                    >
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>Task Job Actions</Dialog.Title>
                        <!-- <Dialog.Description>Description</Dialog.Description> -->
                        <div class="grid grid-cols-2 gap-5 mt-5">
                          {#if job.status === "active"}
                            <Label>Active Task</Label>
                            <form method="POST">
                              <input type="hidden" name="id" value={job.id} />
                              <input
                                type="hidden"
                                name="taskName"
                                value={job.taskName}
                              />
                              <Button
                                type="submit"
                                formaction="?/deactivateTask"
                                class="bg-yellow-300 dark:text-background text-black translate-x-[40%] w-[60%]"
                                >Deactivate</Button
                              >
                            </form>
                          {:else if job.status === "inactive"}
                            <Label>Task is not active</Label>
                            <form method="POST">
                              <input type="hidden" name="id" value={job.id} />
                              <input
                                type="hidden"
                                name="taskName"
                                value={job.taskName}
                              />
                              <Button
                                type="submit"
                                class="translate-x-[50%] w-[50%]"
                                formaction="?/activateTask"
                                variant="default">Activate</Button
                              >
                            </form>
                            <div class="flex items-center gap-2">
                              <Label for="deleteTaskSwitch"
                                >Enable Task Deletion</Label
                              >
                              <Switch
                                id="deleteTaskSwitch"
                                bind:checked={deleteTaskSwitch}
                              />
                            </div>
                            <form method="POST">
                              <input type="hidden" name="id" value={job.id} />
                              <input
                                type="hidden"
                                name="taskName"
                                value={job.taskName}
                              />
                              <Button
                                type="submit"
                                class="translate-x-[50%] w-[50%]"
                                formaction="?/deleteTask"
                                disabled={!deleteTaskSwitch}
                                variant="destructive">Delete</Button
                              >
                            </form>
                          {/if}
                        </div>
                      </Dialog.Header>
                      <Dialog.Footer class="sm:justify-start">
                        <Dialog.Close
                          class={buttonVariants({ variant: "secondary" })}
                          >Close</Dialog.Close
                        >
                      </Dialog.Footer>
                    </Dialog.Content>
                  </Dialog.Root>
                </div>
              </div>
            </Table.Cell>
          </Table.Row>
          <Table.Row class="hidden md:table-row">
            <Table.Cell class="relative text-center font-bold ">
              <div
                class="absolute left-0 top-0 bottom-0 w-2 {job.taskType ===
                'sql'
                  ? 'bg-red-500'
                  : 'bg-fuchsia-500'}"
              ></div></Table.Cell
            >
            <Table.Cell class=" text-center font-bold ">
              <Switch
                disabled={!isSubscribed}
                class="data-[state=checked]:bg-green-500"
                checked={taskSubscriptions.find(
                  (sub) =>
                    sub.taskId === job.id &&
                    sub.subscriptionId === subscriptionId,
                )?.id}
                onCheckedChange={(cheched) => {
                  if (cheched) {
                    fetch(`${page.url.pathname}/api/saveTaskSubscription`, {
                      method: "POST",
                      body: JSON.stringify({
                        taskId: job.id,
                        subscriptionId: subscriptionId,
                      }),
                      headers: { "Content-Type": "application/json" },
                    })
                      .then((response) => response.json())
                      .then((data) => {
                        taskSubscriptions.push({
                          id: data.id,
                          taskId: job.id,
                          subscriptionId: subscriptionId,
                        });
                      });
                  } else {
                    let id = taskSubscriptions.find(
                      (sub) =>
                        sub.taskId === job.id &&
                        sub.subscriptionId === subscriptionId,
                    )?.id;
                    fetch(`${page.url.pathname}/api/deleteTaskSubscription`, {
                      method: "POST",
                      body: JSON.stringify({
                        id,
                      }),
                      headers: { "Content-Type": "application/json" },
                    })
                      .then((response) => response.json())
                      .then((data) => {
                        taskSubscriptions = taskSubscriptions.filter(
                          (sub) => sub.id !== id,
                        );
                      });
                  }
                }}
              />
            </Table.Cell>
            <Table.Cell class=" font-bold">
              {job.taskName}
            </Table.Cell>
            <Table.Cell class="text-center">
              <Badge
                variant="secondary"
                class="{job.status === 'active'
                  ? 'bg-green-500 dark:bg-green-600 text-white'
                  : 'bg-yellow-300 dark:bg-yellow-300 dark:text-background text-black'}  py-3 text-sm uppercase"
              >
                {job.status}</Badge
              >
            </Table.Cell>
            <Table.Cell class="text-center"
              ><Badge
                variant="secondary"
                class="bg-blue-500 text-white dark:bg-blue-600 py-3 text-sm"
                >{DBs.filter((db) => db.id === job.serverId).map(
                  (db) => db.name,
                )}</Badge
              ></Table.Cell
            >
            <Table.Cell class="text-center">
              {scheduleSplit[0]}
            </Table.Cell>
            <Table.Cell class="text-center">
              {scheduleSplit[1]}
            </Table.Cell>
            <Table.Cell class="text-center">
              {scheduleSplit[2]}
            </Table.Cell>
            <Table.Cell class="text-center">
              {scheduleSplit[3]}
            </Table.Cell>
            <Table.Cell class="text-center">
              {scheduleSplit[4]}
            </Table.Cell>
            <Table.Cell>
              <div class="text-left text-pretty font-bold">
                {cronstrue.toString(job.schedule)}
              </div>
            </Table.Cell>
            <Table.Cell class="text-left text-pretty whitespace-normal">
              <!-- <div class="text-left text-pretty pl-1"> -->
              {#if job.taskType === "sql"}
                {job.sql}
              {:else}
                {job.api}
              {/if}
              <!-- </div> -->
            </Table.Cell>
            <Table.Cell class="text-center">
              {job.lastRun
                ? new Date(Number(job.lastRun)).toLocaleString("en-GB", {
                    // timeZone: "Asia/Amman",
                    hour: "numeric",
                    minute: "numeric",
                    month: "numeric",
                    day: "numeric",
                  })
                : ""}
            </Table.Cell>
            <Table.Cell class="text-center">
              {#if job.status === "active"}
                {new Date(
                  CronExpressionParser.parse(job.schedule).next(),
                ).toLocaleString("en-GB", {
                  hour: "numeric",
                  minute: "numeric",
                  month: "numeric",
                  day: "numeric",
                })}
              {/if}
            </Table.Cell>
            <Table.Cell class="text-center">
              {new Date(job.createdAt).toLocaleString("en-GB", {
                // hour: "numeric",
                // minute: "numeric",
                month: "numeric",
                day: "numeric",
                year: "numeric",
              })}
            </Table.Cell>
            <Table.Cell class="text-center">
              {new Date(job.updatedAt).toLocaleString("en-GB", {
                // hour: "numeric",
                // minute: "numeric",
                month: "numeric",
                day: "numeric",
                year: "numeric",
              })}
            </Table.Cell>
            <Table.Cell class="text-center">
              <Dialog.Root>
                <Dialog.Trigger class={buttonVariants({ variant: "default" })}
                  ><Gear class="size-5" /></Dialog.Trigger
                >
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>Task Job Actions</Dialog.Title>
                    <!-- <Dialog.Description>Description</Dialog.Description> -->
                    <div class="grid grid-cols-2 gap-5 mt-5">
                      {#if job.status === "active"}
                        <Label>Active Task</Label>
                        <form method="POST">
                          <input type="hidden" name="id" value={job.id} />
                          <input
                            type="hidden"
                            name="taskName"
                            value={job.taskName}
                          />
                          <Button
                            type="submit"
                            formaction="?/deactivateTask"
                            class="bg-yellow-300 dark:text-background text-black translate-x-[40%] w-[60%]"
                            >Deactivate</Button
                          >
                        </form>
                      {:else if job.status === "inactive"}
                        <Label>Task is not active</Label>
                        <form method="POST">
                          <input type="hidden" name="id" value={job.id} />
                          <input
                            type="hidden"
                            name="taskName"
                            value={job.taskName}
                          />
                          <Button
                            type="submit"
                            class="translate-x-[50%] w-[50%]"
                            formaction="?/activateTask"
                            variant="default">Activate</Button
                          >
                        </form>
                        <div class="flex items-center gap-2">
                          <Label for="deleteTaskSwitch"
                            >Enable Task Deletion</Label
                          >
                          <Switch
                            id="deleteTaskSwitch"
                            bind:checked={deleteTaskSwitch}
                          />
                        </div>
                        <form method="POST">
                          <input type="hidden" name="id" value={job.id} />
                          <input
                            type="hidden"
                            name="taskName"
                            value={job.taskName}
                          />
                          <Button
                            type="submit"
                            class="translate-x-[50%] w-[50%]"
                            formaction="?/deleteTask"
                            disabled={!deleteTaskSwitch}
                            variant="destructive">Delete</Button
                          >
                        </form>
                      {/if}
                    </div>
                  </Dialog.Header>
                  <Dialog.Footer class="sm:justify-start">
                    <Dialog.Close
                      class={buttonVariants({ variant: "secondary" })}
                      >Close</Dialog.Close
                    >
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Root>
            </Table.Cell>
          </Table.Row>
        {:else}
          {#if !loading}
            <Table.Row>
              <Table.Cell colspan="17" class="text-center font-bold"
                >No Current Tasks.</Table.Cell
              >
            </Table.Row>
          {/if}
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
