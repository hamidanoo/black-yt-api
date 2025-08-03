const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/mp4', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title;
    const format = ytdl.chooseFormat(info.formats, { quality: '18' }); // 360p mp4
    if (!format || !format.url) {
      return res.status(500).json({ success: false, message: 'Failed to get MP4 format' });
    }

    return res.json({
      success: true,
      title,
      downloadUrl: format.url
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to process video' });
  }
});

app.get('/', (req, res) => {
  res.send('YouTube MP4 API is Running ✅');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
