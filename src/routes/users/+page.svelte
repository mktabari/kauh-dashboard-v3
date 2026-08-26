<script>
  import { page } from "$app/state";
  import { MediaQuery } from "svelte/reactivity";
  import Lines from "~icons/el/lines";
  import Oracle from "~icons/cib/oracle";
  import Windows from "~icons/fontisto/windows";
  import Linux from "~icons/fontisto/linux";
  import Dell from "~icons/simple-icons/dell";
  import Plus from "~icons/mdi/plus-circle";
  import Minus from "~icons/mdi/minus-circle";
  import Clock from "~icons/mdi/clock-check-outline";
  import Spinner from "~icons/svg-spinners/bars-scale-fade";
  import Error from "~icons/ooui/error";
  import * as Table from "$lib/components/ui/table/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import Copy from "$lib/myComponents/Copy.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { toast } from "svelte-sonner";
  let { data } = $props();
  const isDesktop = new MediaQuery("(min-width: 768px)");
  // svelte-ignore state_referenced_locally
  let deactivate = $state([...data.deactivate]);
  // svelte-ignore state_referenced_locally
  let activate = $state([...data.activate]);
  const action = async (action, AUI, PI) => {
    const response = await fetch(`${page.url.pathname}/api`, {
      method: "POST",
      body: JSON.stringify({
        action,
        AUI,
        PI,
      }),
    });
    const data = await response.json();

    if (data.result === "error") {
      toast.error(` ${action} was unsuccessful`, {
        duration: 10000,
        // theme: "light",
      });
      return "error";
    }
    return "success";
  };
  // $inspect(deactivate, activate);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">ISOFT Users Management</h1>
  </div>
</header>
<div class="flex flex-1 flex-col gap-2 md:p-4 pt-0">
  <!-- <Card.Root class="w-full"> -->
  <div class="px-4 md:px-0">Deactivate Users</div>

  <div class="border md:rounded-t-lg overflow-hidden">
    <Table.Root>
      <Table.Header>
        <Table.Row class="bg-accent">
          <Table.Head class="text-center">Emp Num</Table.Head>
          <Table.Head>Full Name</Table.Head>
          <Table.Head class="hidden md:table-cell">Job</Table.Head>
          <Table.Head class="hidden md:table-cell">App User ID</Table.Head>
          <Table.Head class="hidden md:table-cell">Practitioner ID</Table.Head>
          <Table.Head>Action</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each deactivate as user}
          <Table.Row>
            <Table.Cell class="text-center">{user.EMPNUM}</Table.Cell>
            <Table.Cell>{user.FN}</Table.Cell>
            <Table.Cell class="hidden md:table-cell">{user.JOB}</Table.Cell>
            <Table.Cell class="hidden md:table-cell"
              >{#if user.AUI}{user.AUI}<Copy
                  value={user.AUI}
                  class="ml-1"
                />{/if}</Table.Cell
            >
            <Table.Cell class="hidden md:table-cell"
              >{#if user.PI}{user.PI}<Copy
                  value={user.PI}
                  class="ml-1"
                />{/if}</Table.Cell
            >
            <Table.Cell>
              <Button
                variant="destructive"
                disabled={user.inactive}
                onclick={() => {
                  user.inactive = true;
                  user.working = true;

                  fetch(`${page.url.pathname}/api`, {
                    method: "POST",
                    body: JSON.stringify({
                      action: "deactivate",
                      AUI: user.AUI,
                      PI: user.PI,
                    }),
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      user.response = data.result;
                      user.working = false;

                      if (data.result === "error") {
                        toast.error(`Deactivation was unsuccessful`, {
                          duration: 10000,
                          // theme: "light",
                        });
                      }
                    });
                }}
              >
                {#if user.working}<Spinner
                  />{:else if !user.response}Deactivate{:else if user.response === "success"}Deactivated{:else}<Error
                  />{/if}</Button
              >
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <!-- </Card.Root> -->

  <!-- <Card.Root class="w-full"> -->

  <div class="px-4 md:px-0 mt-4">Activate Users</div>
  <div class="border md:rounded-t-lg overflow-hidden">
    <Table.Root>
      <Table.Header>
        <Table.Row class="bg-accent">
          <Table.Head class="text-center">Emp Num</Table.Head>
          <Table.Head>Full Name</Table.Head>
          <Table.Head class="hidden md:table-cell">Job</Table.Head>
          <Table.Head class="hidden md:table-cell">App User ID</Table.Head>
          <Table.Head class="hidden md:table-cell">Practitioner ID</Table.Head>
          <Table.Head>Action</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each activate as user}
          <Table.Row>
            <Table.Cell class="text-center">{user.EMPNUM}</Table.Cell>
            <Table.Cell>{user.FN}</Table.Cell>
            <Table.Cell class="hidden md:table-cell">{user.JOB}</Table.Cell>
            <Table.Cell class="hidden md:table-cell"
              >{user.AUI}<Copy value={user.AUI} class="ml-1" /></Table.Cell
            >
            <Table.Cell class="hidden md:table-cell"
              >{#if user.PI}{user.PI}<Copy
                  value={user.PI}
                  class="ml-1"
                />{/if}</Table.Cell
            >
            <Table.Cell>
              <Button
                disabled={user.inactive}
                variant="default"
                onclick={() => {
                  user.inactive = true;
                  user.working = true;

                  fetch(`${page.url.pathname}/api`, {
                    method: "POST",
                    body: JSON.stringify({
                      action: "activate",
                      AUI: user.AUI,
                      PI: user.PI,
                    }),
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      user.response = data.result;
                      user.working = false;

                      if (data.result === "error") {
                        toast.error(`Activation was unsuccessful`, {
                          duration: 10000,
                          // theme: "light",
                        });
                      }
                    });
                }}
                >{#if user.working}<Spinner
                  />{:else if !user.response}Activate{:else if user.response === "success"}Activated{:else}<Error
                  />{/if}</Button
              >
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
