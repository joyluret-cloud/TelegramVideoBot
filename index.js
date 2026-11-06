const TelegramBot = require('node-telegram-bot-api');
const ytDlp = require('yt-dlp-exec');
const fs = require('fs');
const path = require('path');

// Bot akan membaca Token secara otomatis dari Environment Variable Render
const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

const downloadDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

console.log('Bot telegram downloader aktif di cloud!');

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Halo! Kirimkan link video (YouTube, TikTok, Instagram, dll) dan saya akan mendownloadnya untuk Anda.');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/start') || !text.startsWith('http')) return;

  const statusMsg = await bot.sendMessage(chatId, '⏳ Sedang mendownload video, mohon tunggu...');
  const outputPath = path.join(downloadDir, `${Date.now()}.mp4`);

  try {
    await ytDlp(text, {
      output: outputPath,
      format: 'mp4/b[ext=mp4]/b',
    });

    await bot.sendMessage(chatId, '📤 Mengirim video...');
    await bot.sendVideo(chatId, outputPath);
    bot.deleteMessage(chatId, statusMsg.message_id);
    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, '❌ Gagal mengunduh video. Pastikan link valid.');
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  }
});
