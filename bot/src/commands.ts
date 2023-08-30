import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

const commands: { [key: string]: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> } = {
  'set-log-channel': new SlashCommandBuilder()
  .setName('set-log-channel')
  .setDescription('Set the channel to log events to')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption(option => option
    .setName('channel')
    .setDescription('The channel to log events to')
    .setRequired(true)
  ),
}

export default commands
