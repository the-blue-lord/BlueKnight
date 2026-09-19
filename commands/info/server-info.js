// Imports
const yaml = require("yaml");
const fs = require("fs");
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueEmbed, BlueMessage } = require("#structures");
const { getGuildData } = require("#utils").fetches;
const { memberIsAtLeastBotAdmin } = require("#utils").checks;

// Class for the server-info command
module.exports = class ServerInfo extends BlueCommand {
    // Constuctor
    constructor(client) {
        // Build the command data
        super(client, "server-info");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Fetch database data
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction, true);

        const locale = bot_guild.locale;

        // NOTE: To remove
        // --- const ticketingData = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [interaction.guild.id]);
        // --- const catsData = await queryDatabase("SELECT * FROM `Categories` WHERE `guild_id` = ?", [interaction.guild.id]);

        // Check if member is authorized to run this command
        await memberIsAtLeastBotAdmin(interaction.member, locale, this.client, interaction);

        // Declare the variable used to store the list of ticket categories already formatted for message building
        const additional_categories = [];

        // For each category in the bot database
        for(const cat of bot_guild.categories) {
            // Add the metadata used to build the response as an element of the appropriate array
            additional_categories.push({
                type: "additional-category",
                vars: {
                    category_name: cat.category_name,
                    category_description: cat.category_description,
                    category_id: cat.channel_id,
                    vip_category_id: cat.vip_channel_id,
                    helper_role: cat.helper_role,
                    category_emoji: cat.category_emoji
                }
            });
        }

        // Fetch all the supported languages negation adverbs
        const negation_adverb = yaml.parse(fs.readFileSync("./configs/languages.yml", "utf-8")).negation_adverb;
/*

BUG: Check if it works

        const multi_negation = {
            en: "not",
            it: "non",
            es: "no"
        }
*/
        // Build the response embed with the information retrived
        const embed = new BlueEmbed(interaction.client, "server-info", locale, {
            vip_role: bot_guild.vip_role,
            admin_role: bot_guild.admin_role,
            ticket_category: bot_guild.ticket_category,
            vip_ticket_category: bot_guild.vip_ticket_category,
            guild_id: interaction.guild.id,
            default_category_information: additional_categories.length > 0 ? (multi_negation[locale] || "not") : "",
        }, additional_categories);

        // If no embed is returned
        if(!embed) {
            // Build the error message
            const msg = new BlueMessage(this.client, "not-setup", locale);

            // Send the error message
            interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            // Return to prevent further execution
            return;
        }

        // If the embed is successfully retuned, send it as reply
        await interaction.editReply({
            embeds: [embed.embed],
            components: embed.components
        });

        // Return
        return;
    }
};