const fs = require('fs');
const path = require('path');

const features = {};

const files = fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'));

for (const file of files) {
  const feature = require(path.join(__dirname, file));

  if (feature.command) {
    features[feature.command] = feature;
  }
}

module.exports = features;
