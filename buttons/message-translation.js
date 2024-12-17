const yaml = require("yaml");
const fs = require("fs");

const BlueButton = require("../structures/BlueButton");
const BlueMessage = require("../structures/BlueMessage");

module.exports = class MessageTranslation extends BlueButton {
    constructor(interaction) {
        super("message-translation");
    }

    async run(action, data, interaction) {        
        if(action != this.action) return;

        const message_id = data[0];
        const from_lan = data[1];
        const to_lan = data[2];

        const og_msg = interaction.message.embeds[0].description;
        const def_msg = yaml.parse(fs.readFileSync("./configs/messages.yml", "utf-8"))[message_id].content[from_lan];

        const variables = getVariables(og_msg, def_msg);

        const message = new BlueMessage(interaction.client, message_id, to_lan, variables);

        interaction.reply({
            embeds: [message.embed],
            files: message.files,
            components: message.components,
            ephemeral: true
        });

        return;
    }
};

function getVariables(variable_string, placeholder_string) {
    const startingIndex = placeholder_string.indexOf("<!--");

    const newPlaceholders = placeholder_string.slice(startingIndex+4)+"<additional-padding>";
    let newVariables = variable_string.slice(startingIndex)+"<additional-padding>";

    const splittedPlaceholders = newPlaceholders.split("<!--").map(e => e.split("--!>")).flat();

    const variables = {};

    // --- For each piece of the message with placeholders (placeholder, text, placeholder, text, placeholder, text...)
    splittedPlaceholders.forEach((placeholder, index) => {
        // --- If it is not a text piece, skip this cycle of the loop
        if(index%2 != 1) return;

        // --- Find the end of the variable previous to the text
        const placeholderIndex = newVariables.indexOf(placeholder);

        // --- Set the the variables property corresponding to the previous placeholder name to the variable value
        variables[splittedPlaceholders[index-1]] = newVariables.slice(0, placeholderIndex);

        // --- Remove the variable already used
        newVariables = newVariables.slice(placeholderIndex+placeholder.length);
    });

    return variables;
}