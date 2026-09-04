// Imports
const Discord = require("discord.js");
const yaml = require("yaml");
const fs = require("fs");
const BlueButton = require("../structures/BlueButton");
const BlueMessage = require("../structures/BlueMessage");
const getServerInfo = require("../utils/getServerInfo");

// Class for the button that translates a message
module.exports = class MessageTranslationButton extends BlueButton {
    // Constructor
    constructor(client, message_id = "unknown-message", from_language = "en", to_language = "en", flag = "🇬🇧") {
        // Build the button data
        const data = message_id + "_" + from_language + "_" + to_language;
        super(client, "message-translation", data);
        this.message_id = message_id;
        this.from_language = from_language;
        this.to_language = to_language;

        // Set the defualt button properties
        this.button.setEmoji(flag)
            .setLabel(to_language.toUpperCase())
            .setStyle("Primary");
    }

    // Button function
    async run(action, interaction) {
        // Check if it's the right event
        if(action != this.action) return;

        // If the message is the server info message
        if(this.message_id == "server-info") {
            // Defer the reply to the interaction
            await interaction.deferReply({
                flags: Discord.MessageFlags.Ephemeral
            });

            // Resend the server info message in the requested language
            const msg = await getServerInfo(this.client, interaction.guild.id, this.to_language)
            await interaction.editReply({
                embeds: [msg.embed],
                files: msg.attachments,
                components: msg.components,
                flags: Discord.MessageFlags.Ephemeral
            });
    
            // Return
            return;
        }

        // Fetch the original message and the default message in the starting language
        const og_msg = interaction.message.embeds[0].description;
        const def_msg = yaml.parse(fs.readFileSync("./configs/messages.yml", "utf-8"))[this.message_id].content[this.from_language];

        // Retrive the variables used
        const variables = getVariables(og_msg, def_msg);

        // Rebuild the translated message with the freshly retrived variables
        const message = new BlueMessage(interaction.client, this.message_id, this.to_language, variables);

        // Send the translated message to the user who clicked the button
        await interaction.reply({
            embeds: [message.embed],
            files: message.attachments,
            components: message.components,
            flags: Discord.MessageFlags.Ephemeral
        });

        // Return
        return;
    }
};

// Function used to retrive the variables used in a message with placeholders
function getVariables(variable_string, placeholder_string) {
    // Find the first occurrence of a placeholder
    const startingIndex = placeholder_string.indexOf("<!--");

    // Add a trail of characters to be sure of terminating both the original and the placeholder strings without a placeholder/variable
    const newPlaceholders = placeholder_string.slice(startingIndex+4)+"<additional-padding>";
    let newVariables = variable_string.slice(startingIndex)+"<additional-padding>";

    // Split the placheolder string into array of alternating string/placeholders
    const splittedPlaceholders = newPlaceholders.split("<!--").map(e => e.split("--!>")).flat();

    // Initialize the object used as result where to store the variables
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

    // Return all the variables found in the message
    return variables;
}