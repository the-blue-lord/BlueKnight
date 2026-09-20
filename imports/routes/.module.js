const buttonRouter = require("./button-router");
const commandRouter = require("./command-router");
const menuRouter = require("./menu-router");
const modalRouter = require("./modal-router");
const ticketRouter = require("./tickets/.module");

module.exports = {
	router: {
		button: buttonRouter,
		command: commandRouter,
		menu: menuRouter,
		modal: modalRouter
	},
	buttonRouter,
	commandRouter,
	menuRouter,
	modalRouter,
	ticketRouter
};