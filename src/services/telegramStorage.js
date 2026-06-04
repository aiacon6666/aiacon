import axios from 'axios';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../config/keys';

const BASE_URL = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN;

export async function uploadToTelegram(fileUri, fileType) {
  try {
    const formData = new FormData();
    const filename = fileUri.split('/').pop();
    let mimeType = 'application/octet-stream';

    if (fileType === 'image') {
      mimeType = 'image/jpeg';
      formData.append('photo', { uri: fileUri, name: filename, type: mimeType });
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      const res = await axios.post(BASE_URL + '/sendPhoto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.ok) {
        const photos = res.data.result.photo;
        return { fileId: photos[photos.length - 1].file_id, type: 'photo' };
      }
    } else if (fileType === 'video') {
      mimeType = 'video/mp4';
      formData.append('video', { uri: fileUri, name: filename, type: mimeType });
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      const res = await axios.post(BASE_URL + '/sendVideo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.ok) {
        return { fileId: res.data.result.video.file_id, type: 'video' };
      }
    } else if (fileType === 'audio') {
      mimeType = 'audio/mpeg';
      formData.append('audio', { uri: fileUri, name: filename, type: mimeType });
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      const res = await axios.post(BASE_URL + '/sendAudio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.ok) {
        return { fileId: res.data.result.audio.file_id, type: 'audio' };
      }
    } else {
      formData.append('document', { uri: fileUri, name: filename, type: mimeType });
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      const res = await axios.post(BASE_URL + '/sendDocument', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.ok) {
        return { fileId: res.data.result.document.file_id, type: 'document' };
      }
    }
    throw new Error('Upload failed');
  } catch (err) {
    console.error('Telegram upload error:', err.message);
    throw err;
  }
}

export async function getTelegramFileUrl(fileId) {
  try {
    const res = await axios.get(BASE_URL + '/getFile', { params: { file_id: fileId } });
    if (res.data.ok) {
      const filePath = res.data.result.file_path;
      return 'https://api.telegram.org/file/bot' + TELEGRAM_BOT_TOKEN + '/' + filePath;
    }
    throw new Error('getFile failed');
  } catch (err) {
    console.error('getTelegramFileUrl error:', err.message);
    throw err;
  }
}
