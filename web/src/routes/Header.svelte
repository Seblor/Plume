<script>
	import { page } from "$app/stores";
	import logo from "$lib/images/plume-logo.svg";
	import { browser } from "$app/environment";

	$: searchParams = (browser && $page.url.searchParams) || null;

	$: showDemo =
		searchParams?.get("logfile") == undefined ||
		searchParams?.get("logfile") === "demo";

	$: pathname = $page.url.pathname;
</script>

<header>
	<!-- Brand -->
	<a class="brand" href="/">
		<img src={logo} alt="Plume logo" class="brand-logo" />
		<span class="brand-name">Plume</span>
	</a>

	<!-- Navigation -->
	<nav>
		<a class="nav-link" class:active={pathname === "/"} href="/">Home</a>
		<a
			class="nav-link"
			class:active={pathname.startsWith("/viewer")}
			href={showDemo ? "/viewer/v1?logfile=demo" : "/viewer/v1"}
		>{showDemo ? "Demo" : "Viewer"}</a>
		<a class="nav-link" class:active={pathname.startsWith("/about")} href="/about">About</a>
	</nav>

	<!-- External links -->
	<div class="external-links">
		<a
			class="icon-link"
			href="https://discord.gg/RDP6xg2Tf2"
			target="_blank"
			aria-label="Discord support server"
			title="Support Server"
		>
			<!-- Discord icon -->
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 21 16" aria-hidden="true">
				<path d="M16.942 1.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z" />
			</svg>
		</a>
		<a
			class="icon-link"
			href="https://github.com/Seblor/Plume"
			target="_blank"
			aria-label="GitHub repository"
			title="GitHub"
		>
			<!-- GitHub icon -->
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 496 512" aria-hidden="true">
				<path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C426.2 457.8 496 362.9 496 252 496 113.3 389.9 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
			</svg>
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 56px;
		padding: 0 1.25rem;
		background: rgba(13, 17, 23, 0.85);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: 100;
		flex-shrink: 0;
	}

	/* Brand */
	.brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--text-primary);
	}

	.brand:hover {
		text-decoration: none;
	}

	.brand-logo {
		width: 28px;
		height: 28px;
		object-fit: contain;
	}

	.brand-name {
		font-family: 'GreatVibes', cursive;
		font-size: 1.6rem;
		line-height: 1;
		color: var(--accent);
		letter-spacing: 0.01em;
	}

	/* Nav */
	nav {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.nav-link {
		padding: 0.375rem 0.75rem;
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-secondary);
		text-decoration: none;
		transition: color var(--transition), background var(--transition);
	}

	.nav-link:hover {
		color: var(--text-primary);
		background: var(--bg-overlay);
		text-decoration: none;
	}

	.nav-link.active {
		color: var(--text-primary);
		background: var(--bg-overlay);
	}

	/* External links */
	.external-links {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.icon-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		text-decoration: none;
		transition: color var(--transition), background var(--transition);
	}

	.icon-link:hover {
		color: var(--text-primary);
		background: var(--bg-overlay);
		text-decoration: none;
	}
</style>


