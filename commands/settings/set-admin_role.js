const Discord = require("discord.js");

const BlueCommand = require("../../structures/BlueCommand.js");
const BlueMessage = require("../../structures/BlueMessage.js");
const queryDatabase = require("../../utilis/queryDatabase.js");

module.exports = class StnAdminrole extends BlueCommand {
    constructor(client) {
        super(client, "set-admin_role");
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

        const roleId = interaction.guild.roles.cache.find(r => r.id == interaction.options?.get("role")?.value)?.id;

        if(guildData.length == 0) {
            const msg = new BlueMessage(this.client, "not-setup", locale);

            interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        await queryDatabase("UPDATE `Guilds` SET `admin_role` = ? WHERE `guild_id` = ?", [roleId, interaction.guild.id]);

        const msg = new BlueMessage(this.client, "adminrole-setup", locale);

        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });
    }
};