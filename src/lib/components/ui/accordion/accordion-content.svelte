<script>
  import { Accordion as AccordionPrimitive } from "bits-ui";
  import { cn } from "$lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  } = $props();
</script>

<AccordionPrimitive.Content
  bind:ref
  data-slot="accordion-content"
  class="text-sm data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden"
  {...restProps}
>
  <div
    class={cn(
      "pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
      className,
    )}
  >
    {@render children?.()}
  </div>
</AccordionPrimitive.Content>
