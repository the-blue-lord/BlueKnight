// Imports
const { ModalBuilder, TextInputBuilder, TextInputStyle, ButtonStyle, MessageFlags, LabelBuilder  } = require("discord.js");

const BlueButton = require("../structures/BlueButton");
const BlueMessage = require("../structures/BlueMessage");

const queryDatabase = require("../utils/queryDatabase");
const ticket_router = require("../routes/ticket-router");
const Discord = require("discord.js");
const TicketQuestionsModal = require("../modals/ticket-questions");

const getGuildData = require("../utils/data-fetchers/getGuildData");
const getCategoryData = require("../utils/data-fetchers/getCategoryData");

// Class for the button that opens a ticket
module.exports = class OpenTicketButton extends BlueButton {
    // Constructor
    constructor(client, locale, category_id) {
        // Build the button data
        super(client, "open-ticket", locale, category_id || "");
        this.category_id = category_id;
    }

    // Button function
    async run (action, interaction) {
        // Check if it's the right event
        if(this.action != action) return;

        // Retrive default ticket category id
        // BUG: Why tf always falling back to the default category? VERY VERY STRANGE...
        this.category_id = bot_guild.default_ticket_category;

        // Fetch database data
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const bot_category = await getCategoryData(this.category_id, bot_guild.locale, this.client, interaction);

        const locale = bot_guild.locale;

        // Check if the ticket user is a VIP
        const vip_role_id = bot_guild.vip_role;
        const isVip = interaction.member.roles.cache.find(r => r.id == vip_role_id) ? true : false;

        // Get possible questions for the ticket category
        const questions = await queryDatabase("SELECT * FROM `CategoryQuestions` WHERE `category_id` = ?", [this.category_id]);

        // If there are no questions
        if(!questions?.length) {
            // Defer the reply to the interaction
            await interaction.deferReply({
                flags: MessageFlags.Ephemeral
            });

            // Call the appropriate function to open the ticket and get the ticket channel
            const ticketChannel = await ticket_router.openTicket(interaction.client, interaction, interaction.guild.id, this.category_id, interaction.user.id, isVip);
            // If the ticket channel was not created, return to prevent unprendictable behavior (interaction should have already been replied to by the openTicket function)
            if(!ticketChannel) return;

            // Create the message to notify the successful ticket opening
            const locale = bot_guild.locale; //|| interaction.guild.preferredLocale.split("-")[0];
            const msg = new BlueMessage(interaction.client, "ticket-opened", locale,  {
                "channel_id": ticketChannel.id,
                "user_id": interaction.user.id,
                "category_name": bot_category.category_name
            });

            // Create a button that links to the ticket channel
            const channel_button_row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Ticket")
                    .setStyle(Discord.ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${interaction.guild.id}/${ticketChannel.id}`)
            );

            // Send the message along with the button
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components.concat(channel_button_row),
                files: msg.attachments
            });

            // Return to avoid further execution
            return;
        }

        // If there are questions, create a modal to ask the questions
        const modal = new TicketQuestionsModal(this.client, this.locale, this.category_id);
        await modal.build();

        // Reply to the interaction by showing the modal
        await interaction.showModal(modal.modal);

        // Return
        return;
    }
};