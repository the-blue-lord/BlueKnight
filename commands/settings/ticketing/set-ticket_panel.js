const Discord = require("discord.js");

const BlueCommand = require("../../../structures/BlueCommand.js");
const BlueMessage = require("../../../structures/BlueMessage.js");
const BlueModal = require("../../../structures/BlueModal.js");
const queryDatabase = require("../../../utils/queryDatabase.js");
const CustomizePanelModal = require("../../../modals/customize-panel.js");

module.exports = class StnPanel extends BlueCommand {
    constructor(client) {
        super(client, "set-ticket_panel");
    }

    async run(interaction) {
        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const ticketingData = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        if(!(await this.isBotAdmin(interaction.member))) {
            const msg = new BlueMessage(this.client, "not-administrator", locale);
            await interaction.reply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments,
                flags: Discord.MessageFlags.Ephemeral
            });
            return;
        }

        if(guildData.length == 0 || ticketingData.length == 0) {
            const msg = new BlueMessage(this.client, "not-setup", locale);

            await interaction.reply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments,
                flags: Discord.MessageFlags.Ephemeral
            });

            return;

            /*
                ---apuù
                àyàc
                -KeyObject
            */
        }

        const panel_title = ticketingData[0]?.ticket_panel_title;
        const panel_description = ticketingData[0]?.ticket_panel_description;
        const panel_color = ticketingData[0]?.ticket_panel_color;

        const modal = new CustomizePanelModal(this.client, locale);
        modal.build({
            panel_title: panel_title || undefined,
            panel_description: panel_description || undefined,
            panel_color: panel_color || "#03bafc"
        });

        await interaction.showModal(modal.modal);

        return;
    }
};