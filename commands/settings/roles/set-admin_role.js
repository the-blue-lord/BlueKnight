// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { queryDatabase } = require("#utils");
const { getGuildData } = require("#utils").fetches;
const { memberIsAtLeastBotAdmin } = require("#utils").checks;

// Class for the set-admin_role command
module.exports = class StnAdminrole extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "set-admin_role");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Fetch guild configuration
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const locale = bot_guild.locale;

        // Check if the user is authorized to run this command
        await memberIsAtLeastBotAdmin(interaction.member, locale, this.client, interaction);

        // Resolve and save the selected administrator role
        const roleId = interaction.guild.roles.cache.find(r => r.id == interaction.options?.get("role")?.value)?.id;

        await queryDatabase("UPDATE `Guilds` SET `admin_role` = ? WHERE `guild_id` = ?", [roleId, interaction.guild.id]);

        // Build the response message
        const msg = new BlueMessage(this.client, "adminrole-setup", locale);

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