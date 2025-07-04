const Discord = require("discord.js");

const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");
const BlueEmbed = require("../../structures/BlueEmbed");

const queryDatabase = require("../../utilis/queryDatabase");

module.exports = class ServerInfo extends BlueCommand {
    constructor(client) {
        super(client, "server-info");
    }

    async run(interaction) {
        await interaction.deferReply({
            flags: Discord.MessageFlags.Ephemeral
        });

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const ticketingData = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [interaction.guild.id]);
        const catsData = await queryDatabase("SELECT * FROM `Categories` WHERE `guild_id` = ?", [interaction.guild.id]);

        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        if(!this.isBotAdmin(interaction.member)) {
            const msg = new BlueMessage(this.client, "not-administrator", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        const additional_categories = [];

        for(const cat of catsData) {
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

        const embed = new BlueEmbed(interaction.client, "server-info", locale, {
            vip_role: guildData[0].vip_role,
            admin_role: guildData[0].admin_role,
            ticket_category: ticketingData[0].ticket_category,
            vip_ticket_category: ticketingData[0].vip_ticket_category,
            guild_id: interaction.guild.id
        }, additional_categories);

        if(!embed) {
            const msg = new BlueMessage(this.client, "not-setup", locale);

            interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        await interaction.editReply({
            embeds: [embed.embed],
            components: embed.components
        });

        return;
    }
};