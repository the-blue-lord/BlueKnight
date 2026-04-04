const Discord = require('discord.js');

const BlueModal = require('../structures/BlueModal');
const BlueMessage = require('../structures/BlueMessage');
const queryDatabase = require('../utils/queryDatabase');

const ticket_router = require('../routes/ticket-router');
const BlueEmbed = require('../structures/BlueEmbed');
const yaml = require('yaml');
const fs = require('fs');

module.exports = class TicketQuestionsModal extends BlueModal {
    constructor(client, localisation = "en", category_id) {
        super(client, "open-ticket", localisation, category_id);

        this.category_id = category_id;
    }

    async build() {
        const languages = yaml.parse(fs.readFileSync("./configs/languages.yml", "utf8"));


        const categories = await queryDatabase("SELECT * FROM `Categories` WHERE `category_id` = ?", [this.category_id]);
        const questions = await queryDatabase("SELECT * FROM `CategoryQuestions` WHERE `category_id` = ?", [this.category_id]);
        
        this.modal = new Discord.ModalBuilder()
            .setTitle(languages.open_ticket[this.lan] + " - " + categories[0].category_name)
            .setCustomId(this.id);

        var cnt = 0;

        for(const question of questions) {
            this.modal.addLabelComponents(
                new Discord.LabelBuilder()
                    .setLabel(question.question)
                    .setTextInputComponent(
                        new Discord.TextInputBuilder()
                            .setStyle(Discord.TextInputStyle.Paragraph)
                            .setRequired(true)
                            .setCustomId("answer_" + cnt++)
                    )
            );
        }
    }

    async run(modalId, interaction) {
        if(modalId != this.action) return;

        await interaction.deferReply({
            flags: Discord.MessageFlags.Ephemeral
        });

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const vip_role_id = guildData[0].vip_role;
        const isVip = interaction.member.roles.cache.find(r => r.id == vip_role_id) ? true : false;
        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        const categories = await queryDatabase("SELECT * FROM `Categories` WHERE `category_id` = ?", [this.category_id]);
        const questions = await queryDatabase("SELECT * FROM `CategoryQuestions` WHERE `category_id` = ?", [this.category_id]);
        

        const ticketChannel = await ticket_router.openTicket(interaction.client, interaction, interaction.guild.id, this.category_id, interaction.user.id, isVip);

        if(!ticketChannel) {
            interaction.editReply("Error");
            return;
        }

        const msg = new BlueMessage(interaction.client, "ticket-opened", locale, {
            "channel_id": ticketChannel.id,
            "user_id": interaction.user.id,
            "category_name": categories[0].category_name,
            "channel_link": `https://discord.com/channels/${interaction.guild.id}/${ticketChannel.id}`,
        });

        const channel_button_row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setLabel("Ticket")
                .setStyle(Discord.ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${interaction.guild.id}/${ticketChannel.id}`)
        );

        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components.concat(channel_button_row),
            files: msg.attachments,
            flags: Discord.MessageFlags.Ephemeral
        });

        if(!questions?.length) return;

        var cnt = 0;
        const answer_fields = [];
        for(const question of questions) {
            const answer = interaction.fields.getTextInputValue("answer_" + cnt++);
            answer_fields.push({
                type: "question",
                vars: {
                    question: question.question,
                    answer: answer
                }
            });
        }

        const answer_embed = new BlueEmbed(interaction.client, "ticket-questions", locale, {}, answer_fields);

        await ticketChannel.send({
            embeds: [answer_embed.embed],
            components: answer_embed.components,
        });

        return;
    }
};