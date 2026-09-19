// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { queryDatabase } = require("#utils");

// Class for the setup command
module.exports = class Setup extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "setup");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Fetch the guild configuration
        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        // Check if the user is authorized to run this command
        if(!(await this.isBotAdmin(interaction.member))) {
            // Send the authorization error
            const msg = new BlueMessage(this.client, "not-admin", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        // If the guild is not configured, create its default records
        if(guildData.length == 0) {
            await queryDatabase("INSERT INTO `Guilds` (`guild_id`, `locale`) VALUES (?, ?)", [interaction.guild.id, interaction.guild.preferredLocale.split("-")[0]]);
            await queryDatabase("INSERT INTO `Ticketing` (`guild_id`) VALUES (?)", [interaction.guild.id]);

            // Send the setup confirmation
            const msg = new BlueMessage(this.client, "setup-successful", locale);

            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        // Notify the user that setup has already been completed
        const msg = new BlueMessage(this.client, "already-setup", locale);

        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        return;
    }
};