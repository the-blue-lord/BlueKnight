const { ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")

module.exports = (questions) => {
    const modal = new ModalBuilder();

    if(!questions?.length) return null;

    for(const [index, question] of questions) {
        modal.addComponents(
            new TextInputBuilder()
                .setStyle(TextInputStyle.Paragraph)
                .setLabel(question.title)
                .setPlaceholder(question.description)
                .setRequired(true)
                .setCustomId("question_" + index)
        );
    }

    return modal;
}