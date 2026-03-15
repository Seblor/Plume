<svelte:options accessors={true} />

<script lang="ts">
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import Channel from "./components/Channel.svelte";
  import {
    PlumeChannelType,
    type ChannelState,
    type LogData,
  } from "@PlumeTypes";
  import jsonPatch from "fast-json-patch";
  import Slider from "./Slider.svelte";
  import Timeline from "./Timeline.svelte";
  import { Button, Checkbox, Input } from "flowbite-svelte";
  import { flip } from "svelte/animate";
  import { slide } from "svelte/transition";
  import _ from "lodash";
  import pako from "pako";
  import { showTextChannels } from "./store/channelsList";
  import { IDsToShow, scrollOnCursorChange } from "./store/timelines";

  let logfile = "unknown";
  let channelsData: LogData = {
    meta: {
      from: 0,
      to: 0,
      guildId: "",
      guildName: "",
      logVersion: 0,
    },
    initialState: [],
    timedPatches: [],
  };
  let snapshots: Record<number, LogData> = {};

  let currentPatchIndex = 0;

  let inputUserId: string;

  let previewState: ChannelState[] = [];

  $: appErrorMessage = "";

  $: idInputErrorMessage = "";

  $: searchParams = (browser && $page.url.searchParams) || null;
  let previousLogfileParam: string | null = null;

  $: selectedUserId = "";

  $: if (searchParams && searchParams.get("logfile") !== previousLogfileParam) {
    IDsToShow.set([]); // Resetting the list of user timelines to show
    previousLogfileParam = searchParams.get("logfile");
    logfile = getLogFile($page.url.search) || "unknown";
    if (logfile === "demo") {
      import("./demo/demo.json").then((demoData) => {
        channelsData = demoData as LogData;
        previewState = (demoData as LogData).initialState;
        createSnapshots();
      });
    } else {
      fetch(`https://query.plume.red/direct?url=${encodeURIComponent(logfile)}`)
        .then((res) => {
          if (res.status === 404) {
            appErrorMessage = "This log file does not exist";
            throw new Error(appErrorMessage);
          } else if (res.status === 200) {
            appErrorMessage = "";
            return res.text();
          } else {
            appErrorMessage = "An error occured";
            throw new Error(appErrorMessage);
          }
        })
        .then((data) => {
          return new Promise<LogData>((resolve, reject) => {
            const decompressedDataRaw = pako.inflate(
              Uint8Array.from(
                atob(data)
                  .split("")
                  .map((c) => c.charCodeAt(0)),
              ),
              { to: "string" },
            );
            let decompressedData = {};
            try {
              decompressedData = JSON.parse(decompressedDataRaw);
            } catch (error) {
              appErrorMessage = "Wrong data format";
              reject(new Error(appErrorMessage));
            }
            if (
              "initialState" in decompressedData &&
              "timedPatches" in decompressedData
            ) {
              resolve(decompressedData as unknown as LogData);
            } else {
              appErrorMessage = "Wrong data format";
              reject(new Error(appErrorMessage));
            }
          });
        })
        .then((data) => {
          if (data.meta.logVersion !== 1) {
            appErrorMessage =
              "This log file is not compatible with this visualizer";
            throw new Error(appErrorMessage);
          }
          // For developers who want to access the decompressed data
          if (window) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any)["plumeData"] = _.cloneDeep(data);
          }
          channelsData = data;
          previewState = data.initialState;
          createSnapshots();
        })
        .catch((err: Error) => {
          appErrorMessage ||= "An error occured";
          console.error(err);
        });
    }
  }

  $: usersIds = Array.from(
    new Set(
      channelsData.initialState
        .flatMap((channel) => {
          if (channel.data.channelType === PlumeChannelType.VOICE) {
            return Object.keys(channel.data.members);
          } else if (channel.data.channelType === PlumeChannelType.CATEGORY) {
            return Object.values(channel.data.channels).flatMap(
              (subChannel) => {
                if (subChannel.data.channelType === PlumeChannelType.VOICE) {
                  return Object.keys(subChannel.data.members);
                }
              },
            );
          }
        })
        .concat(
          channelsData.timedPatches.flatMap((timedPatch) =>
            timedPatch.patches.flatMap((patch) => {
              return patch.path.match(/\/members\/((?:demo-)?\d+)/)?.[1] || [];
            }),
          ),
        )
        .filter((userId): userId is string => Boolean(userId)),
    ),
  );

  async function applyPatches(patchesCount: CustomEvent<number>) {
    const previousSnapshot = _.cloneDeep(
      snapshots[Math.floor(patchesCount.detail / 100)],
    );

    previewState = previousSnapshot.initialState;

    jsonPatch.applyPatch(
      previousSnapshot.initialState,
      previousSnapshot.timedPatches
        .slice(0, patchesCount.detail % 100)
        .flatMap((timedPatch) => timedPatch.patches),
    );

    previewState = previousSnapshot.initialState;
    currentPatchIndex = patchesCount.detail;
  }

  function createSnapshots() {
    // Creating snapshots every 100 patches
    let snapshotIndex = 0;
    for (let i = 0; i < channelsData.timedPatches.length; i += 100) {
      const patchesBeforeSnapshot = _.cloneDeep(
        channelsData.timedPatches.slice(0, i),
      );
      const snapshot: LogData = {
        meta: _.cloneDeep(channelsData.meta),
        initialState: _.cloneDeep(channelsData.initialState),
        timedPatches: _.cloneDeep(channelsData.timedPatches.slice(i, i + 100)),
      };
      jsonPatch.applyPatch(
        snapshot.initialState,
        patchesBeforeSnapshot.flatMap((timedPatch) => timedPatch.patches),
      );
      snapshots[snapshotIndex] = snapshot;
      snapshotIndex++;
    }
  }

  // Drag and drop (courtesy of https://svelte.dev/repl/3bf15c868aa94743b5f1487369378cf3?version=3.21.0)
  let hovering = -1;
  let dragGhost: HTMLElement | null = null;

  const drop = (event: DragEvent, index: number) => {
    if (event.dataTransfer === null) {
      return;
    }
    event.dataTransfer.dropEffect = "move";
    const start = parseInt(event.dataTransfer.getData("text/plain"));
    const newTimelinesList = [...$IDsToShow];

    if (start < index) {
      newTimelinesList.splice(index + 1, 0, newTimelinesList[start]);
      newTimelinesList.splice(start, 1);
    } else {
      newTimelinesList.splice(index, 0, newTimelinesList[start]);
      newTimelinesList.splice(start + 1, 1);
    }
    $IDsToShow = newTimelinesList;
    hovering = -1;
  };

  const dragstart = (event: DragEvent, index: number) => {
    if (event.dataTransfer === null) {
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData("text/plain", String(index));

    // Create a 1×1 invisible ghost so the browser never snapshots the live
    // DOM. We keep a reference and remove it in dragend — NOT via setTimeout,
    // which can be skipped under load and lets ghosts accumulate.
    dragGhost?.remove();
    dragGhost = document.createElement("div");
    dragGhost.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(dragGhost);
    event.dataTransfer.setDragImage(dragGhost, 0, 0);
  };

  const dragend = () => {
    dragGhost?.remove();
    dragGhost = null;
    hovering = -1;
  };

  function getLogFile(searchParamsStr: string): string {
    return searchParamsStr.replace("?logfile=", "");
  }
</script>

<svelte:head>
  <title>{searchParams?.get("logfile") ? "Viewer" : "Demo"}</title>
  <meta name="description" content="Logs visualizer" />
</svelte:head>

{#if appErrorMessage !== ""}
  <div class="error-state">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      />
    </svg>
    <h2>{appErrorMessage}</h2>
  </div>
{:else}
  <div class="visualizer">
    <!-- ── Channels sidebar ──────────────────────────────── -->
    <aside class="channels-sidebar scrollbar">
      {#if !searchParams}
        <div class="sidebar-loading">
          <span>Loading…</span>
        </div>
      {:else}
        <div class="sidebar-header">
          <h2 class="guild-name" title="Server name">
            {channelsData.meta.guildName || "Server"}
          </h2>
          <div class="toggle-label">
            <Checkbox class="my-0" bind:checked={$showTextChannels}
              >Display text channels</Checkbox
            >
          </div>
        </div>
        <div class="channels-list">
          {#each previewState as channelData}
            <Channel {channelData} />
          {/each}
        </div>
      {/if}
    </aside>

    <!-- ── Main content area ────────────────────────────── -->
    <div class="main-panel">
      <!-- Add timeline bar -->
      <div class="add-timeline-bar">
        <div class="toggle-label">
          <Checkbox class="my-0" bind:checked={$scrollOnCursorChange}
            >Scroll timelines with slider</Checkbox
          >
        </div>

        <div class="add-timeline-controls">
          {#if idInputErrorMessage}
            <span class="input-error">{idInputErrorMessage}</span>
          {/if}
          <div class="input-row">
            <Input
              size="sm"
              list="usersIds"
              id="userId"
              name="userId"
              placeholder="User ID"
              bind:value={inputUserId}
              class="timeline-input"
            />
            <datalist id="usersIds">
              {#each usersIds as userId}
                <option value={userId}>{userId}</option>
              {/each}
            </datalist>
          </div>
          <Button
            class="add-btn"
            color="green"
            on:click={() => {
              if ($IDsToShow.includes(inputUserId)) {
                idInputErrorMessage = "This user ID is already in the list";
                inputUserId = "";
              } else if (usersIds.includes(inputUserId)) {
                idInputErrorMessage = "";
                selectedUserId = inputUserId;
                inputUserId = "";
                $IDsToShow = [...$IDsToShow, selectedUserId];
              } else {
                idInputErrorMessage = "Could not find this user ID in the logs";
              }
            }}>Add timeline</Button
          >
        </div>
      </div>

      <!-- Timelines list -->
      <div class="timelines-area scrollbar">
        {#each $IDsToShow as userToCheck, index (userToCheck)}
          <div
            class="timeline-card"
            animate:flip={{ duration: 300, delay: 0 }}
            transition:slide
            role="listitem"
            draggable={true}
            on:dragstart={(event) => dragstart(event, index)}
            on:dragend={dragend}
            on:drop|preventDefault={(event) => drop(event, index)}
            on:dragover={(e) => {
              e.preventDefault();
            }}
            on:dragenter={() => (hovering = index)}
            class:is-dragging-over={hovering === index}
          >
            <Timeline
              patchFilter={userToCheck}
              logsData={channelsData}
              {currentPatchIndex}
              on:close={() =>
                ($IDsToShow = $IDsToShow.filter(
                  (userId) => userId !== userToCheck,
                ))}
              on:change={applyPatches}
            />
          </div>
        {/each}
      </div>

      <!-- Slider -->
      <div class="slider-area">
        <Slider
          logsData={channelsData}
          {currentPatchIndex}
          on:change={applyPatches}
        />
      </div>
    </div>
  </div>
{/if}

<style>
  /* ── Viewer root ─────────────────────────────────────────── */
  .visualizer {
    display: flex;
    height: 100%;
    min-height: 0;
    gap: 0;
  }

  /* ── Error state ─────────────────────────────────────────── */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 1rem;
    color: var(--text-secondary);
  }

  .error-state svg {
    color: var(--accent);
    opacity: 0.8;
  }

  /* ── Sidebar ─────────────────────────────────────────────── */
  .channels-sidebar {
    width: 280px;
    min-width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    border-right: 1px solid var(--border);
    overflow-y: auto;
  }

  .sidebar-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    background: var(--bg-surface);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .guild-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  .channels-list {
    padding: 0.5rem 0;
  }

  /* ── Main panel ──────────────────────────────────────────── */
  .main-panel {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* Add-timeline bar */
  .add-timeline-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 1rem;
    border-bottom: 1px solid var(--border);
    background: var(--bg-surface);
    flex-shrink: 0;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .add-timeline-controls {
    display: flex;
		align-items: baseline;
    gap: 0.5em;
  }

  .input-row {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .input-error {
    font-size: 0.75rem;
    color: var(--accent);
    font-weight: 500;
    margin-top: 0.25rem;
    height: 1rem;
  }

  /* Toggle labels */
  :global(.toggle-label) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    cursor: pointer;
    user-select: none;
  }

  /* Timelines area */
  .timelines-area {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .timeline-card {
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--bg-surface);
    overflow: hidden;
    transition:
      border-color var(--transition),
      box-shadow var(--transition);
  }

  .timeline-card.is-dragging-over {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-muted);
  }

  /* Slider */
  .slider-area {
    flex-shrink: 0;
    padding: 0.5rem 1rem 0.75rem;
    border-top: 1px solid var(--border);
    background: var(--bg-surface);
  }
</style>
