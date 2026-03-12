const sessions = {};

function generateToken() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = {
  command: 'kirimpap',
  description: 'Upload PAP untuk dinilai',

  execute: async (bot, msg) => {

    const chatId = msg.chat.id;

    sessions[chatId] = {
      step: "mode"
    };

    bot.sendMessage(chatId, `
📤 *Kirim PAP*

Pilih mode pengiriman:
`, {
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [
          ['🌍 Public'],
          ['🔒 Private'],
          ['⬅️ Kembali']
        ],
        resize_keyboard: true
      }
    });

  },

  handleMessage: async (bot, msg) => {

    const chatId = msg.chat.id;
    const text = msg.text;

    if (!sessions[chatId]) return;

    const session = sessions[chatId];

    // STEP MODE
    if (session.step === "mode") {

      if (text === "🌍 Public" || text === "🔒 Private") {

        session.mode = text;
        session.step = "upload";

        bot.sendMessage(chatId, `
📷 Silakan kirim *foto atau video PAP* kamu
`, { parse_mode: "Markdown" });

      }

    }

    // STEP UPLOAD
    else if (session.step === "upload") {

      if (msg.photo || msg.video) {

        session.step = "token";

        const token = generateToken();

        session.token = token;

        bot.sendMessage(chatId, `
✅ PAP berhasil dikirim!

🔑 *Token PAP:* \`${token}\`

Gunakan token ini di menu *Rate PAP* agar orang bisa memberi rating.
`, {
          parse_mode: "Markdown"
        });

        delete sessions[chatId];

      } else {

        bot.sendMessage(chatId, "❌ Kirim *foto atau video* ya.", {
          parse_mode: "Markdown"
        });

      }

    }

  }

};
