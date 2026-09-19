// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { queryDatabase } = require("#utils");
const { getGuildData } = require("#utils").fetches;
const { memberIsAtLeastBotAdmin } = require("#utils").checks;

// Class for the set-language command
module.exports = class StnLanguage extends BlueCommand{
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "set-language");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Fetch the current guild locale and requested locale
        const locale = (await getGuildData(interaction.guild.id, this.client, interaction)).locale;
        const new_locale = interaction.options?.get("language")?.value;

        // Check if the user is authorized to run this command
        await memberIsAtLeastBotAdmin(interaction.member, locale, this.client, interaction);

        // Save the new guild locale
        await queryDatabase("UPDATE `Guilds` SET `locale` = ? WHERE `guild_id` = ?", [new_locale, interaction.guild.id]);

        // Build the response message
        const msg = new BlueMessage(this.client, "language-setup", new_locale);

        // Send the response message
        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        // Return
        return;
    }
};