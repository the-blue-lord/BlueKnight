const Discord = require("discord.js");

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");
const queryDatabase = require("../../utilis/queryDatabase");
const OpenTicketButton = require("../../buttons/open-ticket");

module.exports = class TckPanel extends BlueCommand {
    constructor(client) {
        super(client, "tck-panel");
    }

    async run(interaction) {
        await interaction.deferReply();

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        if(!this.isBotAdmin(interaction.member)) {
            const msg = new BlueMessage(this.client, "not-admin", locale);

            interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
        }

        const embed = await this.getPanelEmbed(interaction.guild.id);

        if(!embed) {
            const msg = new BlueMessage(this.client, "not-setup", locale);

            interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
        }

        const ticketing_guilds = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [interaction.guild.id]);
        const categoriesData = await queryDatabase("SELECT * FROM `Categories` WHERE `guild_id` = ?", [interaction.guild.id]);

        const generalCategory = ticketing_guilds[0].ticket_category || categoriesData[0];

        if(!categoriesData.length && !generalCategory) {
            const msg = new BlueMessage(this.client, "no-categories", locale);

            interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        const row  = new ActionRowBuilder();

        if(categoriesData.length > 1) {
            const selectMenu = new StringSelectMenuBuilder().setCustomId("open-ticket");
            
            for(const cat of categoriesData) {
                const option = new StringSelectMenuOptionBuilder()
                    .setLabel(cat.category_name)
                    .setDescription(cat.category_description)
                    .setValue(cat.category_name)
                    .setEmoji(cat.category_emoji || "🎫");


                selectMenu.addOptions(option);
            }

            row.addComponents(selectMenu);
        }
        else {
            row.addComponents(
                new OpenTicketButton(this.client, generalCategory.category_name).button
            );
        }

        interaction.editReply({
            embeds: [embed],
            components: [row]
        });

        return;
    }

    async getPanelEmbed(guild_id) {
        const guilds = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [guild_id]);

        if(!guilds.length) return null;

        const embed = new EmbedBuilder()
            .setTitle(guilds[0].ticket_panel_title || "Ticket panel")
            .setDescription(guilds[0].ticket_panel_description || "Welcome to the ticket panel. Here you can open a ticket.")
            .setColor(guilds[0].ticket_panel_color || "#03bafc")
            .setTimestamp()
            .setFooter({
                text: "BlueKnight",
                iconURL: this.client.user.avatarURL()
            });

        return embed;
    }
};