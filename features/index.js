const fs = require('fs');
const path = require('path');

function register(bot) {

  const files = fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.endsWith('.js'));

  for (const file of files) {

    const feature = require(path.join(__dirname, file));

    if (feature.command && feature.execute) {

      bot.onText(new RegExp(`/${feature.command}`), (msg) => {
        feature.execute(bot, msg);
      });

    }

    if (feature.handleMessage) {

      bot.on('message', (msg) => {
        feature.handleMessage(bot, msg);
      });

    }

  }

}

module.exports = { register };
