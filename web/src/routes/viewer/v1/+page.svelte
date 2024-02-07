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
		previousLogfileParam = searchParams.get("logfile");
		logfile = getLogFile($page.url.search) || "unknown";
		if (logfile === "demo") {
			import("./demo/demo.json").then((demoData) => {
				channelsData = demoData as LogData;
				previewState = (demoData as LogData).initialState;
				createSnapshots();
			});
		} else {
			fetch(`https://query.plume.red/direct?url=${logfile}`)
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
									.map((c) => c.charCodeAt(0))
							),
							{ to: "string" }
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
					// For developpers who want to access the decompressed data
					if (window) {
						window["plumeData"] = _.cloneDeep(data);
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
							}
						);
					}
				})
				.concat(
					channelsData.timedPatches.flatMap((timedPatch) =>
						timedPatch.patches.flatMap((patch) => {
							return patch.path.match(/\/members\/((?:demo-)?\d+)/)?.[1] || [];
						})
					)
				)
				.filter((userId): userId is string => Boolean(userId))
		)
	);

	async function applyPatches(patchesCount: CustomEvent<number>) {
		const previousSnapshot = _.cloneDeep(
			snapshots[Math.floor(patchesCount.detail / 100)]
		);

		previewState = previousSnapshot.initialState;

		jsonPatch.applyPatch(
			previousSnapshot.initialState,
			previousSnapshot.timedPatches
				.slice(0, patchesCount.detail % 100)
				.flatMap((timedPatch) => timedPatch.patches)
		);

		previewState = previousSnapshot.initialState;
		currentPatchIndex = patchesCount.detail;
	}

	function createSnapshots() {
		// Creating snapshots every 100 patches
		let snapshotIndex = 0;
		for (let i = 0; i < channelsData.timedPatches.length; i += 100) {
			const patchesBeforeSnapshot = _.cloneDeep(
				channelsData.timedPatches.slice(0, i)
			);
			const snapshot: LogData = {
				meta: _.cloneDeep(channelsData.meta),
				initialState: _.cloneDeep(channelsData.initialState),
				timedPatches: _.cloneDeep(channelsData.timedPatches.slice(i, i + 100)),
			};
			jsonPatch.applyPatch(
				snapshot.initialState,
				patchesBeforeSnapshot.flatMap((timedPatch) => timedPatch.patches)
			);
			snapshots[snapshotIndex] = snapshot;
			snapshotIndex++;
		}
	}

	// Drag and drop (courtesy of https://svelte.dev/repl/3bf15c868aa94743b5f1487369378cf3?version=3.21.0)
	let hovering = -1;

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
		const start = index;
		event.dataTransfer.setData("text/plain", String(start));
	};

	function getLogFile(searchParamsStr: string): string {
		return searchParamsStr.replace('?logfile=', '')
	}
</script>

<svelte:head>
	<title>{searchParams?.get("logfile") ? "Viewer" : "Demo"}</title>
	<meta name="description" content="Logs visualizer" />
</svelte:head>

{#if appErrorMessage !== ""}
	<h1>{appErrorMessage}</h1>
{:else}
	<div class="visualizer">
		<div class="channels-list scrollbar">
			{#if !searchParams}
				<h1>Loading</h1>
			{:else}
				<h1 title="Server name">{channelsData.meta.guildName}</h1>
				<div class="flex justify-center">
					<Checkbox class="my-2" bind:checked={$showTextChannels}
						>Show text channels</Checkbox
					>
				</div>
				{#each previewState as channelData}
					<Channel {channelData} />
				{/each}
			{/if}
		</div>

		<div class="new-timeline flex-col mb-4 relative">
			<div class="absolute left-2">
				<Checkbox class="my-2" bind:checked={$scrollOnCursorChange}
					>Synchronize timelines with slider?</Checkbox
				>
			</div>
			<h1>User timelines</h1>
			<div class="flex">
				<Input
					list="usersIds"
					id="userId"
					name="userId"
					placeholder="User ID"
					bind:value={inputUserId}
				/>
				<datalist id="usersIds">
					{#each usersIds as userId}
						<option value={userId}>{userId}</option>
					{/each}
				</datalist>

				<Button
					class="btn ml-2 break-keep whitespace-nowrap"
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
					}}
				>
					Add timeline
				</Button>
			</div>
			<span class="h-2 text-red-500 font-bold">{idInputErrorMessage}</span>
		</div>

		<div class="timelines-cell list">
			{#each $IDsToShow as userToCheck, index (userToCheck)}
				<div
					class="list-item relative mx-8 rounded-2xl shadow-2xl shadow-black"
					animate:flip={{ duration: 300, delay: 0 }}
					transition:slide
					role="listitem"
					draggable={true}
					on:dragstart={(event) => dragstart(event, index)}
					on:drop|preventDefault={(event) => drop(event, index)}
					on:dragover={(e) => {
						e.preventDefault();
					}}
					on:dragenter={() => (hovering = index)}
					class:is-active={hovering === index}
				>
					<Timeline
						patchFilter={userToCheck}
						logsData={channelsData}
						{currentPatchIndex}
						on:close={() =>
							($IDsToShow = $IDsToShow.filter(
								(userId) => userId !== userToCheck
							))}
						on:change={applyPatches}
					/>
				</div>
			{/each}
		</div>
		<div class="slider-cell pb-4">
			<Slider
				logsData={channelsData}
				{currentPatchIndex}
				on:change={applyPatches}
			/>
		</div>
	</div>
{/if}

<style lang="scss">
	.visualizer {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-template-rows: repeat(10, 1fr);
		grid-auto-rows: max-content;
		grid-column-gap: 0px;
		grid-row-gap: 0px;
		min-height: 0px;
		height: 100%;

		.channels-list {
			grid-area: 1 / 1 / 11 / 2;
			min-width: 300px;
			overflow-y: auto;
		}

		.new-timeline {
			grid-area: 1 / 2 / 2 / 6;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.timelines-cell {
			grid-area: 2 / 2 / 10 / 6;
			align-self: end;
			gap: 2rem;
			display: flex;
			flex-direction: column;
			height: 100%;
			overflow-y: auto;
		}

		.slider-cell {
			grid-area: 10 / 2 / 11 / 6;
		}
	}

	.scrollbar::-webkit-scrollbar {
		width: 1em;
	}

	.scrollbar::-webkit-scrollbar-track {
		box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
	}

	.scrollbar::-webkit-scrollbar-thumb {
		background-color: #9b1c1c;
		outline: 1px solid slategrey;
	}

	// Drag and drop

	.list-item {
		display: block; // Removing the list bullets
	}

	.list-item.is-active {
		background-color: #a5371b;
	}
</style>
