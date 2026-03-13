const { MessageFlags, ButtonInteraction } = require("discord.js");
const BlueButton = require("../structures/BlueButton");
const queryDatabase = require("../utils/queryDatabase");
const rebuildComponents = require("../utils/rebuildComponents");

module.exports = class CancelDeletionButton extends BlueButton {
	constructor(client, locale, ticket_id) {
        super(client, "cancel-deletion", locale);

        this.old_interaction_id;
    }

    async run(action, interaction) {
        if(action != this.action) return;

        interaction.deferReply({
            content: "Canceling deletion...",
            flags: MessageFlags.Ephemeral
        });

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale;

        const ticketData = await queryDatabase("SELECT * FROM `Tickets` AS t JOIN `Categories` AS c ON t.category_id = c.category_id WHERE `ticket_id` = ?", [this.category_id]);

        if(!(await this.isBotAdmin(interaction.member)) && !(await this.isCategoryHelper(interaction.member, ticketData[0].category_id))) {
            const msg = new BlueMessage(this.client, "not-category-helper", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        const new_components = rebuildComponents(interaction.message.components, component => component.setDisabled(true));

        await interaction.message.edit({
            components: new_components
        });

        interaction.deleteReply();
    }
}