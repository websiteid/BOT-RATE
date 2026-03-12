const fs = require('fs');
const path = require('path');

function register(bot) {

  const files = fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.endsWith('.js'));

  const features = {};

  for (const file of files) {
    const feature = require(path.join(__dirname, file));
    if (feature.command) {
      features[feature.command] = feature;
    }
  }

  bot.on('message', async (msg) => {

    const text = msg.text;

    if (!text) return;

    // START
    if (text === '/start') {
      return features['start'].execute(bot, msg);
    }

    // HELP
    if (text === '❓ Help') {
      return features['help'].execute(bot, msg);
    }

    // MENFES
    if (text === '💌 Menfes') {
      return features['menfes'].execute(bot, msg);
    }

    // KIRIM PAP
    if (text === '📤 Kirim PAP') {
      return features['kirimpap'].execute(bot, msg);
    }

    // HANDLE SESSION FEATURE
    for (const key in features) {
      const feature = features[key];
      if (feature.handleMessage) {
        await feature.handleMessage(bot, msg);
      }
    }

  });

}

module.exports = { register };
