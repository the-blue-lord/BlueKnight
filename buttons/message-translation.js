const Discord = require("discord.js");
const yaml = require("yaml");
const fs = require("fs");

const BlueButton = require("../structures/BlueButton");
const BlueMessage = require("../structures/BlueMessage");
const getServerInfo = require("../utils/getServerInfo");

module.exports = class MessageTranslationButton extends BlueButton {
    constructor(client, message_id = "unknown-message", from_language = "en", to_language = "en", flag = "🇬🇧") {
        const data = message_id + "_" + from_language + "_" + to_language;
        super(client, "message-translation", data);

        this.message_id = message_id;
        this.from_language = from_language;
        this.to_language = to_language;

        this.button.setEmoji(flag)
            .setLabel(to_language.toUpperCase())
            .setStyle("Primary");
    }

    async run(action, interaction) {
        if(action != this.action) return;

        if(this.message_id == "server-info") {
            await interaction.deferReply({
                flags: Discord.MessageFlags.Ephemeral
            });

            const msg = await getServerInfo(this.client, interaction.guild.id, this.to_language)

            await interaction.editReply({
                embeds: [msg.embed],
                files: msg.attachments,
                components: msg.components,
                flags: Discord.MessageFlags.Ephemeral
            });
    
            return;
        }

        const og_msg = interaction.message.embeds[0].description;
        const def_msg = yaml.parse(fs.readFileSync("./configs/messages.yml", "utf-8"))[this.message_id].content[this.from_language];

        const variables = getVariables(og_msg, def_msg);

        const message = new BlueMessage(interaction.client, this.message_id, this.to_language, variables);

        await interaction.reply({
            embeds: [message.embed],
            files: message.attachments,
            components: message.components,
                flags: Discord.MessageFlags.Ephemeral
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