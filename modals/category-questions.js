const Discord = require('discord.js');

const BlueModal = require('../structures/BlueModal');
const BlueMessage = require('../structures/BlueMessage');
const queryDatabase = require('../utilis/queryDatabase');

module.exports = class CategoryQuestionsModal extends BlueModal {
    constructor(client, localisation = "en", category_name) {
        super(client, "category-questions", localisation, category_name);

        this.category_name = category_name;
    }

    async run(modalId, interaction) {
        if(modalId != this.action) return;

        await interaction.deferReply({
            flags: Discord.MessageFlags.Ephemeral
        });

        for(let i  = 0; i < 5; i++) {
            const question = interaction.fields.getTextInputValue("question_" + i);
            if(!question) continue;

            try {
                await queryDatabase("INSERT INTO `CategoryQuestions` (`guild_id`, `category_name`, `question`) VALUES (?, ?, ?)", [interaction.guild.id, this.category_name, question]);
            } catch (error) {
                console.error("Database error:", error);
                return;
            }
        }

        const msg = new BlueMessage(this.client, "category-added", this.lan);
        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        return;
    }
};