const Discord = require("discord.js");

const BlueCommand = require("../../structures/BlueCommand");
const BlueEmbed = require("../../structures/BlueEmbed");
const BlueMessage = require("../../structures/BlueMessage");
const queryDatabase = require("../../utilis/queryDatabase");

module.exports = class SetupInfo extends BlueCommand {
    constructor(client) {
        super(client, "setup-info");
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

        const embed = new BlueEmbed(interaction.client, "setup-info", locale);

        if(!embed) {
            const message = new BlueMessage(this.client, "unknown-embed", locale, {
                "embed_id": "setup-info"
            });

            await interaction.editReply({
                embeds: [message.embed],
                components: message.components,
                files: message.attachments
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