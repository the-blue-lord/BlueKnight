function removeUnderscore(str) {
    if(!str) return str;
    if(!str.replaceAll) return str;
    return str.replaceAll("\\", "\\\\").replaceAll("u", "uu").replaceAll("_", "\\u");
}

function insertUnderscore(id) {
    if(!id) return id;
    if(!id.replaceAll) return id;
    return id.replaceAll("\\\\", "\\").replaceAll("uu", "u").replaceAll("\\u", "_");
}

module.exports = {
    removeUnderscore,
    insertUnderscore
}