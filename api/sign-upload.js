const crypto = require('crypto');

// Cloudinary Credentials (Server-side only)
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'vwixoh1t';
const API_KEY = process.env.CLOUDINARY_API_KEY || '433947526952989';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'XQXRx-Wi5Ux-kusLC_6ZjDiPGEI';

module.exports = async (req, res) => {
  // Setup CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Resolve folder parameter from query string or body
    const { folder } = { ...req.query, ...req.body };
    if (!folder) {
      return res.status(400).json({ error: 'Folder parameter is required' });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Sorting parameters alphabetically as required by Cloudinary signing API
    const params = {
      folder: folder,
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

    // Concatenate secret without a delimiter
    signatureString += API_SECRET;

    // Generate SHA-1 hash signature
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    return res.status(200).json({
      signature,
      timestamp,
      api_key: API_KEY,
      cloud_name: CLOUD_NAME
    });
  } catch (err) {
    console.error('Signature generation error:', err);
    return res.status(500).json({ error: 'Failed to generate upload signature: ' + err.message });
  }
};
