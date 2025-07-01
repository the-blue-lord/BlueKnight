const BlueCommand = require("../../structures/BlueCommand.js");
const BlueMessage = require("../../structures/BlueMessage.js");
const queryDatabase = require("../../utilis/queryDatabase.js");

const AddCategoryQuestionsModal = require("../../modals/category-questions.js");

module.exports = class SetAddTicketCategory extends BlueCommand {
    constructor(client) {
        super(client, "set-add_ticket_category");
    }

    async run(interaction) {
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
        const categoryDescription = interaction.options.getString("description");
        const normalCategoryId = interaction.options.getChannel("normal-category").id;
        const vipCategoryId = interaction.options.getChannel("vip-category").id;
        const categoryEmoji = interaction.options.getString("emoji");
        const categoryHelperRole = interaction.options.getRole("category-helper")?.id;

        if (guildData.length == 0) {
            const msg = new BlueMessage(this.client, "not-setup", locale);
            await interaction.reply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        try {
            await queryDatabase("INSERT INTO `Categories` (`guild_id`, `category_name`, `category_description`, `category_emoji`, `channel_id`, `vip_channel_id`, `helper_role`) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                [interaction.guild.id, categoryName, categoryDescription, categoryEmoji, normalCategoryId, vipCategoryId, categoryHelperRole]);
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                const msg = new BlueMessage(this.client, "category-used", locale);
                await interaction.reply({
                    embeds: [msg.embed],
                    components: msg.components,
                    files: msg.attachments
                });
                return;
            }
        }

        const questionsModal = new AddCategoryQuestionsModal(this.client, locale, categoryName);
        questionsModal.build();
            
        await interaction.showModal(questionsModal.modal);
    }
};