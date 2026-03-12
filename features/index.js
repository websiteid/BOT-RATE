require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api')

const BOT_TOKEN = process.env.BOT_TOKEN
const ADMIN_ID = process.env.ADMIN_ID
const CHANNEL_ID = process.env.CHANNEL_ID

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN tidak ditemukan di .env")
  process.exit(1)
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true })

/* ===============================
   DATABASE SEMENTARA
================================= */

const userState = new Map()
const tokenStore = new Map()

/* ===============================
   UTILITIES
================================= */

function genToken() {
  let token
  do {
    token = Math.floor(1000 + Math.random() * 9000).toString()
  } while (tokenStore.has(token))

  return token
}

function getUsername(user) {
  return user.username ? '@' + user.username : user.first_name
}

function reset(chatId) {
  userState.delete(chatId)
}

function backKeyboard() {
  return {
    reply_markup: {
      keyboard: [['⬅️ Kembali']],
      resize_keyboard: true
    }
  }
}

function mainMenu(chatId) {
  reset(chatId)

  bot.sendMessage(chatId, '📋 *Menu Utama*', {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [
        ['⭐ Rate PAP', '📤 Kirim PAP'],
        ['💌 Menfes', '❓ Help'],
        ['🔞 VIP Video']
      ],
      resize_keyboard: true
    }
  })
}

/* ===============================
   START COMMAND
================================= */

bot.onText(/\/start/, (msg) => {
  mainMenu(msg.chat.id)
})

/* ===============================
   MESSAGE HANDLER
================================= */

bot.on('message', async (msg) => {

  const chatId = msg.chat.id
  const text = msg.text
  const state = userState.get(chatId)

  /* ===== BACK BUTTON ===== */

  if (text === '⬅️ Kembali') {
    return mainMenu(chatId)
  }

  /* ===== MENU ===== */

  if (text === '⭐ Rate PAP') {

    userState.set(chatId, { step: 'rate_token' })

    return bot.sendMessage(
      chatId,
      '🔑 Kirim token PAP',
      backKeyboard()
    )
  }

  if (text === '📤 Kirim PAP') {

    userState.set(chatId, { step: 'pap_mode' })

    return bot.sendMessage(chatId, 'Pilih mode PAP', {
      reply_markup: {
        keyboard: [
          ['🕶 Anonim', '🙍 Non Anonim'],
          ['⬅️ Kembali']
        ],
        resize_keyboard: true
      }
    })
  }

  if (text === '💌 Menfes') {

    userState.set(chatId, { step: 'menfes_mode' })

    return bot.sendMessage(chatId, 'Pilih mode Menfes', {
      reply_markup: {
        keyboard: [
          ['🕶 Anonim', '🙍 Non Anonim'],
          ['⬅️ Kembali']
        ],
        resize_keyboard: true
      }
    })
  }

  if (text === '❓ Help') {

    return bot.sendMessage(chatId,
`ℹ️ *Help Bot*

⭐ *Rate PAP*
Kirim token lalu beri rating.

📤 *Kirim PAP*
Upload foto/video dan dapat token.

💌 *Menfes*
Kirim pesan anonim ke channel.

🔞 *VIP Video*
Akses konten VIP.`,
{
  parse_mode: 'Markdown',
  reply_markup: {
    keyboard: [['⬅️ Kembali']],
    resize_keyboard: true
  }
})
  }

  if (text === '🔞 VIP Video') {

    return bot.sendMessage(
      chatId,
      '🔞 BELI VIDEO MURAH DISINI\n@vvip_3_bot'
    )
  }

  if (!state) return

  /* ===============================
     RATE PAP
  ================================= */

  if (state.step === 'rate_token') {

    const data = tokenStore.get(text)

    if (!data) {
      return bot.sendMessage(chatId, '❌ Token tidak valid')
    }

    userState.set(chatId, {
      step: 'rate_emoji',
      targetUser: data.ownerId
    })

    await bot.copyMessage(
      chatId,
      data.ownerId,
      data.mediaMsgId,
      {
        caption: data.caption,
        protect_content: true
      }
    )

    return bot.sendMessage(chatId, 'Pilih rating', {
      reply_markup: {
        keyboard: [
          ['😍', '🔥', '👍', '😐'],
          ['👎', '🤢', '💀', '🤡'],
          ['⬅️ Kembali']
        ],
        resize_keyboard: true
      }
    })
  }

  if (state.step === 'rate_emoji') {

    const username = getUsername(msg.from)

    await bot.sendMessage(
      state.targetUser,
      `⭐ Rating dari ${username}: ${text}`
    )

    userState.set(chatId, {
      step: 'rate_comment',
      targetUser: state.targetUser
    })

    return bot.sendMessage(chatId,
      'Tambah komentar?',
      {
        reply_markup: {
          keyboard: [
            ['✍️ Kirim Komentar', '🚫 Tidak'],
            ['⬅️ Kembali']
          ],
          resize_keyboard: true
        }
      })
  }

  if (state.step === 'rate_comment') {

    if (text === '🚫 Tidak') {
      return mainMenu(chatId)
    }

    if (text === '✍️ Kirim Komentar') {

      userState.set(chatId, {
        step: 'rate_comment_text',
        targetUser: state.targetUser
      })

      return bot.sendMessage(chatId, '✍️ Tulis komentar')
    }
  }

  if (state.step === 'rate_comment_text') {

    const username = getUsername(msg.from)

    await bot.sendMessage(
      state.targetUser,
      `💬 Komentar dari ${username}:\n${text}`
    )

    return mainMenu(chatId)
  }

  /* ===============================
     KIRIM PAP
  ================================= */

  if (state.step === 'pap_mode' && (text === '🕶 Anonim' || text === '🙍 Non Anonim')) {

    userState.set(chatId, {
      step: 'pap_media',
      anon: text === '🕶 Anonim'
    })

    return bot.sendMessage(
      chatId,
      '📎 Kirim PAP (foto/video)',
      backKeyboard()
    )
  }

  if (state.step === 'pap_media' && (msg.photo || msg.video || msg.document)) {

    const token = genToken()
    const username = getUsername(msg.from)
    const caption = msg.caption || '—'

    tokenStore.set(token, {
      ownerId: chatId,
      mediaMsgId: msg.message_id,
      caption
    })

    await bot.sendMessage(
      CHANNEL_ID,
`📥 PAP BARU
🔑 Token: <code>${token}</code>
👤 ${state.anon ? 'Anonim' : username}

➡️ Kirim token ke bot`,
{
  parse_mode: 'HTML'
})

    await bot.sendMessage(
      ADMIN_ID,
`📥 PAP
User: ${username}
Token: ${token}`
    )

    await bot.sendMessage(
      chatId,
      `✅ PAP terkirim\nToken: ${token}`
    )

    return mainMenu(chatId)
  }

  /* ===============================
     MENFES
  ================================= */

  if (state.step === 'menfes_mode' && (text === '🕶 Anonim' || text === '🙍 Non Anonim')) {

    userState.set(chatId, {
      step: 'menfes_text',
      anon: text === '🕶 Anonim'
    })

    return bot.sendMessage(
      chatId,
      '✍️ Tulis menfes',
      backKeyboard()
    )
  }

  if (state.step === 'menfes_text') {

    const username = getUsername(msg.from)

    await bot.sendMessage(
      CHANNEL_ID,
`💌 MENFES

Mode: ${state.anon ? 'Anonim' : 'Non Anonim'}
${state.anon ? '' : 'User: ' + username}

Pesan:
${text}`
    )

    await bot.sendMessage(
      ADMIN_ID,
`📩 MENFES
User: ${username}

${text}`
    )

    await bot.sendMessage(chatId, '✅ Menfes berhasil dikirim')

    return mainMenu(chatId)
  }

})

/* ===============================
   ERROR HANDLER
================================= */

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

console.log('🤖 Bot aktif...')
