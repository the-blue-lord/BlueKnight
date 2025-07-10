module.exports = (variables_string, placeholders_string, starting_delimiter = "<!--", ending_delimiter = "--!>") => {
    const startingIndex = placeholders_string.indexOf(starting_delimiter);

    const newPlaceholders = placeholders_string.slice(startingIndex+starting_delimiter.length)+"<additional-padding>";
    let newVariables = variables_string.slice(startingIndex)+"<additional-padding>";

    const splittedPlaceholders = newPlaceholders.split(starting_delimiter).map(e => e.split(ending_delimiter)).flat();

    const variables = {};

    // --- For each piece of the message with placeholders (placeholder, text, placeholder, text, placeholder, text...)
    splittedPlaceholders.forEach((placeholder, index) => {
        // --- If it is not a text piece, skip this cycle of the loop
        if(index%2 != 1) return;

        // --- Find the end of the variable previous to the text
        const placeholderIndex = newVariables.indexOf(placeholder);

        // --- Set the the variables property corresponding to the previous placeholder name to the variable value
        variables[splittedPlaceholders[index-1]] = newVariables.slice(0, placeholderIndex);

        // --- Remove the variable already used
        newVariables = newVariables.slice(placeholderIndex+placeholder.length);
    });

    return variables;
}