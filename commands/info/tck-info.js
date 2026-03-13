const { MessageFlags, EmbedBuilder } = require("discord.js");
const BlueCommand = require("../../structures/BlueCommand");
const queryDatabase = require("../../utils/queryDatabase");
const BlueMessage = require("../../structures/BlueMessage");
const BlueEmbed = require("../../structures/BlueEmbed");

// HACK: TO TEST

module.exports = class TckInfo extends BlueCommand {
    constructor(client) {
        super(client, "tck-info");
    }

    async run (interaction) {
        await interaction.deferReply({
            //flags: MessageFlags.Ephemeral
        });

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const ticketingData = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [interaction.guild.id]);
        const categoriesData = await queryDatabase("SELECT * FROM `Categories` WHERE `guild_id` = ?", [interaction.guild.id]);

        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        if(ticketingData.length == 0) {
            const msg = new BlueMessage(this.client, "not-setup", locale);
            interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
        }

        const panel_title = ticketingData[0].ticket_panel_title;
        const panel_description = ticketingData[0].ticket_panel_description;

        const defId = ticketingData[0].default_ticket_category;
        const defEnabled = (ticketingData[0].default_category_active == "1");

        const categories = categoriesData.map(r => { return {
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

        const def_cat = categoriesData.find(c => c.category_id == defId);

        const affirmative_answer = {
            en: "YES",
            it: "SI",
            es: "SI"
        };

        const negative_answer = {
            en: "NO",
            it: "NO",
            es: "NO"
        }

        const embed = new BlueEmbed(this.client, "tck-info", locale, {
            ticket_panel_title: panel_title,
            ticket_panel_description: panel_description,
            default_category_enabled: defEnabled ? affirmative_answer[locale] : negative_answer[locale],
            default_category_id: def_cat?.category_id,
            default_category_name: def_cat?.category_name || undefined,
            default_category_description: def_cat?.category_description || undefined,
            default_category_emoji: def_cat?.category_emoji || undefined,
            default_category_normal: def_cat?.channel_id || undefined,
            default_category_vip: def_cat?.vip_channel_id || undefined,
            default_category_helper: def_cat?.helper_role || undefined,

        }, categories);

        interaction.editReply({
            embeds: [embed.embed],
            components: embed.components,
            files: embed.attachments
        });
    }
};