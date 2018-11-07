const inquirer = require('inquirer');

/**
 * Simple wrapper around inquirer list prompt
 */
const select = async (question, options) => {
  let prompt = inquirer.prompt([
    {
      name: 'answer',
      message: question,
      type: 'list',
      pageSize: '20',
      choices: options
    }
  ]);
  const { answer } = await prompt;
  return answer;
};

module.exports = select;
