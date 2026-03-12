const sessions = {};

module.exports = {
  command: 'menfes',
  description: 'Menfes anonim',

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;

    sessions[chatId] = {
      step: "mode"
    };

    bot.sendMessage(chatId, `
💌 *Mode Menfes*

Pilih mode pengiriman:
`, {
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [
          ['🎯 Target ID'],
          ['🎲 Random'],
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

    if (session.step === "mode") {

      if (text === "🎯 Target ID") {
        session.step = "target";

        bot.sendMessage(chatId,
          "Masukkan *User ID* tujuan:",
          { parse_mode: "Markdown" }
        );
      }

      if (text === "🎲 Random") {
        bot.sendMessage(chatId,
          "🚧 Mode random masih dalam pengembangan."
        );
      }

    }

    else if (session.step === "target") {

      session.target = text;
      session.step = "message";

      bot.sendMessage(chatId,
        "✉️ Sekarang kirim pesan menfes kamu:"
      );

    }

    else if (session.step === "message") {

      try {

        await bot.sendMessage(
          session.target,
          `💌 *Pesan Menfes*

${text}

_Ini adalah pesan anonim_`,
          { parse_mode: "Markdown" }
        );

        bot.sendMessage(chatId, "✅ Menfes berhasil dikirim!");

      } catch (err) {

        bot.sendMessage(chatId,
          "❌ Gagal mengirim menfes.\nPastikan user sudah pernah start bot."
        );

      }

      delete sessions[chatId];
    }

  }
};
