<script>
  import { MediaQuery } from "svelte/reactivity";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import Input from "$src/lib/components/ui/input/input.svelte";
  import Logo from "$lib/assets/logo.svelte";
  import Particles from "$lib/components/Particles.svelte";
  import LoadingLoop from "~icons/line-md/loading-loop";
  import CursorGrid from "$src/lib/components/CursorGrid.svelte";
  import { mode } from "mode-watcher";
  const isDesktop = new MediaQuery("(min-width: 768px)");
  let password = $state("");
  let loading = $state(false);
  let Unauthorized = $state(false);
  const login = async () => {
    loading = true;
    const response = await fetch(`/api/login`, {
      method: "POST",
      body: JSON.stringify({
        password,
      }),
    });
    const data = await response.json();
    // loading = false;
    if (data.success) {
      window.location.reload();
      // window.location.href = "/database";
    } else {
      Unauthorized = true;
      loading = false;
    }
  };
  // $inspect(mode);
</script>

<div class="relative flex items-center justify-center space-x-2 h-full">
  {#if isDesktop.current}
    <CursorGrid
      class="opacity-30"
      cellSize={70}
      color={mode.current === "dark" ? "#fff" : "#000"}
      radius={140}
      falloff="smooth"
      clickPulse={true}
    />
  {:else}
    <Particles
      particleCount={200}
      speed={0.1}
      particleColors={[mode.current === "dark" ? "#fff" : "#000"]}
    />{/if}
  <div
    class="grid grid-cols-1 md:grid-cols-[auto_auto] gap-5 items-center space-y-2 border p-5 rounded-lg z-10 backdrop-blur-sm"
  >
    <div class="w-full flex items-center justify-center md:hidden">
      <Logo class="md:h-40 h-30 w-auto text-primary " />
    </div>
    <div class="grid grid-cols-[auto_auto] gap-2 items-center space-y-2 w-full">
      <Label class=" justify-center col-span-2 md:text-3xl text-xl font-bold "
        >Kauh Servers Dashboard
      </Label>

      <Label for="password" class="text-left text-lg font-bold">Password</Label>

      <Input
        id="password"
        name="password"
        type="password"
        class="text-center"
        aria-invalid={Unauthorized}
        onkeydown={(e) => {
          if (e.key === "Enter") login();
        }}
        bind:value={password}
      />

      <Button class=" w-full text-base col-start-2" onclick={login}
        >{#if loading}
          <LoadingLoop />
        {:else}
          GO
        {/if}</Button
      >
    </div>
  </div>
  <Logo
    class="md:h-100 hidden md:block w-auto text-primary/50 z-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 "
  />
</div>
