<script lang="ts">
	import { createEventDispatcher, tick, onDestroy, onMount } from "svelte";
	import type { LogData } from "@PlumeTypes";
	//@ts-ignore
	import d3KitTimeline from "d3kit-timeline";
	import {
		extractVoiceStateChanges,
		generateLabel,
		getColorFromLabel,
	} from "./utils/timeline";
	import { uniqueId } from "lodash";
	import { allChartWidths, maxWidth, scrollX } from "./store/timelines";
	import { getUserDataDemoFallback } from "./utils/getUserData";

	const dispatch = createEventDispatcher<{ change: number }>();
	const dispatchClose = createEventDispatcher();

	let graphWidth = 0;
	let wrapperWidth: number;

	let chart: d3KitTimeline;

	let timelineWrapper: HTMLDivElement;
	let timeline: HTMLDivElement;
	let dummyTimeline: HTMLDivElement;

	let dayStartDate = new Date();
	let dayEndDate = new Date();

	let cursorLeft = 0;

	let uuid = uniqueId("timeline-");

	export let logsData: LogData;
	export let patchFilter: string = "";
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
			firstPatchDate.setHours(0, 0, 0, 0);
			dayStartDate = firstPatchDate;
			dayEndDate = new Date(firstPatchDate.getTime() + 24 * 60 * 60 * 1000);
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
			timedPatches.patches
		);
		const label = generateLabel(
			timedPatches.patches.filter((patch) => !patchesHandled.includes(patch))
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

	$: {
		$maxWidth;
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
			}
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

<div class="timeline relative rounded-2xl">
	<div
		class="absolute top-0 left-0 cursor-pointer m-2"
		on:click={() => dispatchClose("close")}
		on:keypress={() => {}}
		tabindex="0"
		role="button"
	>
		<svg
			class="w-4 h-4 text-gray-800 dark:text-white"
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
	<div class="w-40 flex justify-center align-center h-full">
		{#await getUserDataDemoFallback(patchFilter)}
			<span class="timeline-user">{patchFilter}</span>
		{:then userData}
			<div class="flex flex-col m-0 p-0 h-full w-full text-center">
				<div
					class="h-3/4 bg-no-repeat bg-center bg-cover"
					style:background-image={"url(" + userData.avatar.link + ")"}
				>
					<!-- <img class="aspect-square" style="" src={userData.avatar.link} alt="user avatar" /> -->
				</div>
				<span class="timeline-user">{userData.global_name}</span>
			</div>
		{:catch error}
			<span class="timeline-user">error: {patchFilter}</span>
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

			<div class="cursor-wrapper">
				<!-- Values are fine tuned from various tests, no idea why d3kit-timeline fucks up dimensions so much -->
				<div
					class="cursor border border-primary-full"
					style:left="{cursorLeft}px"
				/>
			</div>

			<div
				class="timeline-dummy-graph"
				id={uuid + "-timeline-dummy-graph"}
				bind:this={dummyTimeline}
			/>
		</div>
	</div>
</div>

<style lang="scss">
	.timeline {
		width: 100%;
		height: 125px;
		overflow-y: hidden;
		display: flex;
		align-items: center;
		background-color: rgba(255, 255, 255, 0.1);
		// box-shadow: 0 0 10px 5px rgba(255, 255, 255, 0.1);

		&-user {
			margin: 0.5rem;
		}

		&-wrapper {
			margin-bottom: 1rem;
			overflow-x: auto;
			overflow-y: hidden;
			flex: 1;
		}

		&-container {
			position: relative;

			.cursor {
				position: absolute;
				top: 0px;
				height: 100%;
				width: 0px;
				// border: 1px solid #777;
			}

			.cursor-wrapper {
				position: absolute;
				pointer-events: none;
				top: 0px;
				height: 100%;
				left: 20px;
				right: 20px;
			}
		}

		&-graph {
			display: inline-block;
			// border: 1px solid #ccc;
		}

		&-dummy-graph {
			visibility: hidden;
			height: 0px;
		}
	}
</style>
