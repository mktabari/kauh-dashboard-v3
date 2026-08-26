<script>
  import Copy from "~icons/mdi/content-copy";
  import CheckCircle from "~icons/mdi/check-circle";
  let { value, class: className } = $props();
  let copied = $state(false);

  const copy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(value);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  };
</script>

<button onclick={copy} class={className}>
  {#if copied}
    <CheckCircle class="text-master  translate-y-1" />
  {:else}
    <Copy class="translate-y-1" />
  {/if}
</button>
