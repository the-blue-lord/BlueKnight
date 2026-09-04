// Imports
const { MessageFlags } = require("discord.js");
const CategoryQuestionsModal = require("../modals/category-questions");
const BlueButton = require("../structures/BlueButton");

// Class for the button used to add default questions for the user to a ticket category
module.exports = class AddCategoryQuestionsButton extends BlueButton{
    // Constructor
    constructor(client, locale, category_id) {
        // Build the button data
        super(client, "add-category-questions", locale, category_id);
        this.category_id = category_id;
    }

    // Button function
    async run(action, interaction) {
        // Check if it's the right event
        if(action != this.action) return;

        // Build the modal used to input the questions
        const modal = new CategoryQuestionsModal(this.client, this.locale, this.category_id);
        await modal.build();

        // Reply with the modal
        interaction.showModal(modal.modal);

        // Return
        return;
    }
}