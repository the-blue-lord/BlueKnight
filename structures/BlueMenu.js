module.exports = class BlueMenu {
    constructor(client, menu_action, menu_data) {
        this.client = client;
        this.action = menu_action;

        this.id = menu_action + menu_data ? ("_" + menu_data) : "";
    }
};