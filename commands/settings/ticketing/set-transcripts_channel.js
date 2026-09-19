// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { queryDatabase } = require("#utils");
const { getGuildData } = require("#utils").fetches;
const { memberIsAtLeastBotAdmin } = require("#utils").checks;

// Class for the set-transcripts_channel command
module.exports = class SetTransciptsChannelCommand extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "set-transcripts_channel");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Fetch guild configuration
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const locale = bot_guild.locale;

        // Check if the user is authorized to run this command
        await memberIsAtLeastBotAdmin(interaction.member, locale, this.client, interaction);

        // Read the optional transcript channel
        const channel_id = interaction.options?.get("channel")?.value;

        // If no channel was supplied, clear the configured transcript channel
        if(!channel_id) {
            await queryDatabase("UPDATE `Ticketing` SET `ticket_transcripts_channel` = NULL WHERE `guild_id` = ?", [interaction.guild.id]);
            
            // Build the response message
            const msg = new BlueMessage(this.client, "transcipts-channel-unset", locale);

            // Send the response message
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        // If a channel was supplied, save the selected transcript channel
        await queryDatabase("UPDATE `Ticketing` SET `ticket_transcripts_channel` = ? WHERE `guild_id` = ?", [channel_id, interaction.guild.id]);

        // Build the response message
        const msg = new BlueMessage(this.client, "transcipts-channel-set", locale, {
            channel_id: channel_id
        });

        // Send the response message
        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        return;
    }

    
};