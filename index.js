const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/mp3', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });
    const title = info.videoDetails.title;

    res.json({
      success: true,
      title,
      downloadUrl: format.url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to process video' });
  }
});

app.get('/mp4', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { filter: 'videoandaudio', quality: 'highestvideo' });
    const title = info.videoDetails.title;

    res.json({
      success: true,
      title,
      downloadUrl: format.url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to process video' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('✅ YouTube API running on port 3000');
});
