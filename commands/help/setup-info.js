// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueEmbed, BlueMessage } = require("#structures");
const { getGuildData } = require("#fetches");
const { memberIsAtLeastBotAdmin } = require("#checks");

// Class for the setup-info command
module.exports = class SetupInfo extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "setup-info");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Fetch database data
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const locale = bot_guild.locale;

        // Check if the suer is authorized to run this command
        await memberIsAtLeastBotAdmin(interaction.member, locale, this.client, interaction);

        // Build the embed for the response
        const embed = new BlueEmbed(interaction.client, "setup-info", locale);

        // If no embed is returned
        if(!embed) {
            // Build the message to notify the error
            const message = new BlueMessage(this.client, "unknown-embed", locale, {
                "embed_id": "setup-info"
            });

            // Send the error message
            await interaction.editReply({
                embeds: [message.embed],
                components: message.components,
                files: message.attachments
            });

            // Return to prevent further execution
            return;
        }

        // If the embed is successfully returned, send it as reply
        await interaction.editReply({
            embeds: [embed.embed],
            components: embed.components
        });

        // Return
        return;
    }
};