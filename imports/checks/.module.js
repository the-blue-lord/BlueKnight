const memberIsAtLeastBotAdmin = require("./memberIsAtLeastBotAdmin");
const memberIsAtLeastCategoryHelper = require("./memberIsAtLeastCategoryHelper");
const memberIsBotAdmin = require("./memberIsBotAdmin");
const memberIsCategoryHelper = require("./memberIsCategoryHelper");
const ticketMustBeClosed = require("./ticketMustBeClosed");
const ticketMustBeOpen = require("./ticketMustBeOpen");

module.exports = {
    memberIsAtLeastBotAdmin,
    memberIsAtLeastCategoryHelper,
    memberIsBotAdmin,
    memberIsCategoryHelper,
    ticketMustBeClosed,
    ticketMustBeOpen
};
