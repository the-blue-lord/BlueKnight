// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { queryDatabase } = require("#utils");
const { getGuildData } = require("#utils").fetches;
const { memberIsAtLeastBotAdmin } = require("#utils").checks;

// Class for the set-vip_ticket_emoji command
module.exports = class StnViprole extends BlueCommand{
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "set-vip_ticket_emoji");
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

        // Read and save the VIP ticket emoji
        const emoji = interaction.options?.get("emoji")?.value;
        await queryDatabase("UPDATE `Ticketing` SET `vip_emoji` = ? WHERE `guild_id` = ?", [emoji, interaction.guild.id]);

        // Build the response message
        const msg = new BlueMessage(this.client, "viprole-setup", locale);

        // Send the response message
        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        // Return
        return;
    }
};