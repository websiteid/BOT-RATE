const fs = require('fs');
const path = require('path');

const sessions = {};
const dbPath = path.join(__dirname, '../pap.json');

function loadDB() {
  if (!fs.existsSync(dbPath)) return {};
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = {
  command: 'rate',

  execute: async (bot, msg) => {

    const chatId = msg.chat.id;

    sessions[chatId] = {
      step: "token"
    };

    bot.sendMessage(chatId, `
⭐ *Rate PAP*

Silakan kirim *TOKEN PAP*
`, {
      parse_mode: "Markdown"
    });

  },

  handleMessage: async (bot, msg) => {

    const chatId = msg.chat.id;
    const text = msg.text;

    if (!sessions[chatId]) return;

    const session = sessions[chatId];
    const db = loadDB();

    // STEP TOKEN
    if (session.step === "token") {

      if (!db[text]) {
        return bot.sendMessage(chatId, "❌ Token tidak ditemukan.");
      }

      session.token = text;
      session.step = "rating";

      const pap = db[text];

      if (pap.type === "photo") {
        await bot.sendPhoto(chatId, pap.file_id);
      }

      if (pap.type === "video") {
        await bot.sendVideo(chatId, pap.file_id);
      }

      bot.sendMessage(chatId, `
⭐ Beri rating (1 - 10)
`);

    }

    // STEP RATING
    else if (session.step === "rating") {

      const rating = parseInt(text);

      if (isNaN(rating) || rating < 1 || rating > 10) {
        return bot.sendMessage(chatId, "Masukkan angka 1 - 10");
      }

      session.rating = rating;
      session.step = "comment";

      bot.sendMessage(chatId, `
💬 Kirim komentar kamu
`);

    }

    // STEP COMMENT
    else if (session.step === "comment") {

      const token = session.token;

      db[token].ratings.push({
        user: msg.from.id,
        rating: session.rating,
        comment: text
      });

      saveDB(db);

      bot.sendMessage(chatId, `
✅ Rating berhasil dikirim

⭐ Rating: ${session.rating}
💬 Komentar: ${text}
`);

      delete sessions[chatId];

    }

  }

};
