// Imports
const { createTranscript } = require("discord-html-transcripts");
const BlueButton = require("../structures/BlueButton");
const BlueMessage = require("../structures/BlueMessage");
const BlueEmbed = require("../structures/BlueEmbed");
const queryDatabase = require("../utils/queryDatabase");
const getGuildData = require("../utils/data-fetchers/getGuildData");
const getTicketData = require("../utils/data-fetchers/getTicketData");

// Class for the button that confirms the deletion of a ticket
module.exports = class ConfirmDeletionButton extends BlueButton {
    // Constructor
    constructor(client, locale, ticket_channel) {
        // Build the button data
        super(client, "confirm-deletion", locale, ticket_channel);
        this.channel_id = ticket_channel;
    }

    // Button function
    async run(action, interaction) {
        // Check if it's the right event
        if(this.action != action) return;

        // Notify the user thet the deletion process has started
        await interaction.reply("Deleting ticket...");

        // Get the ticket channel
        const ticket_channel = await interaction.guild.channels.fetch(this.channel_id) || this.channel_id; // INSERTED FETCH

        // Fetch database data
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const bot_ticket = await getTicketData(ticket_channel.id, bot_guild.locale, this.client, interaction);

        const locale = bot_guild.locale;

        // Check if the user is authorized to run this command
        await memberIsAtLeastCategoryHelper(interaction.member, bot_ticket.category_id, locale, this.client, interaction);

        // Create a transcript of the ticket channel
        const transcript = await createTranscript(ticket_channel);

        // Get the transcript channel, if specified
        const transcriptChannel = await interaction.guild.channels.fetch(bot_guild.ticket_transcripts_channel); // INSERTED FETCH

        // Delete the ticket from the database and the discord server
        await queryDatabase("DELETE FROM `Tickets` WHERE ticket_id = ?", [this.channel_id]);
        await ticket_channel.delete();

        // If the transcript channel is specified
        if(transcriptChannel) {
            // Create an embed for the transcript
            const transcript_embed = new BlueEmbed(this.client, "transcript-info", locale, {
                user_id: bot_ticket.user_id,
                category_name: bot_ticket.category_name,
                deleter_id: interaction.user.id
            });

            // Send the transcript embed in the transcript channel
            // FIXME: Not sending s=message bc transcriptChannel not recongized as a chennel, prolly probelms with newly insrted fetch
            transcriptChannel.send({
                embeds: [transcript_embed.embed],
                components: transcript_embed.components,
                files: [transcript]
            });
        }

        // Return
        return;
    }
};