<script>
  import Logout from "~icons/mdi/logout";
  import Sun from "~icons/mdi/white-balance-sunny";
  import Moon from "~icons/mdi/moon-waning-crescent";
  import Github from "~icons/mdi/github";
  import { Button } from "$lib/components/ui/button/index.js";
  import { toggleMode } from "mode-watcher";
</script>

<div class="h-20 flex items-center justify-between px-4">
  <div class="flex flex-1 md:text-4xl font-bold text-base">
    KAUH Servers Dashboard
  </div>
  <div class="flex gap-2">
    <Button
      variant="outline"
      size="icon"
      class="bg-background/20 hover:bg-transparent border-border/50 hidden md:flex"
    >
      <Github class="size-6" />
    </Button>
    <Button
      onclick={toggleMode}
      variant="outline"
      size="icon"
      class="bg-background/20 hover:bg-transparent border-border/50"
    >
      <Sun
        class=" scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90 size-5"
      />
      <Moon
        class="absolute  scale-0 rotate-90 transition-all! dark:scale-100 dark:-rotate-45 size-5"
      />
    </Button>
    <Button
      variant="outline"
      size="icon"
      class="bg-background/20 hover:bg-transparent border-border/50 "
    >
      <Logout class="size-6" />
    </Button>
  </div>
</div>
