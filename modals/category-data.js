const Discord = require('discord.js');

const BlueModal = require('../structures/BlueModal');
const BlueMessage = require('../structures/BlueMessage');
const queryDatabase = require('../utils/queryDatabase');
const CategoryQuestionsModal = require('../modals/category-questions');
const AddCategoryQuestionsButton = require('../buttons/add-category-questions');
const { ActionRowBuilder } = require('discord.js');

module.exports = class CategoryDataModal extends BlueModal {
    constructor(client, localisation = "en", category_name) {
        super(client, "category-data", localisation, category_name);

        this.category_name = category_name;
    }

    async run(modalId, interaction) {
        if(modalId != this.action) return;

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);

        await interaction.deferReply();

        
        const categoryDescription = interaction.fields.getTextInputValue("description");
        const normalCategoryId = interaction.fields.getSelectedChannels("normal_category")?.keys().next()?.value;
        const vipCategoryId = interaction.fields.getSelectedChannels("vip_category")?.keys().next()?.value;
        const categoryEmoji = interaction.fields.getTextInputValue("emoji");
        const categoryHelperRole = interaction.fields.getSelectedRoles("helper_role")?.keys().next()?.value;

        if (guildData.length == 0) {
            const msg = new BlueMessage(this.client, "not-setup", this.lan);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        try {
            await queryDatabase("INSERT INTO `Categories` (`guild_id`, `category_name`, `category_description`, `category_emoji`, `channel_id`, `vip_channel_id`, `helper_role`) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                [interaction.guild.id, this.category_name, categoryDescription, categoryEmoji, normalCategoryId, vipCategoryId, categoryHelperRole]);
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                const msg = new BlueMessage(this.client, "category-used", this.lan);
                await interaction.editReply({
                    embeds: [msg.embed],
                    components: msg.components,
                    files: msg.attachments
                });
                return;
            }
        }

        // NOTE: Can be bettered up for sure
        const cateogries = await queryDatabase("SELECT * FROM `Categories` WHERE `guild_id` = ? AND `category_name` = ? AND `channel_id` = ? AND `vip_channel_id` = ?", [interaction.guild.id, this.category_name, normalCategoryId, vipCategoryId]);

        if (cateogries.length == 0) {
            return;
        }

        const cat_id = cateogries[cateogries.length-1].category_id

        const msg = new BlueMessage(this.client, "category-added", this.lan);
        const questions_button = new AddCategoryQuestionsButton(this.client, this.lan, cat_id)
        const row = new ActionRowBuilder().addComponents(questions_button.button);
        await interaction.editReply({
            embeds: [msg.embed],
            components: [row, ...msg.components],
            files: msg.attachments
        });

        return;
    }
};