// Imports
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { openTicket } = require("#routes").ticketRouter;
const { getGuildData } = require("#utils").fetches;

// Class for the tck-open command
module.exports = class TckOpen extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "tck-open");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Read the requested category and user
        const category_id = interaction.options.get("category_id")?.value;
        const user_id = interaction.options.get("user")?.value;
        // Fetch guild configuration
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const locale = bot_guild.locale;

        // Open the ticket through the ticket route
        const channel = await openTicket(this.client, interaction, interaction.guild.id, category_id, user_id);

        // If the category is invalid, send an error message
        if(!channel) {
            const msg = new BlueMessage(this.client, "unknown-category", locale, {
                "category_name": category,
                "user_id": user_id
            });

            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            })

            return;
        }

        // If the category is valid, build the response message
        const message = new BlueMessage(interaction.client, "ticket-opened", locale, {
            "channel_id": channel.id,
            "user_id": interaction.user.id
        });

        // Add a link button for the newly created ticket
        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.com/channels/" + channel.guildId + "/" + channel.id)
            .setLabel("Ticket");

        const row = new ActionRowBuilder().addComponents(button);

        // Send the response message
        await interaction.editReply({
            embeds: [message.embed],
            files: message.attachments,
            components: message.components.concat(row)
        });

        // Return
        return;
    }
};