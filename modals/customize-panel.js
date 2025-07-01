const Discord = require("discord.js");

const BlueModal = require("../structures/BlueModal");
const BlueMessage = require("../structures/BlueMessage");

const queryDatabase = require("../utilis/queryDatabase");

module.exports = class CustomizePanel extends BlueModal {
    constructor(client, localisation = "en") {
        super(client, "customize-panel", localisation);
    }

    async run(action, interaction) {
        if(action != this.action) return;

        await interaction.deferReply({
            flags: Discord.MessageFlags.Ephemeral
        });

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const ticketing_guilds = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [interaction.guild.id]);

        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];
        
        if(guildData.length == 0) {
            const msg = new BlueMessage(this.client, "not-setup", locale);

            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        const answers = interaction.fields.fields;

        const panelTitle = answers.get("panel_title").value || ticketing_guilds[0].ticket_panel_title;
        const panelDescription = answers.get("panel_description").value || ticketing_guilds[0].ticket_panel_description;
        const color = answers.get("panel_color").value || ticketing_guilds[0].ticket_panel_color;

        await queryDatabase("UPDATE `Ticketing` SET `ticket_panel_title` = ?, `ticket_panel_description` = ?, `ticket_panel_color` = ? WHERE `guild_id` = ?", [panelTitle, panelDescription, color, interaction.guild.id]);

        const msg = new BlueMessage(this.client, "panel-updated", locale);

        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        return;
    }
};