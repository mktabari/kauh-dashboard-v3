<script>
  import { MediaQuery } from "svelte/reactivity";
  import { toast } from "svelte-sonner";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import Delete from "~icons/mdi/delete";
  import Edit from "~icons/mdi/edit-box-outline";
  import Add from "~icons/mdi/add-box";
  import Grid from "~icons/boxicons/grid-filled";
  import Lines from "~icons/el/lines";
  import Oracle from "~icons/cib/oracle";
  import Windows from "~icons/fontisto/windows";
  import Linux from "~icons/fontisto/linux";
  import Dell from "~icons/simple-icons/dell";
  import Search from "~icons/mdi/search";
  import ServerCard from "./ServerCard.svelte";
  import ServerForm from "./ServerForm.svelte";
  import Copy from "$lib/myComponents/Copy.svelte";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import * as InputGroup from "$lib/components/ui/input-group/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Checkbox } from "$src/lib/components/ui/checkbox";

  let { data, form } = $props();
  let serverName = $state("");
  let sheetIsOpen = $state(false);
  let servers = $derived(data.servers);
  let allTags = $derived(data.allTags);
  let serverTags = $derived(data.serverTags);
  let displayStyle = $state("grid");
  let selectedTags = $state([]);
  let newServer = $state({
    brand: "",
    name: "",
    ip: "",
    username: "",
    password: "",
    db: "",
    dbName: "",
    dbPort: "",
    dbUser: "",
    dbPassword: "",
    dbAlert: "",
    bkLogDir: "",
    drInstance: "",
    dbSizeGroup: "",
    dbMountPoint: "",
    dbLabel: "",
    ovs: "",
    wlUser: "",
    wlPassword: "",
    wlPort: "",
  });
  const isDesktop = new MediaQuery("(min-width: 768px)");

  $effect(() => {
    if (form?.message) {
      toast.success(form.message);
    }
    if (form?.error) {
      toast.error(form.error);
    }
  });
  // $inspect(selectedTags);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">Servers</h1>
    <div class="flex items-center gap-2 ms-auto">
      {#if isDesktop.current}
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

        <RadioGroup.Root
          bind:value={displayStyle}
          class="grid grid-cols-2 gap-0 w-30 "
        >
          <Field.Label class="cursor-pointer p-2 ">
            <Grid class="size-5" />
            <RadioGroup.Item value="grid" class="hidden" />
          </Field.Label>
          <Field.Label class="cursor-pointer p-2 ">
            <Lines class="size-4" />
            <RadioGroup.Item value="lines" id="lines" class="hidden" />
          </Field.Label>
        </RadioGroup.Root>
      {/if}
      <Sheet.Root bind:open={sheetIsOpen}>
        <Sheet.Trigger class={buttonVariants({ variant: "ghost" })}
          >Add Server <Add class="size-6" /></Sheet.Trigger
        >
        <Sheet.Content side="right" class=" overflow-auto sm:max-w-150 w-full">
          <Sheet.Header>
            <Sheet.Title>Add Server</Sheet.Title>
            <Sheet.Description></Sheet.Description>
          </Sheet.Header>
          <form method="POST">
            <ServerForm
              bind:server={newServer}
              allTags={data.allTags}
              class="px-4"
            />
            <Sheet.Footer>
              <Button type="submit" formaction="?/addServer">Add Server</Button>
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
    </div>
  </div>
</header>
<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
  {#if isDesktop.current}
    <div class="flex gap-2 p-4 pt-0 w-full flex-wrap">
      {#each allTags as tag}
        <Field.Label
          class=" max-w-min {tag.color} text-secondary-foreground [&>*]:data-[slot=field]:py-1.5 [&>*]:data-[slot=field]:px-2 h-8  has-data-[state=checked]:bg-selected/20 has-data-[state=checked]:border-selected dark:has-data-[state=checked]:bg-selected/20 dark:has-data-[state=checked]:border-selected"
        >
          <Field.Field>
            <Field.Content class="">
              <Field.Title class="w-full flex items-center justify-center"
                >{tag.name}</Field.Title
              >
            </Field.Content>
            <Checkbox
              value={tag.id}
              id={tag.id}
              class="hidden"
              onCheckedChange={(e) => {
                if (e) selectedTags.push(tag.id);
                else selectedTags = selectedTags.filter((t) => t !== tag.id);
              }}
            />
          </Field.Field>
        </Field.Label>
      {/each}
    </div>
  {/if}
  {#if displayStyle === "grid"}
    <div class="w-full flex flex-wrap gap-3">
      {#each servers as server, i (server.id)}
        <ServerCard
          server={servers[i]}
          {allTags}
          {selectedTags}
          serverTags={serverTags.filter((st) => st.serverId === server.id)}
          {serverName}
        />
      {/each}
    </div>
  {:else}
    <div class="border rounded-lg overflow-hidden w-fit min-w-2/3">
      <Table.Root class="text-muted-foreground ">
        <!-- <Table.Caption>list of all servers</Table.Caption> -->
        <Table.Header>
          <Table.Row class="bg-accent">
            <Table.Head>U/D</Table.Head>
            <Table.Head>Name</Table.Head>
            <Table.Head>Brand</Table.Head>
            <Table.Head>IP</Table.Head>
            <Table.Head>Tags</Table.Head>
            <Table.Head>CPU</Table.Head>
            <Table.Head>Memory</Table.Head>
            <Table.Head class="text-end">Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each servers as server (server.id)}
            <Table.Row>
              <Table.Cell class=""
                ><div
                  class=" w-4 h-4 rounded-full"
                  class:bg-green-500={server.isAlive}
                  class:bg-red-500={!server.isAlive}
                ></div></Table.Cell
              >

              <Table.Cell class="text-master font-bold"
                >{server.name}</Table.Cell
              >
              <Table.Cell>
                {#if server.brand === "oracle"}<Oracle class="size-8" />
                {:else if server.brand === "windows"}<Windows class="size-8" />
                {:else if server.brand === "linux"}<Linux class="size-8" />
                {:else if server.brand === "dell"}<Dell class="size-8" />{/if}
              </Table.Cell>
              <Table.Cell
                >{server.ip}<Copy value={server.ip} class="ml-1" /></Table.Cell
              >
              <Table.Cell>
                <div class="flex flex-wrap gap-1">
                  {#if serverTags.filter((st) => st.serverId === server.id).length > 0}
                    {#each serverTags.filter((st) => st.serverId === server.id) as tag}
                      <div
                        class={[
                          "px-2 py-1 rounded text-xs text-background font-semibold",
                          allTags.find((t) => t.id === tag.tagId)?.color,
                        ]}
                      >
                        {allTags.find((t) => t.id === tag.tagId)?.name ||
                          "Unknown Tag"}/{tag.tagId}
                      </div>
                    {/each}
                  {:else}
                    No Tags
                  {/if}
                </div>
              </Table.Cell>
              <Table.Cell>{server.cpu} Cors</Table.Cell>
              <Table.Cell>{server.memory} GB</Table.Cell>
              <Table.Cell class="text-end">
                <Sheet.Root>
                  <Sheet.Trigger class={buttonVariants({ variant: "ghost" })}
                    ><Edit
                      class="size-6 text-muted-foreground"
                    /></Sheet.Trigger
                  >
                  <Sheet.Content
                    side="right"
                    class=" overflow-auto sm:max-w-150 w-full"
                  >
                    <Sheet.Header>
                      <Sheet.Title>Add Server</Sheet.Title>
                      <Sheet.Description></Sheet.Description>
                    </Sheet.Header>

                    <form method="POST">
                      <ServerForm
                        {server}
                        {allTags}
                        serverTags={serverTags.filter(
                          (st) => st.serverId === server.id,
                        )}
                        class="px-4"
                      />
                      <Sheet.Footer>
                        <Button type="submit" formaction="?/editServer"
                          >Edit Server</Button
                        >
                        <Sheet.Close
                          class={buttonVariants({ variant: "outline" })}
                          >Close</Sheet.Close
                        >
                      </Sheet.Footer>
                    </form>
                  </Sheet.Content>
                </Sheet.Root>
                <Dialog.Root>
                  <Dialog.Trigger class={buttonVariants({ variant: "ghost" })}
                    ><Delete
                      class="size-6 text-muted-foreground"
                    /></Dialog.Trigger
                  >
                  <Dialog.Content class="sm:max-w-106.25">
                    <Dialog.Header>
                      <Dialog.Title>Deleting {server.name} Server</Dialog.Title>
                      <Dialog.Description>
                        Are you sure you want to delete this server? This action
                        cannot be undone.
                      </Dialog.Description>
                    </Dialog.Header>

                    <Dialog.Footer>
                      <Dialog.Close
                        class={buttonVariants({ variant: "outline" })}
                        >Cancel</Dialog.Close
                      >
                      <form method="POST">
                        <input type="hidden" name="id" value={server.id} />
                        <input type="hidden" name="name" value={server.name} />
                        <Button type="submit" formaction="?/deleteServer"
                          >Delete Server</Button
                        >
                      </form>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Root>
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  {/if}
</div>
