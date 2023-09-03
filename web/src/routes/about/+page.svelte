<script lang="ts">
	import searchBefore from "$lib/about/search_before.png";
	import searchAfter from "$lib/about/search_after.png";
	import logMessageExample from "$lib/about/log_message_example.png";
    import { Button } from "flowbite-svelte";

	let distanceFromTop = 0;
	let distanceFromBottom = Infinity;

	function onScroll(event: Event) {
		distanceFromTop = (event.target as HTMLElement)?.scrollTop;
		distanceFromBottom =
			(event.target as HTMLElement)?.scrollTop -
			((event.target as HTMLElement)?.scrollHeight -
				(event.target as HTMLElement)?.clientHeight);
	}
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About Plume" />
</svelte:head>

<div
	class="flex flex-col overflow-auto py-8 scroll scrollbar"
	on:scroll={onScroll}
>
	<section class="flex flex-col justify-center items-center my-8">
		<h1>About <span class="plume">Plume</span></h1>

		<p>
			<span class="text-primary-full">Plume</span> is a Discord bot that allows you
			to log your server's voice chat activity.
		</p>
		<p class="mt-2">Basically, it records everything that happens on the left sidebar of your Discord server, and allows you to replay it with a nice interface in the browser.</p>
		<a class="mt-4" href="/viewer/v1?logfile=demo"><Button class="dark:bg-red-800">Check out the demo</Button></a>
	</section>

	<div
		class={`arrow transition-all absolute bottom-16 ${
			distanceFromTop === 0 ? "right-1/2" : "right-16"
		} ${distanceFromBottom === 0 ? "opacity-0" : "opacity-100"}`}
	>
		<svg
			class="w-12 h-12 text-gray-800 dark:text-white"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 10 14"
		>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5 1v12m0 0 4-4m-4 4L1 9"
			/>
		</svg>
	</div>

	<div class="flex flex-col w-1/2 m-auto justify-center items-center gap-8">
		<div class="flex flex-col gap-8">
			<section>
				<h1>How does it work?</h1>

				<div class="flex flex-col gap-2 justify-center items-center">
					<p>
						Once set up with the <code>/set-log-channel</code> command, Plume will
						send a message with a link to the visualization web page every day. This
						message will be updated every 10 minutes, or sooner if there has been
						no activity for one minute.
					</p>

					<img src={logMessageExample} alt="example of a log message" />
				</div>
			</section>

			<section>
				<h1>No more spam!</h1>

				<div>
					<p>
						Avoid all that unnecessary spam in your moderation logging channels
						with conventional bots. You will be able to use Discord's search
						without the voice logs cluttering the results.
					</p>

					<div class="m-2 flex gap-2 justify-center items-center">
						<figure>
							<img src={searchBefore} alt="search before" />
							<figcaption class="text-center">Without <span class="text-primary-full">Plume</span></figcaption>
						</figure>
						<svg
							class="w-6 h-6 text-gray-800 dark:text-white"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 14 10"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M1 5h12m0 0L9 1m4 4L9 9"
							/>
						</svg>
						<figure>
							<img src={searchAfter} alt="search after" />
							<figcaption class="text-center">With <span class="text-primary-full">Plume</span></figcaption>
						</figure>
					</div>
				</div>
			</section>

			<section>
				<h1>Your data is yours</h1>

				<p>
					In addition to being open source, Plume does not keep any data
					(besides the configuration). The logs are stored as attachments in <i
						>your</i
					> Discord server, and are deleted if you delete Plume's message.
				</p>
			</section>
		</div>
	</div>
</div>

<style class="scss">
	section {
		margin-bottom: 30vh;
		margin-top: calc(50vh - 200px);
	}

	/* Animation looping making element move up and down, eased on the way up only */
	@keyframes bounce {
		0% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
		100% {
			transform: translateY(0);
		}
	}

	.arrow {
		animation: bounce 1s ease-in-out infinite;
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
</style>
