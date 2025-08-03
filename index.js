const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core'); // ✅ Use maintained fork
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('🎵 YouTube MP3/MP4 API is running');
});

// 🔸 MP4 Download Endpoint
app.get('/mp4', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ success: false, message: '❌ Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: '18' }); // 360p MP4

    if (!format || !format.url) {
      return res.status(500).json({ success: false, message: '❌ Failed to get MP4 format' });
    }

    res.json({
      success: true,
      title: info.videoDetails.title,
      downloadUrl: format.url
    });

  } catch (err) {
    console.error('[MP4 Error]', err);
    return res.status(500).json({ success: false, message: '❌ Failed to process video' });
  }
});

// 🔹 MP3 Conversion Endpoint
app.get('/mp3', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ success: false, message: '❌ Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title.replace(/[\\/:*?"<>|]/g, '');
    const tempFile = path.resolve(__dirname, `${Date.now()}-${title}.mp3`);

    const stream = ytdl(videoUrl, { quality: 'highestaudio' });

    ffmpeg(stream)
      .audioBitrate(128)
      .format('mp3')
      .save(tempFile)
      .on('end', () => {
        res.download(tempFile, `${title}.mp3`, (err) => {
          if (err) {
            console.error('[Download Error]', err);
            res.status(500).send('❌ Failed to download file.');
          }
          fs.unlink(tempFile, () => {}); // Cleanup
        });
      })
      .on('error', (err) => {
        console.error('[FFmpeg Error]', err);
        res.status(500).json({ success: false, message: '❌ Failed to convert to MP3' });
      });

  } catch (err) {
    console.error('[MP3 Error]', err);
    return res.status(500).json({ success: false, message: '❌ MP3 conversion failed' });
  }
});

app.listen(PORT, () => console.log(`✅ YouTube API running on port ${PORT}`));
