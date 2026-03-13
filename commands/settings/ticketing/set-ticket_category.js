const Discord = require("discord.js");

const BlueCommand = require("../../../structures/BlueCommand.js");
const BlueMessage = require("../../../structures/BlueMessage.js");

const queryDatabase = require("../../../utils/queryDatabase.js");

module.exports = class StnSetTicketCategory extends BlueCommand {
    constructor(client) {
        super(client, "set-ticket_category");
    }

    async run(interaction) {
        await interaction.deferReply({
            flags: Discord.MessageFlags.Ephemeral
        });

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        if (!(await this.isBotAdmin(interaction.member))) {
            const msg = new BlueMessage(this.client, "not-administrator", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments,
                flags: Discord.MessageFlags.Ephemeral
            });
            return;
        }

        if (guildData.length == 0) {
            const msg = new BlueMessage(this.client, "not-setup", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments,
                flags: Discord.MessageFlags.Ephemeral
            });
            return;
        }

        const category_id = interaction.options.getInteger("category_id");
        const categoriesData = await queryDatabase("SELECT * FROM `Categories` WHERE `category_id` = ?", [category_id]);

        if (categoriesData.length == 0) {
            const msg = new BlueMessage(this.client, "unknown-category", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments,
                flags: Discord.MessageFlags.Ephemeral
            });
            return;
        }

        await queryDatabase("UPDATE `Ticketing` SET `default_ticket_category` = ? WHERE `guild_id` = ?", [category_id, interaction.guild.id]);

        const msg = new BlueMessage(this.client, "category-setup", locale);
        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments,
            flags: Discord.MessageFlags.Ephemeral
        });

        return;
    }
};