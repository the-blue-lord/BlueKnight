const Discord = require("discord.js");

const BlueCommand = require("../../structures/BlueCommand.js");
const BlueMessage = require("../../structures/BlueMessage.js");
const BlueModal = require("../../structures/BlueModal.js");
const queryDatabase = require("../../utilis/queryDatabase.js");

module.exports = class StnPanel extends BlueCommand {
    constructor(client) {
        super(client, "set-ticket_panel");
    }

    async run(interaction) {
        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        if(!this.isBotAdmin(interaction.member)) {
            const msg = new BlueMessage(this.client, "not-administrator", locale);
            await interaction.reply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments,
                flags: Discord.MessageFlags.Ephemeral
            });
            return;
        }

        if(guildData.length == 0) {
            const msg = new BlueMessage(this.client, "not-setup", locale);

            await interaction.reply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments,
                flags: Discord.MessageFlags.Ephemeral
            });

            return;
        }

        const modal = await new BlueModal(this.client, "customize-panel", locale).build(); // TODO: Change class to CustomizePanelModal or similar

        await interaction.showModal(modal.modal);

        return;
    }
};