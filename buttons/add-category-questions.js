const { MessageFlags } = require("discord.js");
const CategoryQuestionsModal = require("../modals/category-questions");
const BlueButton = require("../structures/BlueButton");

module.exports = class AddCategoryQuestionsButton extends BlueButton{
    constructor(client, locale, category_id) {
        super(client, "add-category-questions", locale, category_id);

        this.category_id = category_id;
    }

    async run(action, interaction) {
        if(action != this.action) return;

        const modal = new CategoryQuestionsModal(this.client, this.locale, this.category_id);
        await modal.build();

        interaction.showModal(modal.modal);
    }
}