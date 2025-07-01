const Discord = require("discord.js");

const BlueCommand = require("../../structures/BlueCommand.js");
const BlueMessage = require("../../structures/BlueMessage.js");
const queryDatabase = require("../../utilis/queryDatabase.js");

module.exports = class SetRemoveTicketCategory extends BlueCommand {
    constructor(client) {
        super(client, "set-remove_ticket_category");
    }

    async run(interaction) {
        await interaction.deferReply({
            flags: Discord.MessageFlags.Ephemeral
        });

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        if (!this.isBotAdmin(interaction.member)) {
            const msg = new BlueMessage(this.client, "not-administrator", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        const categoryName = interaction.options.getString("name");

        if (guildData.length == 0) {
            const msg = new BlueMessage(this.client, "not-setup", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        await queryDatabase("DELETE FROM `Categories` WHERE `guild_id` = ? AND `category_name` = ?", [interaction.guild.id, categoryName]);

        const msg = new BlueMessage(this.client, "category-removed", locale);
        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        return;
    }
};