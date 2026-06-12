const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy download endpoint to resolve client-side CORS limitations
app.get('/api/download', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a valid Facebook video link.'
    });
  }

  try {
    // Forward request to the specified JerryCoder API endpoint
    const targetApiUrl = `https://jerrycoder.oggyapi.workers.dev/down/fb?url=${encodeURIComponent(videoUrl)}`;
    
    const response = await axios.get(targetApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 18000
    });

    if (response.data && response.data.status === 'success') {
      return res.json(response.data);
    } else {
      return res.status(422).json({
        status: 'error',
        message: response.data?.message || 'Could not fetch video options. The link might be private, outdated, or invalid.',
        details: response.data
      });
    }
  } catch (error) {
    console.error('API Handshake Error:', error.message);
    return res.status(502).json({
      status: 'error',
      message: 'Failed to extract video links through the remote server. Please try again in a few moments.',
      error: error.message
    });
  }
});

// Match all other routes to single index.html page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`FBLightning server running at http://localhost:${PORT}`);
});