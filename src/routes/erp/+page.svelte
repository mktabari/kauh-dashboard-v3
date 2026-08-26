<script>
  import { dev } from "$app/environment";
  import { MediaQuery } from "svelte/reactivity";
  import { page } from "$app/state";
  import ta from "time-ago";
  import { Progress } from "$lib/components/ui/progress/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import Spinner from "~icons/svg-spinners/bars-scale-fade";
  import Start from "~icons/gis/flag-start";
  import DbStop from "~icons/mdi/database-arrow-down";
  import Dbstart from "~icons/mdi/database-arrow-up";
  import Restart from "~icons/streamline-ultimate/server-refresh-1-bold";
  import AppStart from "~icons/lucide/monitor-up";
  import AppStop from "~icons/lucide/monitor-down";
  import { onDestroy, untrack } from "svelte";
  import Button from "$src/lib/components/ui/button/button.svelte";
  let { data } = $props();
  // svelte-ignore state_referenced_locally
  let { servers, durations } = data;
  const isDesktop = new MediaQuery("(min-width: 768px)");
  let streamReader;
  let checkActiveProcessIntervalId;
  let rebootIntervalId;
  let waitIntervalId;
  let stepCounterInterval;
  let postData = {
    method: "POST",
    body: JSON.stringify({
      ip: servers.ip,
      username: servers.username,
      password: servers.password,
      dbAlert: servers.dbAlert,
    }),
  };
  let rebooting = $state(false);
  let scrolpre = $state(null);
  let popupModal = $state(false);
  let erpRestarting = $state(false);
  let restartLog = $state(null);
  let currentStep = $state(0);
  let stepCounter = $state(0);

  let steps = $state(
    [
      "Waiting for Restart",
      "Stop ERP APP",
      "Stop ERP DB",
      "Server Reboot",
      "Start ERP DB",
      "Start ERP APP",
      "Restart Completed",
    ].map((step, index, steps) => {
      return {
        step,
        duration:
          durations.find((d) => Number(d.step) === Number(index))?.duration ||
          (index === 0 || index === steps.length - 1 ? 0 : 60),
      };
    }),
  );
  $inspect(durations, steps);
  const resetStepCounter = () => {
    if (stepCounterInterval) clearInterval(stepCounterInterval);
    stepCounter = 0;
    stepCounterInterval = setInterval(() => {
      stepCounter++;
    }, 1000);
  };
  const checkActiveProcess = () => {
    if (currentStep === 2)
      fetch(`${page.url.pathname}/api/killActiveProcess`, postData);
  };
  const waitForMinute = () => {
    if (dev) console.log("waitForMinute excuted" + new Date());
    rebootIntervalId = setInterval(checkServerReboot, 10000);
    if (waitIntervalId) clearInterval(waitIntervalId);
  };
  const checkServerReboot = () => {
    if (dev) console.log("checkServerReboot excuted" + new Date());
    fetch(`/servers/api/ping/${servers.ip}`)
      .then((response) => response.json())
      .then(({ isAlive }) => {
        if (isAlive) {
          rebooting = false;
        }
      });
  };
  const setStepDuration = () => {
    fetch(`${page.url.pathname}/api/setStepDuration`, {
      method: "POST",
      body: JSON.stringify({
        step: currentStep,
        duration: stepCounter,
      }),
    });
  };
  const testrestartLog = () => {
    let int = setInterval(() => {
      restartLog += `test
      `;
    }, 100);
    setTimeout(() => {
      clearInterval(int);
    }, 10000);
  };
  $effect(() => {
    if (restartLog) {
      untrack(() => {
        scrolpre.scrollTo(0, scrolpre.scrollHeight);
      });
    }
  });
  const restartERP = async () => {
    let response;
    if (!erpRestarting) {
      erpRestarting = true;
      restartLog = "";
      resetStepCounter();
      currentStep++;
      restartLog += `

${steps[currentStep].step}
${"=".repeat(steps[currentStep].step.length)}

`;
      response = await fetch(`${page.url.pathname}/api/stopApp`, postData);
      streamReader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      while (true) {
        const { value, done } = await streamReader.read();
        restartLog += `${value}`;
        if (done) break;
      }
      streamReader?.releaseLock();
      setStepDuration();
      resetStepCounter();
      currentStep++;
      restartLog += `

${steps[currentStep].step}
${"=".repeat(steps[currentStep].step.length)}

`;
      checkActiveProcessIntervalId = setInterval(checkActiveProcess, 350000); //~ 6 min
      response = await fetch(`${page.url.pathname}/api/stopDB`, postData);
      streamReader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      while (true) {
        const { value, done } = await streamReader.read();
        restartLog += `${value}`;
        if (done) break;
      }
      streamReader?.releaseLock();
      clearInterval(checkActiveProcessIntervalId);
      setStepDuration();
      resetStepCounter();
      currentStep++;
      rebooting = true;
      restartLog += `

${steps[currentStep].step}
${"=".repeat(steps[currentStep].step.length)}

`;
      fetch(`${page.url.pathname}/api/rebootServer`, postData);
      waitIntervalId = setInterval(waitForMinute, 20000);
      while (rebooting) {
        await new Promise((resolve) => {
          setTimeout(resolve, 10000);
        });
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 10000);
      });
      clearInterval(rebootIntervalId);
      setStepDuration();
      resetStepCounter();
      currentStep++;
      restartLog += `

${steps[currentStep].step}
${"=".repeat(steps[currentStep].step.length)}

`;
      response = await fetch(`${page.url.pathname}/api/startDB`, postData);
      streamReader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      while (true) {
        const { value, done } = await streamReader.read();
        restartLog += `${value}`;
        if (done) break;
      }
      streamReader?.releaseLock();
      setStepDuration();
      resetStepCounter();
      currentStep++;
      restartLog += `

${steps[currentStep].step}
${"=".repeat(steps[currentStep].step.length)}

`;
      response = await fetch(`${page.url.pathname}/api/startApp`, postData);
      streamReader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      while (true) {
        const { value, done } = await streamReader.read();
        restartLog += `${value}`;
        if (done) break;
      }
      streamReader?.releaseLock();
      setStepDuration();
      currentStep++;
      if (stepCounterInterval) clearInterval(stepCounterInterval);
      restartLog += `

${steps[currentStep].step}
${"=".repeat(steps[currentStep].step.length)}

`;
      erpRestarting = false;
    }
  };

  onDestroy(() => {
    if (stepCounterInterval) clearInterval(stepCounterInterval);
    if (checkActiveProcessIntervalId)
      clearInterval(checkActiveProcessIntervalId);
    if (rebootIntervalId) clearInterval(rebootIntervalId);
    if (waitIntervalId) clearInterval(waitIntervalId);
  });
  // $inspect(stepCounter);
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
  <div class="flex items-center gap-2 px-4 w-full">
    <Sidebar.Trigger class="-ms-1" />
    <Separator
      orientation="vertical"
      class="me-2 data-[orientation=vertical]:h-4"
    />
    <h1 class="text-lg font-semibold">ERP</h1>
  </div>
</header>

<div
  class="flex flex-col gap-4 px-2 md:px-4 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] border-0 border-red-500 pb-3"
>
  <div
    class="px-3 flex flex-col md:pr-1 md:flex-row gap-3 text-muted-foreground"
  >
    <Button disabled={erpRestarting} onclick={restartERP}>Restart ERP</Button>
    <div>
      Current Step:
      <span class="text-foreground">{steps[currentStep].step}</span>
    </div>
    <div class:hidden={!steps[currentStep].duration}>
      Expoected Duration:
      <span class="text-foreground"
        >{ta
          .ago(Date.now() - 1000 * steps[currentStep].duration)
          .replace(" ago", "")}</span
      >
    </div>
    <span
      class="text-rose-500"
      class:hidden={!steps[currentStep].duration ||
        stepCounter > 30 + steps[currentStep].duration}
      >Operation is taking more time than expected</span
    >
  </div>
  <div class="grid grid-cols-[repeat(5,1fr)_auto] px-3">
    <div
      data-state="done"
      class="flex pr-1 gap-1 justify-center items-center [&_svg]:size-9 md:[&_svg]:size-10 data-[state=active]:[&_svg]:animate-pulse data-[state=done]:[&_svg]:text-indigo-500"
    >
      <Start />
      <Progress
        class=" "
        barClass="bg-indigo-500"
        value={currentStep === 1
          ? Math.min(stepCounter, steps[1].duration)
          : currentStep < 1
            ? -1
            : steps[1].duration}
        max={steps[1].duration}
      />
    </div>
    <div
      data-state={currentStep === 1
        ? "active"
        : currentStep > 1
          ? "done"
          : "waiting"}
      class="flex pr-1 gap-1 justify-center items-center [&_svg]:size-9 md:[&_svg]:size-10 data-[state=active]:[&_svg]:animate-pulse data-[state=done]:[&_svg]:text-indigo-500 data-[state=waiting]:[&_svg]:text-foreground/50"
    >
      <AppStop />
      <Progress
        class=" "
        barClass="bg-indigo-500"
        value={currentStep === 2
          ? Math.min(stepCounter, steps[2].duration)
          : currentStep < 2
            ? -1
            : steps[2].duration}
        max={steps[2].duration}
      />
    </div>
    <div
      data-state={currentStep === 2
        ? "active"
        : currentStep > 2
          ? "done"
          : "waiting"}
      class="flex pr-1 gap-1 justify-center items-center [&_svg]:size-9 md:[&_svg]:size-10 data-[state=active]:[&_svg]:animate-pulse data-[state=done]:[&_svg]:text-indigo-500 data-[state=waiting]:[&_svg]:text-foreground/50"
    >
      <DbStop />
      <Progress
        class=" "
        barClass="bg-indigo-500"
        value={currentStep === 3
          ? Math.min(stepCounter, steps[3].duration)
          : currentStep < 3
            ? -1
            : steps[3].duration}
        max={steps[3].duration}
      />
    </div>
    <div
      data-state={currentStep === 3
        ? "active"
        : currentStep > 3
          ? "done"
          : "waiting"}
      class="flex pr-1 gap-1 justify-center items-center [&_svg]:size-9 md:[&_svg]:size-10 data-[state=active]:[&_svg]:animate-pulse data-[state=done]:[&_svg]:text-indigo-500 data-[state=waiting]:[&_svg]:text-foreground/50"
    >
      <Restart />
      <Progress
        class=" "
        barClass="bg-indigo-500"
        value={currentStep === 4
          ? Math.min(stepCounter, steps[4].duration)
          : currentStep < 4
            ? -1
            : steps[4].duration}
        max={steps[4].duration}
      />
    </div>
    <div
      data-state={currentStep === 4
        ? "active"
        : currentStep > 4
          ? "done"
          : "waiting"}
      class="flex pr-1 gap-1 justify-center items-center [&_svg]:size-9 md:[&_svg]:size-10 data-[state=active]:[&_svg]:animate-pulse data-[state=done]:[&_svg]:text-indigo-500 data-[state=waiting]:[&_svg]:text-foreground/50"
    >
      <Dbstart />
      <Progress
        class=" "
        barClass="bg-indigo-500"
        value={currentStep === 5
          ? Math.min(stepCounter, steps[5].duration)
          : currentStep < 5
            ? -1
            : steps[5].duration}
        max={steps[5].duration}
      />
    </div>
    <div
      data-state={currentStep === 5
        ? "active"
        : currentStep > 5
          ? "done"
          : "waiting"}
      class="flex pr-1 gap-1 justify-center items-center [&_svg]:size-6 md:[&_svg]:size-10 data-[state=active]:[&_svg]:animate-pulse data-[state=done]:[&_svg]:text-indigo-500 data-[state=waiting]:[&_svg]:text-foreground/50"
    >
      <AppStart />
    </div>
  </div>
  <div
    class="border border-blue-5001 md:rounded-lg w-full h-full overflow-auto p-5 scroll-smooth"
    bind:this={scrolpre}
  >
    <pre class="w-full text-wrap">{restartLog}</pre>
  </div>
</div>
