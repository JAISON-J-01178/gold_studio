const crypto = require('crypto');

// Cloudinary Credentials (Server-side only)
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'vwixoh1t';
const API_KEY = process.env.CLOUDINARY_API_KEY || '433947526952989';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'XQXRx-Wi5Ux-kusLC_6ZjDiPGEI';

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { public_id, resource_type } = req.body || {};
    if (!public_id) {
      return res.status(400).json({ error: 'public_id is required' });
    }

    const type = resource_type || 'image';
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Cryptographic signature parameters
    const params = {
      public_id: public_id,
      timestamp: timestamp
    };

    const sortedKeys = Object.keys(params).sort();
    let signatureString = '';
    sortedKeys.forEach((key, index) => {
      signatureString += `${key}=${params[key]}`;
      if (index < sortedKeys.length - 1) {
        signatureString += '&';
      }
    });

    // Concatenate secret
    signatureString += API_SECRET;

    // Generate SHA-1 signature
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    // POST request to Cloudinary API
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/destroy`;

    const formData = new URLSearchParams();
    formData.append('public_id', public_id);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', API_KEY);
    formData.append('signature', signature);

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const result = await response.json();
    return res.status(200).json(result);
  } catch (err) {
    console.error('Asset destruction error:', err);
    return res.status(500).json({ error: 'Failed to destroy asset: ' + err.message });
  }
};
