const Discord = require("discord.js");

const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");
const getServerInfo = require("../../utilis/getServerInfo");

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

        const message = await getServerInfo(this.client, interaction.guild.id, locale);

        if(!message) {
            const msg = new BlueMessage(this.client, "not-setup", locale);

            interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        await interaction.editReply({
            embeds: [message.embed],
            components: message.components,
            files: message.attachments
        });

        return;
    }
};