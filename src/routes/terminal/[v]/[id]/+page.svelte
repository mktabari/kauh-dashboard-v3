<script>
  import * as xterm from "@xterm/xterm";
  import { FitAddon } from "@xterm/addon-fit";
  import { MediaQuery } from "svelte/reactivity";
  import { mode } from "mode-watcher";
  import { onMount, onDestroy } from "svelte";
  import { page } from "$app/state";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import "xterm/css/xterm.css"; // Import terminal styles
  import Button from "$src/lib/components/ui/button/button.svelte";
  import Plus from "~icons/mdi/plus";
  import Minus from "~icons/mdi/minus";
  import Back from "~icons/ic/outline-door-back";
  let { id } = $props();
  let terminalElement;
  let socket = $state();
  let term;
  let fitAddon;
  let ws;
  let chatmessages = $state([]);
  let fs = $state();
  let first = $state(true);
  let server_data = $state(null);
  const isDesktop = new MediaQuery("(min-width: 768px)");

  onMount(async () => {
    socket = new WebSocket(`${page.url.pathname}/ws`);
    socket.onmessage = (event) => {
      if (first) {
        server_data = String(event.data);
        first = false;
      } else {
        term.write(String(event.data));
      }
    };

    // term = new xterm.Terminal({
    //   cursorBlink: true,
    //   theme: {
    //     foreground: "#fff",
    //     background: "#000",
    //   },
    //   // rows: 30,
    //   fontSize: 17,
    // });
    term = new xterm.Terminal();
    term.options.cursorBlink = true;
    term.options.col = 120;
    fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalElement);
    term.onData((data) => {
      socket.send(data);
    });
    setTimeout(() => {
      fitAddon.fit();
    }, 50);
    fs = term?.options.fontSize;
    window.addEventListener("resize", () => {
      setTimeout(() => {
        fitAddon.fit();
        console.log("resize", term?.options);
      }, 50);
    });
  });
  onDestroy(() => {
    socket?.close();
    term?.dispose();
  });
  // $inspect(term?.options);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <h1 class="text-lg font-semibold">
      {server_data} Terminal
    </h1>
    <div class="flex items-center gap-2 ms-auto">
      Font size {fs}
      <Button
        variant="outline"
        onclick={() => {
          term.options.fontSize += 1;
          fs = term?.options.fontSize;
          setTimeout(() => {
            fitAddon.fit();
          }, 50);
        }}><Plus /></Button
      >
      <Button
        variant="outline"
        onclick={() => {
          term.options.fontSize -= 1;
          fs = term?.options.fontSize;
          setTimeout(() => {
            fitAddon.fit();
          }, 50);
        }}><Minus /></Button
      >
      <Button
        variant="outline"
        onclick={() => {
          window.close();
        }}><Back /></Button
      >
    </div>
  </div>
</header>
<!-- <Separator /> -->

<div
  bind:this={terminalElement}
  class=" w-full h-[calc(100vh-4rem)] overflow-hidden"
></div>
<!-- <Separator /> -->
