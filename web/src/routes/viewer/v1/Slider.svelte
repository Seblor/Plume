<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { LogData } from "@PlumeTypes";

  const UTCOffset = new Date().getTimezoneOffset() * 60e3;
  const dispatch = createEventDispatcher<{ change: number }>();

  export let currentPatchIndex = 0;
  export let logsData: LogData;

  $: maxPatch = logsData.timedPatches.length;
  $: firstPatchTime =
    logsData.timedPatches.length > 0
      ? formatTime(new Date(logsData.timedPatches[0].timestamp + UTCOffset))
      : "loading";
  $: lastPatchTime =
    logsData.timedPatches.length > 0
      ? formatTime(
          new Date(logsData.timedPatches.at(-1)!.timestamp + UTCOffset),
        )
      : "loading";
  $: currentTime = logsData.timedPatches[currentPatchIndex]
    ? formatTime(
        new Date(
          logsData.timedPatches[currentPatchIndex].timestamp + UTCOffset,
        ),
      )
    : "loading";
  $: sliderLeftPos = `calc(${(currentPatchIndex / maxPatch) * 99}% + 7px)`;

  function dispatchEvent(el: Event) {
    dispatch("change", parseInt((el.target as HTMLInputElement).value));
  }

  function goToEarlierPatch(el: Event) {
    const userInputTime = (el.target as HTMLInputElement).value;
    const lastPatchIndex = logsData.timedPatches.findLastIndex((patch) => {
      const patchTime = formatTime(new Date(patch.timestamp + UTCOffset));
      return patchTime < userInputTime;
    });
    dispatch("change", lastPatchIndex);
  }

  function formatTime(time: Date) {
    const date = new Date(time);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
  }
</script>

<div class="slider">
  <!-- Step back -->
  <button
    class="step-btn"
    class:disabled={currentPatchIndex === 0}
    aria-label="Previous event"
    on:click={() => dispatch("change", Math.max(0, currentPatchIndex - 1))}
  >
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 12 16"
    >
      <path
        d="M10.819.4a1.974 1.974 0 0 0-2.147.33l-6.5 5.773A2.014 2.014 0 0 0 2 6.7V1a1 1 0 0 0-2 0v14a1 1 0 1 0 2 0V9.3c.055.068.114.133.177.194l6.5 5.773a1.982 1.982 0 0 0 2.147.33A1.977 1.977 0 0 0 12 13.773V2.227A1.977 1.977 0 0 0 10.819.4Z"
      />
    </svg>
  </button>

  <!-- Track + tooltip -->
  <div class="track-wrap">
    <div class="track-area">
      <div class="tooltip-wrap" style:left={sliderLeftPos}>
        <input
          type="time"
          accept="hh:mm:ss"
          step="1"
          on:change={goToEarlierPatch}
          value={currentTime}
          class="tooltip-input"
        />
        <div class="tooltip-caret" aria-hidden="true" />
      </div>
      <input
        class="range-input"
        type="range"
        min="0"
        max={maxPatch}
        value={currentPatchIndex}
        on:input={dispatchEvent}
      />
    </div>
    <div class="time-labels">
      <span class="time-label">{firstPatchTime}</span>
      <span class="time-label">{lastPatchTime}</span>
    </div>
  </div>

  <!-- Step forward -->
  <button
    class="step-btn"
    class:disabled={currentPatchIndex === maxPatch}
    aria-label="Next event"
    on:click={() =>
      dispatch("change", Math.min(maxPatch, currentPatchIndex + 1))}
  >
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 12 16"
    >
      <path
        d="M11 0a1 1 0 0 0-1 1v5.7a2.028 2.028 0 0 0-.177-.194L3.33.732A2 2 0 0 0 0 2.227v11.546A1.977 1.977 0 0 0 1.181 15.6a1.982 1.982 0 0 0 2.147-.33l6.5-5.773A1.88 1.88 0 0 0 10 9.3V15a1 1 0 1 0 2 0V1a1 1 0 0 0-1-1Z"
      />
    </svg>
  </button>
</div>

<style>
  .slider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
  }

  /* ── Step buttons ────────────────────────────── */
  .step-btn {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-overlay);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition:
      background var(--transition),
      color var(--transition),
      border-color var(--transition);
    padding: 0;
  }

  .step-btn svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  .step-btn:hover:not(.disabled) {
    background: var(--bg-hover);
    color: var(--text-primary);
    border-color: var(--border-focus);
  }

  .step-btn.disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  /* ── Track wrapper ───────────────────────────── */
  .track-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .track-area {
    position: relative;
    display: flex;
    align-items: center;
  }

  /* ── Tooltip ─────────────────────────────────── */
  .tooltip-wrap {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
		margin-top: -3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
    z-index: 10;
  }

  .tooltip-input {
    pointer-events: auto;
    font-size: 0.6875rem;
    font-family: "Fira Mono", "Consolas", monospace;
    color: var(--text-primary);
    background: var(--bg-overlay);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.1875rem 0.5rem;
    width: 7rem;
    text-align: center;
    cursor: text;
    transition:
      border-color var(--transition),
      background var(--transition);
    -webkit-appearance: none;
    appearance: none;
  }

  .tooltip-input:hover,
  .tooltip-input:focus {
    outline: none;
    border-color: var(--border-focus);
    background: var(--bg-hover);
  }

  /* Caret pointing down toward thumb */
  .tooltip-caret {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid var(--border);
    margin-top: 1px;
  }

  /* ── Range track ────────────────────────────── */
  .range-input {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: var(--bg-hover);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
    border: none;
  }

  .range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid var(--bg-base);
    box-shadow: 0 0 6px rgba(229, 62, 62, 0.5);
    transition:
      box-shadow var(--transition),
      transform var(--transition);
  }

  .range-input::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid var(--bg-base);
    box-shadow: 0 0 6px rgba(229, 62, 62, 0.5);
    transition:
      box-shadow var(--transition),
      transform var(--transition);
  }

  .range-input:hover::-webkit-slider-thumb {
    box-shadow: 0 0 10px rgba(229, 62, 62, 0.75);
    transform: scale(1.2);
  }

  .range-input:hover::-moz-range-thumb {
    box-shadow: 0 0 10px rgba(229, 62, 62, 0.75);
    transform: scale(1.2);
  }

  /* ── Time labels ────────────────────────────── */
  .time-labels {
    display: flex;
    justify-content: space-between;
  }

  .time-label {
    font-size: 0.6875rem;
    height: 0;
    font-family: "Fira Mono", "Consolas", monospace;
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }
</style>
