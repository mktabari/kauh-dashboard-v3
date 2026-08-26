<script>
  import { v1 as uuid } from "uuid";
  import { page } from "$app/state";
  import Copy from "$lib/myComponents/Copy.svelte";
  import ServerForm from "./ServerForm.svelte";
  import Oracle from "~icons/cib/oracle";
  import Windows from "~icons/fontisto/windows";
  import Linux from "~icons/fontisto/linux";
  import Dell from "~icons/simple-icons/dell";
  import Cpu from "~icons/solar/cpu-bold";
  import Ram from "~icons/mynaui/microchip";
  import Edit from "~icons/mdi/edit-box-outline";
  import Delete from "~icons/mdi/delete";
  import Open from "~icons/majesticons/open";
  import Parent from "~icons/carbon/add-parent-node";
  import Terminal from "~icons/mdi/terminal";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { onMount } from "svelte";

  let { server, allTags, serverTags, selectedTags, serverName } = $props();
  let serverData = $state({
    // svelte-ignore state_referenced_locally
    cpu: server.cpu,
    // svelte-ignore state_referenced_locally
    memory: server.memory,
    isAlive: false,
  });
  let sheetIsOpen = $state(false);
  onMount(() => {
    if (server.isAlive) {
      serverData.isAlive = server.isAlive;
    } else {
      fetch(`${page.url.pathname}/api/ping/${server.ip}`)
        .then((res) => res.json())
        .then((data) => {
          server.isAlive = data.isAlive;
          serverData.isAlive = data.isAlive;
        })
        .catch(() => {
          server.isAlive = false;
          serverData.isAlive = false;
        });
    }
    if (server.brand === "oracle" || server.brand === "linux") {
      if (!server.cpu) {
        fetch(`${page.url.pathname}/api/cpu/${server.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.cpu && data.cpu !== "error") {
              server.cpu = data.cpu;
              serverData.cpu = server.cpu;
            }
          });
      }
      if (!server.memory) {
        fetch(`${page.url.pathname}/api/memory/${server.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.memory && data.memory !== "error") {
              server.memory = data.memory;
              serverData.memory = server.memory;
            }
          });
      }
    }
  });
  // $inspect(serverTags.find((tag) => selectedTags.includes(tag.tagId)));
  // $inspect(
  //   server.name,
  //   serverName,
  //   server.name.toUpperCase().includes(serverName.toUpperCase()),
  // );
</script>

{#if (server.name
  .toUpperCase()
  .includes(serverName.toUpperCase()) || !serverName) && (serverTags.find( (tag) => selectedTags.includes(tag.tagId), ) !== undefined || selectedTags.length === 0)}
  <Card.Root
    class="relative md:max-w-80 w-full overflow-hidden p-2 pb-1 gap-1 bg-card rounded-md"
  >
    {#if server.brand === "oracle"}
      <Oracle class="size-8 absolute top-2.5 right-2.5" />
    {:else if server.brand === "windows"}
      <Windows class="size-8 absolute top-2.5 right-2.5" />
    {:else if server.brand === "linux"}
      <Linux class="size-8 absolute top-2.5 right-2.5" />
    {:else if server.brand === "dell"}
      <Dell class="size-8 absolute top-2.5 right-2.5" />
    {/if}

    <Card.Header class="px-2 ">
      <Card.Title class="text-master md:text-xl flex items-center"
        >{server.name}
        <Sheet.Root bind:open={sheetIsOpen}>
          <Sheet.Trigger class={buttonVariants({ variant: "ghost" })}
            ><Edit class="size-6 text-muted-foreground" /></Sheet.Trigger
          >
          <Sheet.Content
            side="right"
            class=" overflow-auto sm:max-w-150 w-full"
          >
            <Sheet.Header>
              <Sheet.Title>Edit Server</Sheet.Title>
              <Sheet.Description></Sheet.Description>
            </Sheet.Header>

            <form method="POST">
              <ServerForm bind:server {allTags} {serverTags} class="px-4" />
              <Sheet.Footer>
                <Button type="submit" formaction="?/editServer"
                  >Edit Server</Button
                >
                <Sheet.Close
                  onclick={(e) => {
                    e.preventDefault();
                    sheetIsOpen = false;
                  }}
                  class={buttonVariants({ variant: "outline" })}
                  >Close</Sheet.Close
                >
              </Sheet.Footer>
            </form>
          </Sheet.Content>
        </Sheet.Root>
        {#if serverTags.find((tag) => allTags.find((t) => t.name === "SAN")?.id === tag.tagId)}
          <Copy
            value={server.password}
            class="ml-1 [&_svg:not([class*='size-'])]:size-5 -translate-y-1 text-muted-foreground"
          />
          <Button
            variant="ghost"
            onclick={() => {
              window.open(`http://${server.ip}`);
            }}
            target="_blank"
          >
            <Open class="size-6 text-muted-foreground" />
          </Button>
        {/if}
      </Card.Title>
      <!-- <Card.Description class="text-xl"></Card.Description> -->
    </Card.Header>
    <Card.Content class="flex flex-col flex-1 px-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start">
          {server.ip}<Copy
            value={server.ip}
            class="ml-1 text-muted-foreground"
          />
        </div>
        <div class="flex items-center justify-start w-20">
          <Cpu class="size-6 text-muted-foreground" />
          {#if serverData.cpu}<span>{serverData.cpu} Cors</span>{/if}
        </div>
        <div class="flex items-center justify-start w-20">
          <Ram class="size-6 text-muted-foreground" />
          {#if serverData.memory}<span
              >{parseFloat(serverData.memory).toFixed(0)} GB</span
            >{/if}
        </div>
      </div>

      <div class="flex-1 pt-2 flex flex-wrap gap-2">
        {#if serverTags && serverTags.length > 0}
          {#each serverTags as tag}
            <div
              class={[
                "px-2 py-1 rounded text-xs text-background font-semibold h-fit",
                allTags.find((t) => t.id === tag.tagId)?.color,
              ]}
            >
              {allTags.find((t) => t.id === tag.tagId)?.name || "Unknown Tag"}
            </div>
          {/each}
        {:else}
          <div class="px-2 py-1 text-xs text-muted-foreground">No Tags</div>
        {/if}
      </div>
      <div class="flex items-center justify-between">
        {#if serverData.isAlive}
          <div class="flex gap-1 items-center">
            <div class=" w-4 h-4 bg-green-500 rounded-full"></div>
            UP
          </div>
        {:else}
          <div class="flex gap-1 items-center">
            <div class=" w-4 h-4 bg-red-500 rounded-full"></div>
            DOWN
          </div>
        {/if}
        <div class="flex items-center justify-start w-18 font-semibold">
          <Parent class="size-6 text-muted-foreground mr-1" />{server.ovs}
        </div>
        <Button
          variant="ghost"
          // href="/terminal/{server.id}"
          onclick={() => {
            window.open(
              `/terminal/${uuid()}/${server.id}`,
              uuid(),
              "popup=true,width=820,height=651",
            );
          }}
          disabled={!serverData.isAlive ||
            !["oracle", "linux"].includes(server.brand)}
          ><Terminal class="size-6 text-muted-foreground" /></Button
        >
        <Dialog.Root>
          <Dialog.Trigger class={buttonVariants({ variant: "ghost" })}
            ><Delete class="size-6 text-muted-foreground" /></Dialog.Trigger
          >
          <Dialog.Content class="sm:max-w-106.25">
            <Dialog.Header>
              <Dialog.Title>Deleting {server.name} Server</Dialog.Title>
              <Dialog.Description>
                Are you sure you want to delete this server? This action cannot
                be undone.
              </Dialog.Description>
            </Dialog.Header>

            <Dialog.Footer>
              <Dialog.Close class={buttonVariants({ variant: "outline" })}
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
      </div>
    </Card.Content>
    <Card.Footer class="flex items-center justify-between"></Card.Footer>
  </Card.Root>
{/if}
