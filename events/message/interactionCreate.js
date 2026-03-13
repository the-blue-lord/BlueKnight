const BlueEvent = require("../../structures/BlueEvent");

const router = require("../../routes/router");
const queryDatabase = require("../../utils/queryDatabase");

module.exports = class InteractionCreate extends BlueEvent {
    constructor(client) {
        super(client, "interactionCreate");
    }

    async run(interaction) {
        if(interaction.isChatInputCommand()) await router.command(interaction);
        else if(interaction.isButton()) await router.button(interaction);
        else if(interaction.isStringSelectMenu()) await router.menu(interaction);
        else if(interaction.isModalSubmit()) await router.modal(interaction);
        else if(interaction.isAutocomplete()) await autocompleteOptions(interaction);

        return;
    }
};

async function autocompleteOptions(interaction) {
    const option = interaction.options.getFocused(true);

    if(option.name == "category_id");{
        const categories = await queryDatabase("SELECT * FROM `Categories`");

        const filtered = categories.filter(category => (category.category_name + " [id: " + category.category_id + "]").toLowerCase().includes(option.value.toLowerCase()));

        const choices = filtered.map(category => {
            return {
                name: category.category_name + " [id: " + category.category_id + "]",
                value: category.category_id
            }
        });

        await interaction.respond(choices.slice(0, 25));
    }
}