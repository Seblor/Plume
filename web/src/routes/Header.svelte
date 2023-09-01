<script>
	import { page } from "$app/stores";
	import logo from "$lib/images/plume-logo.svg";
	import github from "$lib/images/github.svg";
	import { browser } from "$app/environment";

	let hoveredElementIndex = getActiveElementIndex();

	$: searchParams = (browser && $page.url.searchParams) || null;

	$: showDemo =
		searchParams?.get("logfile") == undefined ||
		searchParams?.get("logfile") === "demo";

	$: {
		$page.url.pathname;
		resetHoveredElement();
	}

	function resetHoveredElement() {
		hoveredElementIndex = getActiveElementIndex();
	}

	function getActiveElementIndex() {
		return $page.url.pathname === "/"
			? 0
			: $page.url.pathname.startsWith("/viewer")
			? 1
			: 2;
	}
</script>

<header>
	<div class="corner">
		<a class="plume-logo" href="/">
			<img src={logo} alt="SvelteKit" />
		</a>
	</div>

	<nav class="relative">
		<nav class="navigation-tab">
			<a
				class="navigation-tab-item hover:no-underline"
				class:active={hoveredElementIndex === 0}
				href="/"
				on:mouseenter={() => (hoveredElementIndex = 0)}
				on:mouseleave={resetHoveredElement}
			>
				<span class="navigation-tab__icon">
					<svg
						class="w-6 h-6 text-gray-800 dark:text-red-400"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 20 20"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 8v10a1 1 0 0 0 1 1h4v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5h4a1 1 0 0 0 1-1V8M1 10l9-9 9 9"
						/>
					</svg>
				</span>
				<span class="navigation-tab__txt text-white">Home</span>
			</a>
			<a
				class="navigation-tab-item hover:no-underline"
				class:active={hoveredElementIndex === 1}
				href={showDemo ? "/viewer/v1?logfile=demo" : "#"}
				on:mouseenter={() => (hoveredElementIndex = 1)}
				on:mouseleave={resetHoveredElement}
			>
				<span class="navigation-tab__icon">
					<svg
						class="w-6 h-6 text-gray-800 dark:text-red-400"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 20 14"
					>
						<g
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						>
							<path d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
							<path
								d="M10 13c4.97 0 9-2.686 9-6s-4.03-6-9-6-9 2.686-9 6 4.03 6 9 6Z"
							/>
						</g>
					</svg>
				</span>
				<span class="navigation-tab__txt text-white"
					>{showDemo ? "Demo" : "Viewer"}</span
				>
			</a>
			<a
				class="navigation-tab-item hover:no-underline"
				class:active={hoveredElementIndex === 2}
				href="/about"
				on:mouseenter={() => (hoveredElementIndex = 2)}
				on:mouseleave={resetHoveredElement}
			>
				<span class="navigation-tab__icon">
					<svg
						class="w-6 h-6 text-gray-800 dark:text-red-400"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 20 20"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 9h2v5m-2 0h4M9.408 5.5h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
						/>
					</svg>
				</span>
				<span class="navigation-tab__txt text-white">About</span>
			</a>
			<div
				style:left={hoveredElementIndex * 75 + "px"}
				class="navigation-tab-overlay bg-red-800"
			/>
		</nav>
	</nav>

	<div class="flex">
		<div class="corner">
			<a
				class="support-server-link"
				href="https://discord.gg/RDP6xg2Tf2"
				target="_blank"
			>
				<svg
					class="w-6 h-6 text-gray-800 dark:text-primary-full"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 21 16"
				>
					<path
						d="M16.942 1.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z"
					/>
				</svg>
			</a>
		</div>
		<div class="corner">
			<a href="https://github.com/Seblor/Plume">
				<img src={github} alt="GitHub" />
			</a>
		</div>
	</div>
</header>

<style lang="scss">
	header {
		display: flex;
		justify-content: space-between;
	}

	.plume-logo::after {
		content: "Plume";
		font-family: "GreatVibes";
		position: absolute;
		transform: translate(100%, 10%);
		font-size: 2em;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
	}

	.navigation-tab {
		height: 75px;
		width: 275px;
		box-shadow: 0 50px 30px 0 rgba(#000, 0.175);
		border-radius: 20px 20px 40px 40px;
		overflow: hidden;
		border: 10px solid #ffffff00;
		display: flex;
		position: relative;
		flex-shrink: 0;

		&-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 75px;
			flex-shrink: 0;
			cursor: pointer;
			transition: 0.3s;
			position: relative;
			z-index: 2;

			&.active {
				width: 100px;

				.navigation-tab__icon {
					transform: translate(0px, -150%);
				}
				.navigation-tab__txt {
					opacity: 1;
					transform: translate(0, -50%);
				}
			}
		}

		&-overlay {
			border-radius: 10px;
			height: 100%;
			width: 100px;
			position: absolute;
			left: 0;
			top: 0;
			transition: 0.3s;
		}

		&__icon {
			display: block;
			color: #4298e7;
			transition-duration: 0.3s;
			line-height: 1;
			transform: translate(0, 11px);
		}

		&__txt {
			display: block;
			font-weight: 400;
			font-size: 20px;
			opacity: 0;
			transition-duration: 0.3s;
			// transition-delay: 0.1s;
			transform: translate(0, 20px);
			user-select: none;
		}
	}

	.support-server-link::after {
		content: "Support Server";
		position: absolute;
		transform: translate(-75%, 10%);
	}
</style>
