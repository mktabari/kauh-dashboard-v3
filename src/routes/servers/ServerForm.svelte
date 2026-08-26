<script>
  import validateIP from "validate-ip-node";
  import Copy from "$lib/myComponents/Copy.svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";

  import Oracle from "~icons/fontisto/oracle";
  import Windows from "~icons/fontisto/windows";
  import Linux from "~icons/fontisto/linux";
  import Dell from "~icons/simple-icons/dell";
  let { server, allTags, serverTags, class: className } = $props();
  let serverData = $state({});
  let assignedTags = $state([]);
  let ipValid = $state(true);
  let serverAssignedTags = $derived(assignedTags.join(","));
  $effect(() => {
    assignedTags = serverTags?.map((st) => st.tagId) ?? [];
  });
  $effect(() => {
    serverData = server;
  });
  // $inspect(serverTags, allTags, assignedTags, serverAssignedTags);
  // $inspect(assignedTags);
  // $inspect(
  //   allTags
  //     .filter((tag) => tag.name.includes("WL"))
  //     .find((tag) => assignedTags.includes(tag.id)),
  // );
</script>

{#if serverData?.id}
  <input type="hidden" name="id" value={serverData.id} />
{/if}
<div class={className}>
  <div>
    <div class="border-b-2 border-primary font-semibold">Brand</div>

    <Field.Set class="m-2">
      <RadioGroup.Root
        value={serverData.brand}
        class="grid grid-cols-4 gap-2"
        name="brand"
        required
      >
        <Field.Label>
          <Field.Field>
            <Field.Content class="">
              <Field.Title class="w-full flex items-center justify-center"
                ><Oracle class="size-full" /></Field.Title
              >
            </Field.Content>
            <RadioGroup.Item value="oracle" id="oracle" class="hidden" />
          </Field.Field>
        </Field.Label>
        <Field.Label>
          <Field.Field>
            <Field.Content class="">
              <Field.Title class="w-full flex items-center justify-center"
                ><Windows class="size-full" /></Field.Title
              >
            </Field.Content>
            <RadioGroup.Item value="windows" id="windows" class="hidden" />
          </Field.Field>
        </Field.Label>
        <Field.Label>
          <Field.Field>
            <Field.Content class="">
              <Field.Title class="w-full flex items-center justify-center"
                ><Linux class="size-5/6" /></Field.Title
              >
            </Field.Content>
            <RadioGroup.Item value="linux" id="linux" class="hidden" />
          </Field.Field>
        </Field.Label>
        <Field.Label>
          <Field.Field>
            <Field.Content class="">
              <Field.Title class="w-full flex items-center justify-center"
                ><Dell class="size-full" /></Field.Title
              >
            </Field.Content>
            <RadioGroup.Item value="dell" id="dell" class="hidden" />
          </Field.Field>
        </Field.Label>
      </RadioGroup.Root>
    </Field.Set>
  </div>
  <div class="hidden md:block"></div>
  <div>
    <div class="border-b-2 border-primary font-semibold">
      Server Cridentials
    </div>
    <Field.Group class="my-2 grid md:grid-cols-2 grid-cols-2 gap-2 p-2">
      <Field.Field>
        <Field.Label for="name">Name</Field.Label>
        <Input id="name" name="name" value={serverData.name} required />
      </Field.Field>
      <Field.Field>
        <Field.Label for="ip">Ip</Field.Label>
        <Input
          id="ip"
          name="ip"
          class={ipValid ? "" : "border-red-500 text-red-500"}
          bind:value={serverData.ip}
          required
          onchange={(e) => {
            ipValid = validateIP(e.target.value);
            if (!ipValid) e.target.setCustomValidity("Invalid IP address");
            else e.target.setCustomValidity("");
          }}
        />
      </Field.Field>
      <Field.Field>
        <Field.Label for="username">Username</Field.Label>
        <Input
          id="username"
          name="username"
          value={serverData.username}
          required
        />
      </Field.Field>
      <Field.Field>
        <Field.Label for="password">Password</Field.Label>
        <div class="flex">
          <Input
            id="password"
            name="password"
            type="password"
            bind:value={serverData.password}
            required
          /><Copy value={serverData.password} class="ml-1" />
        </div>
      </Field.Field>
    </Field.Group>
  </div>
  <div>
    <div class="border-b-2 border-primary font-semibold">
      Database Cridentials
    </div>
    <Field.Group class="my-2 grid md:grid-cols-2 grid-cols-2 gap-2 p-2">
      <Field.Field>
        <Field.Label for="dbName">DB Name</Field.Label>
        <Input id="dbName" name="dbName" bind:value={serverData.dbName} />
      </Field.Field>
      <Field.Field>
        <Field.Label for="dbPort">Port</Field.Label>
        <Input
          id="dbPort"
          name="dbPort"
          value={serverData.dbPort}
          required={serverData.dbName !== "" &&
            serverData.dbName !== undefined &&
            serverData.dbName !== null}
        />
      </Field.Field>
      <Field.Field>
        <Field.Label for="dbUser">DB Username</Field.Label>
        <Input
          id="dbUser"
          name="dbUser"
          value={serverData.dbUser}
          required={serverData.dbName !== "" &&
            serverData.dbName !== undefined &&
            serverData.dbName !== null}
        />
      </Field.Field>
      <Field.Field>
        <Field.Label for="dbPassword">DB Password</Field.Label>
        <div class="flex">
          <Input
            id="dbPassword"
            name="dbPassword"
            type="password"
            bind:value={serverData.dbPassword}
            required={serverData.dbName !== "" &&
              serverData.dbName !== undefined &&
              serverData.dbName !== null}
          />
          {#if serverData.dbPassword}
            <Copy value={serverData.dbPassword} class="ml-1" />
          {/if}
        </div>
      </Field.Field>
    </Field.Group>
  </div>
  <div>
    <div class="border-b-2 border-primary font-semibold">
      Weblogic Cridentials
    </div>
    <Field.Group class="my-2 grid md:grid-cols-2 grid-cols-2 gap-2 p-2">
      <Field.Field>
        <Field.Label for="wlUser">WL Username</Field.Label>
        <Input
          id="wlUser"
          name="wlUser"
          value={serverData.wlUser}
          required={allTags
            .filter((tag) => tag.name.includes("WL"))
            .find((tag) => assignedTags.includes(tag.id)) !== undefined}
        />
      </Field.Field>
      <Field.Field>
        <Field.Label for="wlPassword">WL Password</Field.Label>
        <div class="flex">
          <Input
            id="wlPassword"
            name="wlPassword"
            type="password"
            bind:value={serverData.wlPassword}
            required={serverData.wlUser !== "" &&
              serverData.wlUser !== undefined &&
              serverData.wlUser !== null}
          />
          {#if serverData.wlPassword}
            <Copy value={serverData.wlPassword} class="ml-1" />
          {/if}
        </div>
      </Field.Field>
      <!-- <Field.Field>
        <Field.Label for="wlPort">Port</Field.Label>
        <Input
          id="wlPort"
          name="wlPort"
          value={serverData.wlPort}
           required={serverData.wlUser !== "" &&
              serverData.wlUser !== undefined &&
              serverData.wlUser !== null}
        />
      </Field.Field> -->
    </Field.Group>
  </div>
  <div>
    <div class="border-b-2 border-primary font-semibold">
      Database Utilityes
    </div>
    <Field.Group class="my-2 grid md:grid-cols-2 grid-cols-2 gap-2 p-2">
      <Field.Field class="col-span-1">
        <Field.Label for="dbLabel">DB Label</Field.Label>
        <Input id="dbLabel" name="dbLabel" value={serverData.dbLabel} />
      </Field.Field>
      <Field.Field class="col-span-2">
        <Field.Label for="dbAlert">Alert Log File</Field.Label>
        <Input id="dbAlert" name="dbAlert" value={serverData.dbAlert} />
      </Field.Field>
      <Field.Field class="col-span-2">
        <Field.Label for="bkLogDir">Backup Log Files Path</Field.Label>
        <Input id="bkLogDir" name="bkLogDir" value={serverData.bkLogDir} />
      </Field.Field>
      <Field.Field class="col-span-2">
        <Field.Label for="mountPoint">Mount Points to Check</Field.Label>
        <Input
          id="mountPoint"
          name="mountPoint"
          value={serverData.mountPoint}
        />
      </Field.Field>
      <Field.Field>
        <Field.Label for="drInstance">DR Instance</Field.Label>
        <Input
          id="drInstance"
          name="drInstance"
          value={serverData.drInstance}
        />
      </Field.Field>
      <Field.Field>
        <Field.Label for="dbSizeGroup">DB Size Group Name</Field.Label>
        <Input
          id="dbSizeGroup"
          name="dbSizeGroup"
          value={serverData.dbSizeGroup}
        />
      </Field.Field>
    </Field.Group>
  </div>
  <div>
    <div class="border-b-2 border-primary font-semibold">Server Tags</div>
    <Field.Group class="my-2 grid md:grid-cols-4 grid-cols-2 gap-2 p-2">
      <input
        type="text"
        class="hidden"
        name="assignedTags"
        value={serverAssignedTags}
      />
      {#each allTags as tag (tag.id)}
        <Field.Field
          class="hover:bg-accent/50 border p-3 has-aria-checked:border-master has-aria-checked:bg-master/20 rounded "
          orientation="horizontal"
        >
          <Checkbox
            id="tag-{tag.id}"
            name="tag-{tag.id}"
            checked={assignedTags?.includes(tag.id)}
            onCheckedChange={(value) => {
              if (value) {
                assignedTags = [...assignedTags, tag.id];
              } else {
                assignedTags = assignedTags?.filter((id) => id !== tag.id);
              }
            }}
          />
          <Field.Label for="tag-{tag.id}" class="cursor-pointer"
            >{tag.name}</Field.Label
          >
        </Field.Field>
      {/each}
    </Field.Group>
  </div>
  <div>
    <div class="border-b-2 border-primary font-semibold">Parent OVS Server</div>
    <Field.Group class="my-2 grid md:grid-cols-2 grid-cols-2 gap-2 p-2">
      <Field.Field class="col-span-1">
        <Field.Label for="ovs">OVS Name</Field.Label>
        <Input
          disabled={serverData.brand !== "oracle"}
          id="ovs"
          name="ovs"
          value={serverData.ovs}
        />
      </Field.Field>
    </Field.Group>
  </div>
</div>
