function encode(input) {
  return input
    .split('')
    .map(char => {
      const binary = char.charCodeAt(0).toString(2).padStart(8, '0');
      return binary.replace(/0/g, '\u200B').replace(/1/g, '\u200C') + '\u200D';
    })
    .join('');
}

function decode(zeroWidthStr) {
  return zeroWidthStr
    .split('\u200D') // split by separator
    .filter(Boolean) // remove empty strings
    .map(encodedChar => {
      const binary = encodedChar.replace(/\u200B/g, '0').replace(/\u200C/g, '1');
      return String.fromCharCode(parseInt(binary, 2));
    })
    .join('');
}

module.exports = {
    encode,
    decode
};