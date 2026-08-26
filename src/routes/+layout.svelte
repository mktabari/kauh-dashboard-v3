<script>
  import "./layout.css";
  import { page } from "$app/state";
  import favicon from "$lib/assets/favicon.svg";
  import { ModeWatcher } from "mode-watcher";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import AppSidebar from "./SideBar.svelte";
  import Banner from "./Banner.svelte";
  import Home from "~icons/mdi/home";
  import Database from "~icons/mdi/database";
  import SqlQuery from "~icons/mdi/sql-query";
  import Time from "~icons/mdi/access-time";
  import Storage from "~icons/mdi/network-attached-storage";
  import Apps from "~icons/mdi/apps";
  import MonitorDashboard from "~icons/mdi/monitor-dashboard";
  import Cloud from "~icons/mdi/cloud-upload-outline";
  import Error from "~icons/mdi/error-outline";
  import Server from "~icons/mdi/server-outline";
  import Tag from "~icons/mdi/tag-outline";
  import User from "~icons/mdi/user-outline";
  import BulletedType from "~icons/mdi/format-list-bulleted-type";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";

  let { children } = $props();

  //  bg-linear-[25deg,red_5%,yellow_60%,lime_90%,teal]
  // class="flex flex-col h-svh bg-linear-[176deg] from-master-xdark via-15% via-background to-background"
  //  class="flex flex-col h-svh bg-linear-[176deg,var(--master),background_10%,background_90%,var(--slave)]"
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Toaster />
<ModeWatcher />
{#if page.url.pathname.includes("/terminal")}
  {@render children?.()}
{:else}
  <Sidebar.Provider>
    <AppSidebar />
    <Sidebar.Inset>
      <!-- <div
        class="w-full h-full dark:bg-[url('/bg/dark.png')] bg-[url('/bg/light.png')] bg-size-[309px_200px] bg-no-repeat bg-position-[right_1rem_bottom_1rem]"
      > -->
      {@render children?.()}
      <!-- </div> -->
    </Sidebar.Inset>
  </Sidebar.Provider>
{/if}
<!-- 

<div
  class="flex flex-col h-svh bg-linear-[176deg] from-master-xdark via-15% via-background to-background"
>
  <Banner />
  <div class="flex flex-1 overflow-hidden">
    <SideBar />
    <div
      class="flex-1 overflow-auto md:p-5 p-1 md:pl-10 relative scroll-smooth"
    >
      {#if page.url.pathname.includes("/cheatsheet")}
        <BulletedType
          class="text-master/20 fixed bottom-5 right-10 size-50 rotate-10 -z-10"
        />
      {:else if page.url.pathname.includes("/home")}
        <Home
          class="text-master/20 fixed bottom-5 right-10 size-50 rotate-10 -z-10"
        />
      {/if}
      {@render children()}
    </div>
  </div>
</div> -->
