<script>
  import { toast } from "svelte-sonner";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Field from "$lib/components/ui/field/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import Delete from "~icons/mdi/delete";
  let { data, form } = $props();
  let { allTags } = data;
  let newTag = $state({
    name: "",
    description: "",
    color: "",
    permanent: false,
  });

  const colors = [
    { value: "bg-red-500", label: "Red" },
    { value: "bg-green-500", label: "Green" },
    { value: "bg-blue-500", label: "Blue" },
    { value: "bg-purple-500", label: "Purple" },
    { value: "bg-yellow-500", label: "Yellow" },
    { value: "bg-orange-500", label: "Orange" },
    { value: "bg-indigo-500", label: "Indigo" },
  ];

  const triggerContent = $derived(
    // colors.find((f) => f.value === newTag.color)?.label ?? "Select a color",
    newTag.color
      ? colors
          .filter((f) => f.value === newTag.color)
          ?.map((f) => {
            return "<div class='size-5 " + f.value + "'></div>" + f.label;
          })
      : "<div class='size-5 bg-gray-500'></div>Select a color",
  );

  $effect(() => {
    if (form?.message) {
      toast.success(form.message);
    }
    if (form?.error) {
      toast.error(form.error);
    }
  });
  // $inspect(data);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">Server Tags</h1>
  </div>
</header>
<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
  <!-- <div class="grid grid-cols-1 xl:grid-cols-[auto_auto] gap-4"> -->
  <form method="POST">
    <Field.Group class=" max-w-200  border rounded-lg p-4 bg-card">
      <Field.Set>
        <Field.Legend>Add New Tag</Field.Legend>
        <Field.Description
          >Tags will be used to categorize servers.</Field.Description
        >
        <!-- <Field.Separator /> -->
        <Field.Group>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Field.Field>
              <Field.Label for="nameid">Tag Name</Field.Label>
              <Input
                id="nameid"
                name="name"
                bind:value={newTag.name}
                required
              />
            </Field.Field>
            <Field.Field class="sm:col-span-2">
              <Field.Label for="descriptionid">Description</Field.Label>
              <Input
                id="descriptionid"
                name="description"
                bind:value={newTag.description}
                required
              />
            </Field.Field>
            <Field.Field>
              <Field.Label>Color</Field.Label>
              <Select.Root
                type="single"
                name="color"
                bind:value={newTag.color}
                required
              >
                <Select.Trigger class="text-{newTag.color.substring(3)}">
                  {@html triggerContent}
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Colors</Select.Label>
                    {#each colors as color (color.value)}
                      <Select.Item value={color.value} label={color.label}>
                        <div class="size-5 {color.value}"></div>
                        {color.label}
                      </Select.Item>
                    {/each}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </Field.Field>
            <Field.Field orientation="horizontal" class="sm:col-span-3">
              <Checkbox
                id="permanentid"
                name="permanent"
                bind:checked={newTag.permanent}
              />
              <Field.Label for="permanentid" class="font-normal">
                Permanent Tag (Cannot be deleted)
              </Field.Label>
            </Field.Field>
            <Button type="submit" formaction="?/addTag">Add Tag</Button>
          </div>
        </Field.Group>
      </Field.Set>
    </Field.Group>
  </form>
  {#if allTags.length > 0}
    <div class="flex border rounded-lg overflow-hidden md:w-fit md:min-w-200">
      <Table.Root class="">
        <Table.Header>
          <Table.Row class="bg-accent">
            <Table.Head>Tag Name</Table.Head>
            <Table.Head>Description</Table.Head>
            <Table.Head>Color</Table.Head>
            <Table.Head class="text-end">Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each allTags as tag (tag.id)}
            <Table.Row>
              <Table.Cell class="">{tag.name}</Table.Cell>
              <Table.Cell
                ><div class="text-wrap w-30 md:w-fit">
                  {tag.description}
                </div></Table.Cell
              >
              <Table.Cell class="">
                <div
                  class="flex h-full items-center justify-center rounded text-background {tag.color} px-2 py-1"
                >
                  {tag.color.split("-")[1]}
                </div>
              </Table.Cell>
              <Table.Cell class="text-end">
                <Dialog.Root>
                  <Dialog.Trigger
                    disabled={tag.permanent === 1}
                    class={buttonVariants({ variant: "ghost" })}
                    ><Delete
                      class="size-6 text-muted-foreground"
                    /></Dialog.Trigger
                  >
                  <Dialog.Content class="sm:max-w-106.25">
                    <Dialog.Header>
                      <Dialog.Title>Deleting {tag.name} Tag</Dialog.Title>
                      <Dialog.Description>
                        Are you sure you want to delete this Tag? This action
                        cannot be undone.
                      </Dialog.Description>
                    </Dialog.Header>
                    <Dialog.Footer>
                      <Dialog.Close
                        class={buttonVariants({ variant: "outline" })}
                      >
                        Cancel
                      </Dialog.Close>
                      <form method="POST">
                        <input type="hidden" name="id" value={tag.id} />
                        <input type="hidden" name="name" value={tag.name} />
                        <Button type="submit" formaction="?/deleteTag"
                          >Delete Tag</Button
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
  {:else}
    <div class="text-center py-10">
      <p class="text-muted-foreground">No tags saved.</p>
    </div>
  {/if}

  <!-- </div> -->
</div>
<!-- <div class="hidden">
  <span class="text-red-500"></span>
  <span class="text-blue-500"></span>
  <span class="text-green-500"></span>
  <span class="text-purple-500"></span>
  <span class="text-yellow-500"></span>
  <span class="text-orange-500"></span>
  <span class="text-orange-500"></span>
  <span class="text-indigo-500"></span>
</div> -->
