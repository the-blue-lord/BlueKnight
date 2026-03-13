const { MessageFlags } = require("discord.js");
const BlueCommand = require("../../../structures/BlueCommand");
const queryDatabase = require("../../../utils/queryDatabase");
const BlueMessage = require("../../../structures/BlueMessage");

module.exports = class SetDefaultTicketCategoryDisable extends BlueCommand {
    constructor(client) {
        super(client, "set-default_cateogry_disable");
    }

    async run(interaction) {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        
        if(!guildData?.length) {
            const msg = new BlueMessage(this.client, "not-setup", interaction.guild.preferredLocale.split("-")[0]);

            interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }
        
        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        if(!(await this.isBotAdmin(interaction.member))) {
            const msg = new BlueMessage(this.client, "not-admin", locale);

            interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        await queryDatabase("UPDATE `Ticketing` SET `default_category_active` = 0 WHERE `guild_id` = ?", [interaction.guild.id]);
        
        const msg = new BlueMessage(this.client, "default-category-disabled", locale);

        interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });
    }
};