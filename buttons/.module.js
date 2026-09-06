const acceptReopening = require("./accept-reopening");
const addCategoryQuestions = require("./add-category-questions");
const askReopening = require("./ask-reopening");
const blockReopening = require("./block-reopening");
const cancelDeletion = require("./cancel-deletion");
const closeTicket = require("./close-ticket");
const confirmDeletion = require("./confirm-deletion");
const deleteTicket = require("./delete-ticket");
const denyReopening = require("./deny-reopening");
const messageTranslation = require("./message-translation");
const openTicket = require("./open-ticket");
const reopenTicket = require("./reopen-ticket");

module.exports = {
    acceptReopening,
    addCategoryQuestions,
    askReopening,
    blockReopening,
    cancelDeletion,
    closeTicket,
    confirmDeletion,
    deleteTicket,
    denyReopening,
    messageTranslation,
    openTicket,
    reopenTicket
};
