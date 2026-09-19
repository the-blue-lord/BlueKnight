
// Imports
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { getGuildData } = require("#utils").fetches;
const { memberIsAtLeastBotAdmin } = require("#utils").checks;
const { openTicket: OpenTicketButton } = require("#buttons");

// Class for the tck-panel command
module.exports = class TckPanel extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "tck-panel");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply();

        // Fetch guild configuration
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction, true);
        const locale = bot_guild.locale;

        // Check if the user is authorized to run this command
        await memberIsAtLeastBotAdmin(interaction.member, locale, this.client, interaction);

        // Build the response message
        const embed = this.getPanelEmbed(bot_guild);

        const categoriesData = bot_guild.categories || [];
        const generalActive = bot_guild.default_category_active;
        const generalCategory = bot_guild.default_ticket_category;

        // If no categories exist, send an error message
        if(!categoriesData.length) {
            const msg = new BlueMessage(this.client, "no-categories", locale);

            interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        // If categories exist, build the panel action row
        const row  = new ActionRowBuilder();

        // If the default category is disabled, use a category menu
        if(!generalActive || generalActive == "0") {
            const selectMenu = new StringSelectMenuBuilder().setCustomId("open-ticket");
            
            // Add each configured category to the menu
            for(const cat of categoriesData) {
                const option = new StringSelectMenuOptionBuilder()
                    .setLabel(cat.category_name || "unknown")
                    .setDescription(cat.category_description || "unknown")
                    .setValue(String(cat.category_id || "0"))
                    .setEmoji(cat.category_emoji || "🎫");
                    
                selectMenu.addOptions(option);
            }

            row.addComponents(selectMenu);
        }
        // If the default category is enabled, use the default category button
        else {
            row.addComponents(
                new OpenTicketButton(this.client, locale, generalCategory).button
            );
        }

        // Send the response message
        interaction.editReply({
            embeds: [embed],
            components: [row]
        });

        return;
    }

    // Build the ticket panel embed
    getPanelEmbed(bot_guild) {
        const embed = new EmbedBuilder()
            .setTitle(bot_guild.ticket_panel_title || "Ticket panel")
            .setDescription(bot_guild.ticket_panel_description || "Welcome to the ticket panel. Here you can open a ticket.")
            .setColor(bot_guild.ticket_panel_color || "#03bafc")
            .setTimestamp()
            .setFooter({
                text: "BlueKnight",
                iconURL: this.client.user.avatarURL()
            });

        return embed;
    }
};