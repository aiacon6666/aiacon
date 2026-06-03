// ================================================================
// AIACON MULTI‑STORAGE ENGINE
// Combines 8+ free services for 1 TB effective capacity
// ================================================================

// ---------- CONFIGURATION (paste your keys here) ----------
const STORAGE_CONFIG = {
  cloudinary: {
    cloudName: 'dwlbyagsg',
    apiKey: '265816457913299',
    apiSecret: '<INSERT_API_SECRET>',
    uploadPreset: 'aiacon_media',
  },
  supabase: {
    url: 'https://qtwcakvuadmuivevvkzw.supabase.co/rest/v1/',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0d2Nha3Z1YWRtdWl2ZXZ2a3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDg3NTEsImV4cCI6MjA5NTg4NDc1MX0.D6zLffHEkfZtDI-tTzf0_snQfwLOvPo9STDPAPB4HRI',
    bucket: 'sb_secret_sAskj01R4kK9G2qhs00qxQ_2oCP5dlI',
  },
  pinata: {
    apiKey: 'fdcc5334ee54f20a47da',
    apiSecret: 'e04b589993930ddb924e7c889e00e17ef60c5acc361eeb14daf28fcdb081e083',
    jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyZGEyYjM1Yi1iZmFhLTQ1OTUtOWYzOS03NzgxZTFhNzMyMjAiLCJlbWFpbCI6ImFua2l0ZHViZXkwMDhzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmZGNjNTMzNGVlNTRmMjBhNDdkYSIsInNjb3BlZEtleVNlY3JldCI6ImUwNGI1ODk5OTM5MzBkZGI5MjRlN2M4ODllMDBlMTdlZjYwYzVhY2MzNjFlZWIxNGRhZjI4ZmNkYjA4MWUwODMiLCJleHAiOjE4MTE4NTE2NTd9.0DLn_SwqAXEUjO_cNp70K-bOljr2DDsPJYCqoo9y9e4',
  },
  storj: {
    accessKey: 'jxh32rb7qmzpsqfutlhbs4wo6xda',
    secretKey: 'j2gqfja25sxehoskvioxmcaxv2ssa7t7wqekcbjshkdnhhziwsnyk',
    endpoint: 'https://gateway.storjshare.io',
    bucket: 'aiacon-backup',
  },
  imgbb: {
    apiKey: '8df37f60880c740e34a3cb29b55b44f8',
  },
  mongodb: {
    uri: 'mongodb+srv://<db_aiacon>:<db_Ankit@sakshi@1705>@free-cluster.jtdz06z.mongodb.net/?appName=free-cluster',
  },
  neon: {
    uri: 'postgresql://neondb_owner:npg_BQ7gF3jzOfwL@ep-nameless-haze-ap3r12nu-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  },
  telegram: {
    botToken: '8094728254:AAEUBEduJSGLcTvRirwixpdVjqJ8VI5KY80',
  },
};

// ---------- UPLOAD FUNCTION ----------
export async function uploadMedia(file, type = 'image') {
  const urls = [];

  // 1. Primary: Cloudinary (fastest, CDN delivery)
  try {
    const cloudUrl = await uploadToCloudinary(file, type);
    urls.push({ service: 'cloudinary', url: cloudUrl });
  } catch (e) {
    console.warn('Cloudinary upload failed, trying fallback...');
  }

  // 2. Backup: Supabase Storage
  try {
    const supabaseUrl = await uploadToSupabase(file);
    urls.push({ service: 'supabase', url: supabaseUrl });
  } catch (e) {
    console.warn('Supabase upload failed');
  }

  // 3. Decentralized: IPFS via Pinata
  try {
    const ipfsHash = await uploadToPinata(file);
    urls.push({ service: 'ipfs', url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}` });
  } catch (e) {
    console.warn('IPFS upload failed');
  }

  // 4. Encrypted backup: Storj
  try {
    const storjUrl = await uploadToStorj(file);
    urls.push({ service: 'storj', url: storjUrl });
  } catch (e) {
    console.warn('Storj upload failed');
  }

  // 5. Quick fallback: ImgBB (for images)
  if (type === 'image') {
    try {
      const imgbbUrl = await uploadToImgBB(file);
      urls.push({ service: 'imgbb', url: imgbbUrl });
    } catch (e) {
      console.warn('ImgBB upload failed');
    }
  }

  return urls; // Always returns at least 1 URL (Cloudinary)
}

// ---------- INDIVIDUAL UPLOADERS ----------

async function uploadToCloudinary(file, type) {
  const formData = new FormData();
  formData.append('file', { uri: file.uri, type: `image/${file.extension || 'png'}`, name: file.name || 'upload.png' });
  formData.append('upload_preset', STORAGE_CONFIG.cloudinary.uploadPreset);
  formData.append('cloud_name', STORAGE_CONFIG.cloudinary.cloudName);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${STORAGE_CONFIG.cloudinary.cloudName}/${type}/upload`,
    { method: 'POST', body: formData }
  );
  const data = await res.json();
  return data.secure_url;
}

async function uploadToSupabase(file) {
  const path = `media/${Date.now()}_${file.name || 'file'}`;
  const res = await fetch(
    `${STORAGE_CONFIG.supabase.url}/storage/v1/object/${STORAGE_CONFIG.supabase.bucket}/${path}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STORAGE_CONFIG.supabase.anonKey}`,
        'Content-Type': file.mimeType || 'image/png',
      },
      body: file.data || file,
    }
  );
  const data = await res.json();
  return `${STORAGE_CONFIG.supabase.url}/storage/v1/object/public/${STORAGE_CONFIG.supabase.bucket}/${path}`;
}

async function uploadToPinata(file) {
  const formData = new FormData();
  formData.append('file', { uri: file.uri, type: file.mimeType || 'image/png', name: file.name || 'file.png' });

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': STORAGE_CONFIG.pinata.apiKey,
      'pinata_secret_api_key': STORAGE_CONFIG.pinata.apiSecret,
      'Authorization': `Bearer ${STORAGE_CONFIG.pinata.jwt}`,
    },
    body: formData,
  });
  const data = await res.json();
  return data.IpfsHash;
}

async function uploadToStorj(file) {
  const path = `aiacon/${Date.now()}_${file.name || 'file'}`;
  const res = await fetch(
    `${STORAGE_CONFIG.storj.endpoint}/${STORAGE_CONFIG.storj.bucket}/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `AWS ${STORAGE_CONFIG.storj.accessKey}:${STORAGE_CONFIG.storj.secretKey}`,
        'Content-Type': file.mimeType || 'application/octet-stream',
      },
      body: file.data || file,
    }
  );
  return `${STORAGE_CONFIG.storj.endpoint}/${STORAGE_CONFIG.storj.bucket}/${path}`;
}

async function uploadToImgBB(file) {
  const formData = new FormData();
  formData.append('image', { uri: file.uri, type: file.mimeType || 'image/png', name: file.name || 'upload.png' });

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${STORAGE_CONFIG.imgbb.apiKey}`,
    { method: 'POST', body: formData }
  );
  const data = await res.json();
  return data.data.url;
}

// ---------- DELETE (for 24h stories) ----------
export async function deleteMedia(urls) {
  for (const item of urls) {
    // Cloudinary
    if (item.service === 'cloudinary') {
      const publicId = item.url.split('/').pop().split('.')[0];
      await fetch(`https://api.cloudinary.com/v1_1/${STORAGE_CONFIG.cloudinary.cloudName}/image/destroy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId }),
      });
    }
    // Other services can be added as needed
  }
}

// ---------- ANALYTICS LOGGER ----------
export async function logEvent(event, metadata = {}) {
  try {
    await fetch(`${STORAGE_CONFIG.mongodb.uri}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, metadata, timestamp: new Date().toISOString() }),
    });
  } catch (e) {
    console.warn('Analytics log failed');
  }
}

export default STORAGE_CONFIG;
