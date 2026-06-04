import { telegramBotToken } from '../config/keys';

// Upload file to Telegram and return file ID
export const uploadToTelegram = async (fileUri, fileName) => {
  const formData = new FormData();
  formData.append('chat_id', 'YOUR_CHANNEL_ID'); // Replace with your Telegram channel username or ID
  formData.append('document', {
    uri: fileUri,
    type: 'application/octet-stream',
    name: fileName,
  });
  const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendDocument`, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const data = await response.json();
  if (data.ok && data.result.document) {
    return data.result.document.file_id;
  } else {
    throw new Error('Telegram upload failed: ' + JSON.stringify(data));
  }
};

// Get file URL from Telegram (usable for 1 hour)
export const getTelegramFileUrl = async (fileId) => {
  const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getFile?file_id=${fileId}`);
  const data = await response.json();
  if (data.ok && data.result.file_path) {
    return `https://api.telegram.org/file/bot${telegramBotToken}/${data.result.file_path}`;
  }
  throw new Error('Could not get file URL');
};
