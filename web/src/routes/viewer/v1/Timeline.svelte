<script lang="ts">
  import { createEventDispatcher, tick, onDestroy, onMount } from "svelte";
  import type { LogData } from "@PlumeTypes";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  import d3KitTimeline from "d3kit-timeline";
  import {
    extractVoiceStateChanges,
    generateLabel,
    getColorFromLabel,
  } from "./utils/timeline";
  import { uniqueId } from "lodash";
  import {
    allChartWidths,
    maxWidth,
    scrollOnCursorChange,
    scrollX,
  } from "./store/timelines";
  import { getUserDataDemoFallback } from "./utils/getUserData";
  import _ from "lodash";
  import { getScrollParent } from "../../../utils/dom";

  const dispatch = createEventDispatcher<{ change: number }>();
  const dispatchClose = createEventDispatcher();

  let graphWidth = 0;
  let wrapperWidth: number;

  let chart: d3KitTimeline;

  let timelineWrapper: HTMLDivElement;
  let timeline: HTMLDivElement;
  let dummyTimeline: HTMLDivElement;
  let cursorElement: HTMLDivElement;
  let root: HTMLDivElement;

  let dayStartDate = new Date();
  let dayEndDate = new Date();

  let cursorLeft = 0;

  let uuid = uniqueId("timeline-");

  export let logsData: LogData;
  export let patchFilter = "";
  export let currentPatchIndex = 0;

  $: currentPatch = logsData.timedPatches[currentPatchIndex];

  $: {
    if (timelineWrapper) {
      timelineWrapper.scrollLeft = $scrollX;
    }
  }

  $: {
    if (logsData.timedPatches.length > 0) {
      const firstPatchDate = new Date(logsData.timedPatches[0].timestamp);
      dayStartDate = firstPatchDate;
      const lastPatchDate = new Date(
        logsData.timedPatches[logsData.timedPatches.length - 1].timestamp,
      );
      dayEndDate = new Date(lastPatchDate.getTime());
    }
  }

  $: {
    if (currentPatch) {
      updateCursorPos();
    }
  }

  $: filteredLogs = logsData.timedPatches.filter((log) => {
    if (typeof patchFilter === "string") {
      const memberId: string = patchFilter;
      return (
        log.patches.find((patch) => patch.path.includes(memberId)) !== undefined
      );
    } else {
      return [];
    }
  });

  $: data = filteredLogs.map((timedPatches) => {
    const { voiceStateChangeLabel, patchesHandled } = extractVoiceStateChanges(
      timedPatches.patches,
    );
    const label = generateLabel(
      timedPatches.patches.filter((patch) => !patchesHandled.includes(patch)),
    );
    return {
      time: new Date(timedPatches.timestamp),
      patchIndex: logsData.timedPatches.indexOf(timedPatches) + 1,
      name: voiceStateChangeLabel + label,
    };
  });

  $: {
    filteredLogs;
    tick().then(() => {
      updateGraph();
    });
  }

  // Guard against the feedback-loop cascade:
  // updateGraph writes to $allChartWidths -> $maxWidth changes -> this reactive
  // fires on every timeline -> each one writes back -> repeat. The check ensures
  // we only re-render when $maxWidth genuinely changes, breaking the cycle.
  let lastAppliedMaxWidth = 0;
  $: if ($maxWidth !== lastAppliedMaxWidth) {
    lastAppliedMaxWidth = $maxWidth;
    updateGraph({ updateDummy: false });
  }

  function dispatchEvent(patchIndex: number) {
    dispatch("change", patchIndex);
  }

  function updateCursorPos() {
    if (currentPatch === undefined) {
      return;
    }
    const currentPatchDate = new Date(currentPatch.timestamp);
    const percentageOfDay =
      (currentPatchDate.getTime() - dayStartDate.getTime()) /
      (dayEndDate.getTime() - dayStartDate.getTime());

    cursorLeft =
      (parseInt(timeline?.querySelector("svg")?.getAttribute("width") ?? "40") -
        40) *
      percentageOfDay;

    tick().then(() => {
      syncScrollWithSlider();
    });
  }

  $: {
    $scrollOnCursorChange;
    syncScrollWithSlider();
  }

  function syncScrollWithSlider() {
    if (root && cursorElement && $scrollOnCursorChange) {
      // Scroll to the cursor element by cancel out vertical scrolling since there might by other cursord outside viewport
      const scrollRoot = getScrollParent(root);
      const beforeScroll = scrollRoot?.scrollTop || 0;

      cursorElement.scrollIntoView({
        inline: "center",
        block: "nearest",
      });

      if (scrollRoot && scrollRoot.scrollTop != undefined) {
        scrollRoot.scrollTop = beforeScroll;
      }
    }
  }

  function color5(d: any) {
    return getColorFromLabel(d.name);
  }

  /**
   * Updating the graph.
   * The dummy is used to get the actual graph's width since d3KitTimeline does not properly resize
   * @param updateDummy
   */
  function updateGraph({
    updateDummy = false,
  }: { updateDummy?: boolean } = {}) {
    if (!timeline || !dummyTimeline) {
      return;
    }
    if (updateDummy === false) {
      timeline.innerHTML = "";
      dummyTimeline.innerHTML = "";
      updateGraph({ updateDummy: true });
    }

    let chartWidth =
      graphWidth + 100 < wrapperWidth ? wrapperWidth - 100 : graphWidth + 200;

    if (updateDummy === false) {
      $allChartWidths[uuid] = chartWidth;

      chartWidth = $maxWidth;
    }

    const newChart = new d3KitTimeline(
      `#${uuid}-${updateDummy ? "timeline-dummy-graph" : "timeline-graph"}`,
      {
        direction: "up",
        initialWidth: chartWidth,
        formatAxis: (axis: any) =>
          axis.tickFormat((d: Date) => {
            return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
          }),
        domain: [dayStartDate, dayEndDate],
        margin: { left: 20, right: 20, top: 20, bottom: 30 },
        textFn: (d: any) => d.name,
        layerGap: 40,
        dotColor: color5,
        labelBgColor: color5,
        linkColor: color5,
        labella: {
          minPos: 0,
          maxPos: chartWidth - 100,
          nodeSpacing: 10,
          algorithm: "none",
        },
				textYOffset: "0.95em",
      },
    );

    newChart.on("labelClick", (element: { data: (typeof data)[0] }) => {
      dispatchEvent(element.data.patchIndex);
    });

    newChart.data(data).updateDimensionNow().resizeToFit().visualize();
    if (updateDummy) {
      graphWidth =
        newChart.svg.selectAll(".main-layer").node().getBoundingClientRect()
          .width || graphWidth;
    } else {
      chart = newChart;
      updateCursorPos();
      timelineWrapper.scrollLeft = $scrollX;
    }
  }

  function onTimelineScrollEvent(event: Event) {
    $scrollX = (event.target as HTMLDivElement).scrollLeft;
  }

  onDestroy(() => {
    delete $allChartWidths[uuid];
    $allChartWidths = $allChartWidths;
  });

  onMount(() => {
    updateCursorPos();
  });
</script>

<div class="timeline" bind:this={root}>
  <div class="close-btn"
    on:click={() => dispatchClose("close")}
    on:keypress={() => {
      void 0;
    }}
    tabindex="0"
    role="button"
  >
    <svg
      class="close-icon"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
      />
    </svg>
  </div>
  <div class="user-panel">
    {#await getUserDataDemoFallback(patchFilter)}
      <span class="timeline-username">{patchFilter}</span>
    {:then userData}
      <div class="user-inner">
        <div
          class="user-avatar"
          style:background-image={"url(" + userData.avatar.link + ")"}
        >
          <!-- <img class="aspect-square" style="" src={userData.avatar.link} alt="user avatar" /> -->
        </div>
        <span class="timeline-username">{userData.global_name}</span>
      </div>
    {:catch error}
      <span class="timeline-username">error: {patchFilter}</span>
    {/await}
  </div>
  <div
    class="timeline-wrapper"
    bind:clientWidth={wrapperWidth}
    bind:this={timelineWrapper}
    on:scroll={onTimelineScrollEvent}
  >
    <div class="timeline-container" style:width="{graphWidth + 100}px">
      <div
        class="timeline-graph"
        id={uuid + "-timeline-graph"}
        bind:this={timeline}
        bind:clientWidth={graphWidth}
      />

      <!-- Values are fine tuned from various tests, no idea why d3kit-timeline fucks up dimensions so much -->
      <div
        class="cursor-wrapper"
        bind:this={cursorElement}
        style:left="{cursorLeft}px"
      />

      <div
        class="timeline-dummy-graph"
        id={uuid + "-timeline-dummy-graph"}
        bind:this={dummyTimeline}
      />
    </div>
  </div>
</div>

<style>
  /* ── Timeline card ────────────────────────────── */
  .timeline {
    width: 100%;
    height: 125px;
    overflow-y: hidden;
    display: flex;
    align-items: center;
    background: var(--bg-overlay);
  }

  /* ── Close button ─────────────────────────────── */
  .close-btn {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0.375rem;
    cursor: pointer;
    color: var(--text-muted);
    transition: color var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: var(--radius-sm);
  }

  .close-btn:hover {
    color: var(--text-primary);
  }

  .close-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  /* ── User panel (avatar + name) ───────────────── */
  .user-panel {
    width: 9rem;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .user-avatar {
    height: 75%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    width: 100%;
  }

  .timeline-username {
    margin: 0.375rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 8rem;
  }

  .user-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  /* ── Scroll wrapper ───────────────────────────── */
  .timeline-wrapper {
    margin-bottom: 0.75rem;
    overflow-x: auto;
    overflow-y: hidden;
    flex: 1;
    /* Thin scrollbar inside timeline */
    scrollbar-width: thin;
    scrollbar-color: var(--bg-hover) transparent;
  }

  .timeline-wrapper::-webkit-scrollbar { height: 3px; }
  .timeline-wrapper::-webkit-scrollbar-thumb { background: var(--bg-hover); border-radius: 2px; }

  /* ── Container + cursor ───────────────────────── */
  .timeline-container {
    position: relative;
  }

  .cursor-wrapper {
    position: absolute;
    pointer-events: none;
    top: 0;
    height: 100%;
    margin-left: 20px;
    margin-right: 20px;
    border-left: 2px solid var(--accent);
    opacity: 0.7;
  }

  .timeline-graph {
    display: inline-block;
  }

  .timeline-dummy-graph {
    visibility: hidden;
    height: 0;
  }

  /* ── D3Kit timeline SVG overrides ─────────────── */
  :global(.timeline svg text) {
    fill: var(--text-secondary);
  }

  :global(.timeline svg .axis path),
  :global(.timeline svg .axis line) {
    stroke: var(--border);
  }
</style>
