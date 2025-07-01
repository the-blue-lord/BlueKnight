const Discord = require("discord.js");

const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");
const queryDatabase = require("../../utilis/queryDatabase");

module.exports = class Setup extends BlueCommand {
    constructor(client) {
        super(client, "setup");
    }

    async run(interaction) {
        await interaction.deferReply({
            flags: Discord.MessageFlags.Ephemeral
        });

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        if(!this.isBotAdmin(interaction.member)) {
            const msg = new BlueMessage(this.client, "not-admin", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        if(guildData.length == 0) {
            await queryDatabase("INSERT INTO `Guilds` (`guild_id`, `locale`) VALUES (?, ?)", [interaction.guild.id, interaction.guild.preferredLocale.split("-")[0]]);
            await queryDatabase("INSERT INTO `Ticketing` (`guild_id`) VALUES (?)", [interaction.guild.id]);

            const msg = new BlueMessage(this.client, "setup-successful", locale);

            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        const msg = new BlueMessage(this.client, "already-setup", locale);

        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        return;
    }
};