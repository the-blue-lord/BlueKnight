const {
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
} = require("discord.js");

module.exports = (components_data, modifier) => {
  return components_data.map(row => {
    const newRow = new ActionRowBuilder();

    for (const component of row.components) {
      let builder;

      // Button
      if (component.type === 2) {
        builder = ButtonBuilder.from(component);
      }

      // String select menu
      else if (component.type === 3) {
        builder = StringSelectMenuBuilder.from(component);
      }

      // User select menu
      else if (component.type === 5) {
        builder = UserSelectMenuBuilder.from(component);
      }

      // Role select menu
      else if (component.type === 6) {
        builder = RoleSelectMenuBuilder.from(component);
      }

      // Channel select menu
      else if (component.type === 7) {
        builder = ChannelSelectMenuBuilder.from(component);
      }

      if(typeof modifier === "function") modifier(builder);

      if (builder) newRow.addComponents(builder);
    }

    return newRow;
  });
}