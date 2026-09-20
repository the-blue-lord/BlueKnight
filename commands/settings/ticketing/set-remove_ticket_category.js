// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { queryDatabase } = require("#utils");
const { getGuildData, getCategoryData } = require("#fetches");
const { memberIsAtLeastBotAdmin } = require("#checks");

// Class for the set-remove_ticket_category command
module.exports = class SetRemoveTicketCategory extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "set-remove_ticket_category");
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
        
        // Read and validate the category to remove
        const category_id = interaction.options.getInteger("category_id");

        await getCategoryData(category_id, locale, this.client, interaction);

        // Remove the category from the database
        await queryDatabase("DELETE FROM `Categories` WHERE `category_id` = ?", [category_id]);
        
        // Build the response message
        const msg = new BlueMessage(this.client, "category-removed", locale);
        // Send the response message
        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        return;
    }
};