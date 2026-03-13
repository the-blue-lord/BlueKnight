const Discord = require("discord.js");

const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");
const queryDatabase = require("../../utils/queryDatabase");

module.exports = class StnLanguage extends BlueCommand{
    constructor(client) {
        super(client, "set-language");
    }

    async run(interaction) {
        await interaction.deferReply({
            flags: Discord.MessageFlags.Ephemeral
        });

        const locale = interaction.options?.get("language")?.value;

        if(!(await this.isBotAdmin(interaction.member))) {
            const msg = new BlueMessage(this.client, "not-administrator", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        await queryDatabase("UPDATE `Guilds` SET `locale` = ? WHERE `guild_id` = ?", [locale, interaction.guild.id]);

        const msg = new BlueMessage(this.client, "language-setup", locale);

        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });
    }
};