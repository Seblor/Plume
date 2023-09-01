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
			? formatTime(new Date(logsData.timedPatches.at(-1)!.timestamp + UTCOffset))
			: "loading";
	$: currentTime = logsData.timedPatches[currentPatchIndex]
		? formatTime(new Date(logsData.timedPatches[currentPatchIndex].timestamp + UTCOffset))
		: "loading";
	$: sliderLeftPos = `calc(${(currentPatchIndex / maxPatch) * 99}% + 7px)`;

	function dispatchEvent(el: Event) {
		dispatch("change", parseInt((el.target as HTMLInputElement).value));
	}

	function goToEarlierPatch(el: Event) {
		const userInputTime = (el.target as HTMLInputElement).value;
		const lastPatchIndex = logsData.timedPatches.findLastIndex((patch) => {
			const patchTime = formatTime(new Date(patch.timestamp + UTCOffset));
			if (patchTime < userInputTime) {
				return true;
			}
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
	<div class="relative flex">
		<span class="hour absolute mt-11 left-0">{firstPatchTime}</span>
		<svg
			class="w-10 h-10 text-gray-800 dark:text-white cursor-pointer"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
			viewBox="0 0 12 16"
			on:click={() => {
				dispatch("change", currentPatchIndex - 1);
			}}
		>
			<path
				d="M10.819.4a1.974 1.974 0 0 0-2.147.33l-6.5 5.773A2.014 2.014 0 0 0 2 6.7V1a1 1 0 0 0-2 0v14a1 1 0 1 0 2 0V9.3c.055.068.114.133.177.194l6.5 5.773a1.982 1.982 0 0 0 2.147.33A1.977 1.977 0 0 0 12 13.773V2.227A1.977 1.977 0 0 0 10.819.4Z"
			/>
		</svg>
	</div>
	<div class="slider-container flex">
		<div class="slider-tooltip-wrapper" style:left={sliderLeftPos}>
			<input
				type="time"
				accept="hh:mm:ss"
				step="1"
				on:change={goToEarlierPatch}
				value={currentTime}
				class="hour slider-tooltip"
				contenteditable="true"
			/>
		</div>
		<input
			type="range"
			name=""
			min="0"
			max={maxPatch}
			value={currentPatchIndex}
			on:input={dispatchEvent}
		/>
	</div>
	<div class="relative flex">
		<span class="hour absolute mt-11 right-0">{lastPatchTime}</span>
		<svg
			class="w-10 h-10 text-gray-800 dark:text-white cursor-pointer"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
			viewBox="0 0 12 16"
			on:click={() => {
				dispatch("change", currentPatchIndex + 1);
			}}
		>
			<path
				d="M11 0a1 1 0 0 0-1 1v5.7a2.028 2.028 0 0 0-.177-.194L3.33.732A2 2 0 0 0 0 2.227v11.546A1.977 1.977 0 0 0 1.181 15.6a1.982 1.982 0 0 0 2.147-.33l6.5-5.773A1.88 1.88 0 0 0 10 9.3V15a1 1 0 1 0 2 0V1a1 1 0 0 0-1-1Z"
			/>
		</svg>
	</div>
</div>

<style lang="scss">
	.slider {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 3rem;

		&-tooltip {
			&-wrapper {
				position: absolute;
				top: -3rem;
				transform: translateX(-50%);
				width: 7.5rem !important;
				white-space: nowrap;
			}

			&::after {
				content: "";
				transform: translateX(-50%);
				position: absolute;
				top: 100%;
				left: 50%;
				width: 0;
				height: 0;
				border-right: solid 10px transparent;
				border-left: solid 10px transparent;
				border-top: solid 10px black;
			}
		}

		&-container {
			position: relative;
			width: 100%;
		}

		.hour {
			padding: 0.25rem 0.5rem;
			border: 1px solid grey;
			border-radius: 5px;
		}

		input {
			width: 100%;
		}
	}
</style>
