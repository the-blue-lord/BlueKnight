// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { queryDatabase } = require("#utils");
const { getGuildData } = require("#utils").fetches;
const { memberIsAtLeastBotAdmin } = require("#utils").checks;

// Class for the set-default_category_enable command
module.exports = class SetDefaultTicketCategoryEnable extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "set-default_category_enable");
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

        // Enable the default ticket category
        await queryDatabase("UPDATE `Ticketing` SET `default_category_active` = 1 WHERE `guild_id` = ?", [interaction.guild.id]);

        // Build the response message
        const msg = new BlueMessage(this.client, "default-category-enabled", locale);

        // Send the response message
        interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        // Return
        return;
    }
};