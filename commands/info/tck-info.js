// Imports
const yaml = require("yaml");
const fs = require("fs");

const { BlueCommand, BlueEmbed } = require("#structures");
const { getGuildData } = require("#utils").fetches;
const { memberIsAtLeastBotAdmin } = require("#utils").checks;


// HACK: TO TEST

// Class fot the tck-info command
module.exports = class TckInfo extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "tck-info");
    }

    // Command fucntion
    async run (interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply({
            // NOTE: What is this? why is eohemeral commented out?!
            //flags: MessageFlags.Ephemeral
        });

        // Fetch database data
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction, true);
        const locale = bot_guild.locale;

        // --- const bot_guild.categories = await queryDatabase("SELECT * FROM `Categories` WHERE `guild_id` = ?", [interaction.guild.id]);

        // Check if user is authorized to run this command
        await memberIsAtLeastBotAdmin(interaction.member, locale, this.client, interaction);

        // Retrive the needed variables
        const panel_title = bot_guild.ticket_panel_title;
        const panel_description = bot_guild.ticket_panel_description;
        const defId = bot_guild.default_ticket_category;
        const defEnabled = (bot_guild.default_category_active == "1");

        // Build the metadata structure needed for the response embed creation
        const categories = bot_guild.categories.map(r => { return {
            type: "category",
            vars: {
                category_id: r.category_id || undefined,
                category_name: r.category_name || undefined,
                category_description: r.category_description || undefined,
                category_emoji: r.category_emoji || undefined,
                category_normal: r.channel_id || undefined,
                category_vip: r.vip_channel_id || undefined,
                category_helper: r.helper_role || undefined,
            }
        }});

        // Retrive default category data
        const def_cat = bot_guild.categories.find(c => c.category_id == defId);

        // Fetch all the supported languages possible responses
        const languages = yaml.parse(fs.readFileSync("./config/languages.yml"));
        const positive_response = languages.positive_response;
        const negative_response = languages.negative_response;

        // Build the response embed
        const embed = new BlueEmbed(this.client, "tck-info", locale, {
            ticket_panel_title: panel_title,
            ticket_panel_description: panel_description,
            default_category_enabled: defEnabled ? positive_response[locale] : negative_response[locale],
            default_category_id: def_cat?.category_id,
            default_category_name: def_cat?.category_name || undefined,
            default_category_description: def_cat?.category_description || undefined,
            default_category_emoji: def_cat?.category_emoji || undefined,
            default_category_normal: def_cat?.channel_id || undefined,
            default_category_vip: def_cat?.vip_channel_id || undefined,
            default_category_helper: def_cat?.helper_role || undefined,

        }, categories);

        // Send the embed as repsonse
        interaction.editReply({
            embeds: [embed.embed],
            components: embed.components,
            files: embed.attachments
        });

        // Return
        return;
    }
};