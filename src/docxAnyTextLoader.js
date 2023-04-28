const reader = require("any-text");

async function docxAnyTextLoader(input) {
  try {
    const text = await reader.getText(input);
    return text;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  docxAnyTextLoader,
};
