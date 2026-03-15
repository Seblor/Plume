<script>
	import plume_logo from "$lib/images/plume-logo.svg";
</script>

<svelte:head>
	<title>Plume</title>
	<meta name="description" content="Plume, a Discord voice activity logger and visualizer" />
</svelte:head>

<section class="hero">
	<!-- Decorative glow -->
	<div class="glow" aria-hidden="true" />

	<img class="hero-logo" src={plume_logo} alt="Plume logo" />

	<h1 class="hero-title">Plume</h1>

	<p class="hero-subtitle">
		Log and replay your Discord server's voice chat activity, beautifully.
	</p>

	<div class="hero-actions">
		<a
			class="btn btn-primary"
			href="https://discord.com/api/oauth2/authorize?client_id=1146113119840641234&scope=bot&permissions=2147485824"
			target="_blank"
			rel="noopener"
		>
			<!-- Discord icon -->
			<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 21 16" aria-hidden="true">
				<path d="M16.942 1.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z" />
			</svg>
			Invite Plume
		</a>
		<a class="btn btn-secondary" href="/about">What is Plume?</a>
	</div>

	<!-- Feature pills -->
	<div class="feature-pills">
		<span class="pill">Voice activity logs</span>
		<span class="pill">Timeline replay</span>
		<span class="pill">No data stored</span>
		<span class="pill">Open source</span>
	</div>
</section>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 2rem 1rem;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	/* Soft red radial glow behind logo */
	.glow {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 600px;
		height: 300px;
		background: radial-gradient(ellipse at center, rgba(229, 62, 62, 0.12) 0%, transparent 70%);
		pointer-events: none;
	}

	.hero-logo {
		width: clamp(80px, 20vw, 256px);
		margin-bottom: 2rem;
		filter: drop-shadow(0 0 24px rgba(229, 62, 62, 0.35));
		position: relative;
	}

	.hero-title {
		font-family: 'GreatVibes', cursive;
		font-size: clamp(4rem, 14vw, 10rem);
		font-weight: 400;
		line-height: 1;
		color: var(--accent);
		margin: 0;
		position: relative;
	}

	.hero-subtitle {
		font-size: clamp(0.95rem, 2vw, 1.125rem);
		color: var(--text-secondary);
		margin: 0.75rem 0 2rem;
		max-width: 480px;
		line-height: 1.6;
	}

	/* Buttons */
	.hero-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		border-radius: var(--radius-sm);
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		transition: background var(--transition), color var(--transition),
			box-shadow var(--transition), transform var(--transition);
		border: none;
	}

	.btn:hover { text-decoration: none; transform: translateY(-1px); }
	.btn:active { transform: translateY(0); }

	.btn-primary {
		background: var(--accent);
		color: #fff;
		box-shadow: 0 4px 20px rgba(229, 62, 62, 0.4);
	}

	.btn-primary:hover {
		background: var(--accent-hover);
		box-shadow: 0 6px 24px rgba(229, 62, 62, 0.5);
		color: #fff;
	}

	.btn-secondary {
		background: var(--bg-overlay);
		color: var(--text-primary);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
		border-color: var(--text-muted);
	}

	/* Feature pills */
	.feature-pills {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.pill {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		background: var(--bg-overlay);
		border: 1px solid var(--border);
		color: var(--text-secondary);
		letter-spacing: 0.02em;
	}
</style>
