const Discord = require("discord.js");

const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");
const queryDatabase = require("../../utilis/queryDatabase");

module.exports = class StnViprole extends BlueCommand{
    constructor(client) {
        super(client, "set-default_ticket_emoji");
    }

    async run(interaction) {
        await interaction.deferReply({
            flags: Discord.MessageFlags.Ephemeral
        });

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
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

        if(guildData.length == 0) {
            const msg = new BlueMessage(this.client, "not-setup", locale);

            interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        const emoji = interaction.options?.get("emoji")?.value;
        await queryDatabase("UPDATE `Ticketing` SET `default_emoji` = ? WHERE `guild_id` = ?", [emoji, interaction.guild.id]);

        const msg = new BlueMessage(this.client, "viprole-setup", locale);

        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });
    }
};