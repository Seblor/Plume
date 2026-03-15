<script lang="ts">
	import searchBefore from "$lib/about/search_before.png";
	import searchAfter from "$lib/about/search_after.png";
	import logMessageExample from "$lib/about/log_message_example.png";
</script>

<svelte:head>
	<title>About Plume</title>
	<meta name="description" content="About Plume, a Discord voice activity logger" />
</svelte:head>

<div class="page scrollbar">
	<!-- Hero -->
	<section class="hero">
		<h1>About <span class="plume">Plume</span></h1>
		<p class="lead">
			A Discord bot that logs your server's voice chat activity and lets you replay it with a
			beautiful browser-based timeline.
		</p>
		<a class="btn btn-primary" href="/viewer/v1?logfile=demo">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 20 14" aria-hidden="true">
				<g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
					<path d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
					<path d="M10 13c4.97 0 9-2.686 9-6s-4.03-6-9-6-9 2.686-9 6 4.03 6 9 6Z" />
				</g>
			</svg>
			Try the live demo
		</a>
	</section>

	<!-- Feature cards -->
	<div class="features">

		<!-- How it works -->
		<section class="feature-card">
			<div class="feature-text">
				<h2>How does it work?</h2>
				<p>
					Once set up with the <code>/set-log-channel</code> command, Plume sends a message
					with a link to the visualization page every day. The message is updated every
					10&nbsp;minutes, or sooner when activity goes quiet.
				</p>
			</div>
			<figure class="feature-media">
				<img src={logMessageExample} alt="Example of a Plume log message in Discord" />
				<figcaption>Example log message sent by Plume</figcaption>
			</figure>
		</section>

		<!-- No spam -->
		<section class="feature-card feature-card--reverse">
			<div class="feature-text">
				<h2>No more spam</h2>
				<p>
					Say goodbye to voice-event clutter in your moderation channel. Discord's search
					stays clean and useful.
				</p>
			</div>
			<div class="feature-media comparison">
				<figure class="comparison-item">
					<img src={searchBefore} alt="Discord search cluttered with voice logs" />
					<figcaption>Without <span class="plume">Plume</span></figcaption>
				</figure>
				<svg class="arrow-icon rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 10" fill="none" aria-hidden="true">
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
				</svg>
				<figure class="comparison-item">
					<img src={searchAfter} alt="Discord search clean with Plume" />
					<figcaption>With <span class="plume">Plume</span></figcaption>
				</figure>
			</div>
		</section>

		<!-- Data privacy -->
		<section class="feature-card">
			<div class="feature-text">
				<h2>Your data is yours</h2>
				<p>
					Plume is fully open source and stores <em>zero</em> data on its own servers (beyond
					your channel configuration). Logs live as attachments inside <em>your</em> Discord
					server and disappear when you delete Plume's message.
				</p>
			</div>
			<div class="feature-media privacy-icons" aria-hidden="true">
				<div class="privacy-badge">
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
					</svg>
					<span>Private</span>
				</div>
				<div class="privacy-badge">
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
					<span>Open source</span>
				</div>
			</div>
		</section>
	</div>

	<!-- CTA -->
	<section class="cta">
		<h2>Ready to get started?</h2>
		<div class="cta-actions">
			<a
				class="btn btn-primary"
				href="https://discord.com/api/oauth2/authorize?client_id=1146113119840641234&scope=bot&permissions=2147485824"
				target="_blank"
				rel="noopener"
			>Invite Plume</a>
			<a class="btn btn-secondary" href="https://github.com/Seblor/Plume" target="_blank" rel="noopener">View on GitHub</a>
		</div>
	</section>
</div>

<style>
	.page {
		height: 100%;
		overflow-y: auto;
		padding: 3rem 1.5rem;
	}

	/* Hero */
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1rem;
		margin-bottom: 4rem;
	}

	.hero h1 {
		font-size: clamp(2rem, 5vw, 3rem);
	}

	.lead {
		font-size: 1.05rem;
		color: var(--text-secondary);
		max-width: 560px;
		line-height: 1.65;
	}

	/* Feature cards */
	.features {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		max-width: 900px;
		margin: 0 auto 4rem;
	}

	.feature-card {
		display: flex;
		align-items: center;
		gap: 2.5rem;
		padding: 2rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.feature-card--reverse {
		flex-direction: row-reverse;
	}

	.feature-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.feature-text h2 {
		font-size: 1.375rem;
	}

	.feature-text p {
		line-height: 1.65;
	}

	.feature-media {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.feature-media img {
		max-width: 100%;
		border-radius: var(--radius-md);
		border: 1px solid var(--border);
	}

	figcaption {
		text-align: center;
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-top: 0.4rem;
	}

	/* Comparison layout */
	.comparison {
		align-items: center;
		gap: 1rem;
	}

	.comparison-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0;
	}

	.comparison-item img {
		max-height: 180px;
		width: auto;
		object-fit: contain;
	}

	.arrow-icon {
		width: 24px;
		height: 24px;
		color: var(--text-muted);
		flex-shrink: 0;
	}

	/* Privacy icons */
	.privacy-icons {
		display: flex;
		flex-direction: row;
		gap: 1.5rem;
		justify-content: center;
	}

	.privacy-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-weight: 500;
	}

	.privacy-badge svg {
		color: var(--accent);
	}

	/* CTA */
	.cta {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1.5rem;
		padding: 3rem;
		background: var(--accent-muted);
		border: 1px solid rgba(229, 62, 62, 0.25);
		border-radius: var(--radius-lg);
		max-width: 900px;
		margin: 0 auto;
	}

	.cta-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	/* Shared buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		border: none;
		transition: background var(--transition), color var(--transition),
			box-shadow var(--transition), transform var(--transition);
	}

	.btn:hover { text-decoration: none; transform: translateY(-1px); }
	.btn:active { transform: translateY(0); }

	.btn-primary {
		background: var(--accent);
		color: #fff;
		box-shadow: 0 4px 16px rgba(229, 62, 62, 0.35);
	}

	.btn-primary:hover { background: var(--accent-hover); color: #fff; }

	.btn-secondary {
		background: var(--bg-overlay);
		color: var(--text-primary);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover { background: var(--bg-hover); color: var(--text-primary); }

	@media (max-width: 640px) {
		.page {
			padding: 2rem 1rem;
		}

		.hero {
			margin-bottom: 2.5rem;
		}

		.feature-card {
			flex-direction: column;
			gap: 1.5rem;
			padding: 1.25rem;
		}

		.feature-card--reverse {
			flex-direction: column;
		}

		.comparison {
			flex-direction: column;
		}

		.arrow-icon {
			transform: rotate(90deg);
		}

		.cta {
			padding: 1.5rem 1rem;
		}

		.privacy-icons {
			flex-wrap: wrap;
			gap: 1rem;
		}
	}
</style>
