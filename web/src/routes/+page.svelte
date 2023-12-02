<script>
	import plume_logo from "$lib/images/plume-logo.svg";
	import { Button, GradientButton } from "flowbite-svelte";
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Plume" />
</svelte:head>

<section class="h-full">
	<img src={plume_logo} alt="Welcome" />

	<h1 class="plume-title">Plume</h1>
	<div class="flex gap-2">
		<a
			href="https://discord.com/api/oauth2/authorize?client_id=1146113119840641234&scope=bot&permissions=2147485824"
			target="_blank"
			><Button shadow color="red" class="dark:bg-primary-full font-semibold"
				>Invite Plume</Button
			></a
		>
		<a href="/about">
			<Button shadow color="red" class="dark:bg-red-800 font-semibold"
				>What is Plume?</Button
			></a
		>
	</div>
</section>

<style>
	.plume-title {
		font-size: 15vh;
		font-family: "GreatVibes";
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	h1 {
		width: 100%;
    max-height: 50vh;
	}
</style>
