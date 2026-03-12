module.exports = {
  command: 'help',
  description: 'Bantuan bot',

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, `
📖 *Bantuan Bot*

⭐ Rate PAP
Memberikan rating foto anonim

📤 Kirim PAP
Upload foto untuk dinilai

💌 Menfes
Kirim pesan anonim ke user lain
`, { parse_mode: "Markdown" });
  }
};
