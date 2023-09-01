# [Plume](https://plume.red)

<p align="center">
  <a href="https://plume.red"><img src="./logo.webp" /></a>
</p>

# Introduction

Plume is a Discord bot that allows you to log your server's voice chat activity, with a fancy visualizer, while preventing the spam of log messages in your Discord server.

# Why ?

I made this project to solve a few issue with the current logging tools of my Discord server (Minecraft-France, 65k+ members), since all the existing solutions would spam the moderation logs channel.

This would make the moderation's job a lot harder since the Discord's search results would be cluttered with voice chat activity.

It was also a great opportunity for me to learn Svelte.

# Invite the bot

[Just click here!](https://discord.com/api/oauth2/authorize?client_id=1146113119840641234&scope=bot&permissions=2147485824)

# Installation

## Discord bot hosting

If you would like to host the bot yourself, follow there steps:

Start by cloning the repo :

```bash
git clone git@github.com:Seblor/Plume.git
```

Copy the file `example.ecosystem.config.cjs` to `prod.ecosystem.config.cjs`, and fill the `DISCORD_TOKEN` and `LOGS_WEBHOOK` values with your config. If you are hosting the website yourself, you can change the `PREVIEW_PREFIX_URL` value.

Then install all the dependencies

```bash
# Install the global dependencies
npm i -g typescript pm2
# Build the shared types
cd ./plume/shared_types
npm run build
# Go to the bot's directory
cd ../bot
# Install the bot's dependencies
npm i
# Link the shared types
npm link ../shared_types
# build for production
npm run build:prod
```

You can now run the bot:

```bash
# Start the bot
npm run run:prod
```

You can see the logs with the following command:

```bash
npm run logs:prod
```

## Website hosting

The website is a rather strait-forward installation of SvelteKit with a Vercel hosting. More information here: https://kit.svelte.dev/docs/adapter-static#zero-config-support
