const buttonRouter = require("./button-router");
const commandRouter = require("./command-router");
const menuRouter = require("./menu-router");
const modalRouter = require("./modal-router");

module.exports = {
    button: buttonRouter,
    command: commandRouter,
    menu: menuRouter,
    modal: modalRouter
}