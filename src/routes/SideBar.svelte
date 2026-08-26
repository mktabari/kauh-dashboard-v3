<script>
  import Logout from "~icons/mdi/logout";
  import Sun from "~icons/mdi/white-balance-sunny";
  import Moon from "~icons/mdi/moon-waning-crescent";
  import Github from "~icons/mdi/github";
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
  import Graduation from "~icons/fluent/hat-graduation-32-regular";
  import Calender from "~icons/pixel/calender-solid";
  import Envelope from "~icons/mdi/envelope";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { toggleMode } from "mode-watcher";
  const items = [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "separator",
    },
    {
      title: "Database",
      url: "/database",
      icon: Database,
    },
    {
      title: "SQL Diagnosis",
      url: "/sqlDiagnosis",
      icon: SqlQuery,
    },
    {
      title: "Server Time",
      url: "/serverTime",
      icon: Time,
    },
    {
      title: "Disk Space",
      url: "/diskSpace",
      icon: Storage,
    },
    {
      title: "ERP",
      url: "/erp",
      icon: Apps,
    },
    {
      title: "APP Servers",
      url: "/appServers",
      icon: MonitorDashboard,
    },
    {
      title: "Cloud Backup",
      url: "/cloudBackup",
      icon: Cloud,
    },
    {
      title: "SMS Messages",
      url: "/sms",
      icon: Envelope,
    },

    {
      title: "separator1",
    },
    {
      title: "Faults",
      url: "/faults",
      icon: Error,
    },
    {
      title: "separator2",
    },
    {
      title: "Servers",
      url: "/servers",
      icon: Server,
    },
    {
      title: "Tags",
      url: "/tags",
      icon: Tag,
    },
    {
      title: "separator3",
    },
    {
      title: "Users",
      url: "/users",
      icon: User,
    },
    {
      title: "separator4",
    },
    {
      title: "Cheat Sheet",
      url: "/cheatsheet",
      icon: Graduation,
    },
    {
      title: "separator5",
    },
    {
      title: "Scheduled Tasks",
      url: "/tasks",
      icon: Calender,
    },
  ];
  const sidebar = Sidebar.useSidebar();
  let sidebarState = $state(sidebar.state);
  $effect(() => {
    if (sidebar.state === "expanded") {
      setTimeout(() => {
        sidebarState = sidebar.state;
      }, 300);
    } else {
      sidebarState = sidebar.state;
    }
  });
  // $inspect(sidebar.state);
</script>

<Sidebar.Root collapsible="icon" variant="inset">
  <Sidebar.Header>
    <Sidebar.GroupLabel
      >{#if sidebarState === "expanded"}
        <div class="text-xl font-bold">
          Kauh Servers
          <div class="tracking-widest -translate-y-1">Dashboard</div>
        </div>{/if}</Sidebar.GroupLabel
    >
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each items as item (item.title)}
            {#if item.title.includes("separator")}
              <Separator class="my-2" />
            {:else}
              <Sidebar.MenuItem>
                {#if sidebar.isMobile}
                  <Sidebar.MenuButton
                    isActive={page.url.pathname.includes(item.url)}
                    onclick={() => {
                      goto(item.url);
                      sidebar.toggle();
                    }}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </Sidebar.MenuButton>
                {:else}
                  <Sidebar.MenuButton
                    isActive={page.url.pathname.includes(item.url)}
                  >
                    {#snippet child({ props })}
                      <a href={item.url} {...props}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    {/snippet}
                  </Sidebar.MenuButton>
                {/if}
              </Sidebar.MenuItem>
            {/if}
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer>
    <Sidebar.Menu>
      <Sidebar.MenuItem
        class="{sidebarState === 'collapsed' ? 'grid' : 'flex'} gap-2"
      >
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
          class="bg-background/20 hover:bg-transparent border-border/50 hidden md:flex"
          onclick={() => {
            window.open(
              "https://github.com/mktabari/kauh-dashboard-v3",
              "_blank",
            );
          }}
        >
          <Github class="size-6" />
        </Button>
        <Button
          // data-sveltekit-preload-data="off"
          // data-sveltekit-reload
          variant="outline"
          size="icon"
          class="bg-background/20 hover:bg-transparent border-border/50 "
          onclick={() => {
            fetch("/api/logout")
              .then((res) => res.json())
              .then((data) => {
                // if (data.success) {
                // goto("/");
                window.location.reload();
                // }
              });
          }}
        >
          <Logout class="size-6" />
        </Button>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Footer>
</Sidebar.Root>
