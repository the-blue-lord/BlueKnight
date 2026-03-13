const Discord = require("discord.js");

const BlueCommand = require("../../../structures/BlueCommand.js");
const BlueMessage = require("../../../structures/BlueMessage.js");
const queryDatabase = require("../../../utils/queryDatabase.js");

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

        if (!(await this.isBotAdmin(interaction.member))) {
            const msg = new BlueMessage(this.client, "not-administrator", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }
        
        const category_id = interaction.options.getInteger("category_id");

        if (guildData.length == 0) {
            const msg = new BlueMessage(this.client, "not-setup", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        await queryDatabase("DELETE FROM `Categories` WHERE `category_id` = ?", [category_id]);
        
        const msg = new BlueMessage(this.client, "category-removed", locale);
        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        return;
    }
};