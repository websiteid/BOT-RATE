module.exports = {
  command: 'start',
  description: 'Menu utama bot',

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name;

    bot.sendMessage(
      chatId,
      `👋 Halo ${name}

Selamat datang di *Rate PAP Bot*

Silakan pilih menu di bawah ini.`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          keyboard: [
            ['⭐ Rate PAP', '📤 Kirim PAP'],
            ['💌 Menfes', '❓ Help']
          ],
          resize_keyboard: true
        }
      }
    );
  }
};
