<script>
  import { twMerge } from "tailwind-merge";
  let { children, class: className } = $props();
</script>

<span
  class={twMerge(
    className,
    " whitespace-nowrap font-semibold text-gray-800 bg-gray-100/80 border border-gray-400 rounded-md dark:bg-gray-900/80 dark:text-gray-100 dark:border-gray-600 px-2 pt-0.5 pb-1 ",
  )}
  >{@render children?.()}
</span>
