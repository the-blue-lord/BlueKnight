const BlueCommand = require("../../../structures/BlueCommand.js");
const BlueMessage = require("../../../structures/BlueMessage.js");
const queryDatabase = require("../../../utils/queryDatabase.js");

const CategoryDataModal = require("../../../modals/category-data.js");

module.exports = class SetAddTicketCategory extends BlueCommand {
    constructor(client) {
        super(client, "set-add_ticket_category");
    }

    async run(interaction) {
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

        const categoryName = interaction.options.getString("name");

        if (guildData.length == 0) {
            const msg = new BlueMessage(this.client, "not-setup", locale);
            await interaction.reply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        const categoryDataModal = new CategoryDataModal(this.client, locale, categoryName);
        await categoryDataModal.build();
            
        await interaction.showModal(categoryDataModal.modal);
    }
};