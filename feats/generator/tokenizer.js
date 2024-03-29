/**
 * Tokenize string considering the white spaces and punctuation.
 * @see https://stackoverflow.com/questions/6162600/how-do-you-split-a-javascript-string-by-spaces-and-punctuation
 */

const NEWLINE_PLACEHOLDER = "§";
const PARAGRAPH_CHARACTER = "\n\n";

const punctuation = `[](){}!?.,:;'"\/*&^%$_+-–—=<>@|~`.split("").join("\\");
const ellipsis = "\\.{3}";

const words = "[a-zA-Zа-яА-ЯёЁ]+";
const compounds = `${words}-${words}`;

const newlinesRegex = /\n\s*/g;
const tokenizeRegex = new RegExp(
  `(${ellipsis}|${compounds}|${words}|[${punctuation}])`
);

function exists(entity) {
  return !!entity;
}

module.exports = {
  tokenize: function(text) {
    return text.replace(newlinesRegex, NEWLINE_PLACEHOLDER).split(tokenizeRegex).filter(exists);
  },
  textify: function(tokens) {
    return tokens.filter(exists).join("").replace(NEWLINE_PLACEHOLDER, PARAGRAPH_CHARACTER).replace(NEWLINE_PLACEHOLDER, " ").replace(NEWLINE_PLACEHOLDER, " ");
  }
}
