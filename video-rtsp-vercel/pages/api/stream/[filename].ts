import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { getActiveStream, setActiveStream, clearActiveStream } from '../../../lib/streamState';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;
  
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Filename is required' });
  }

  const videoPath = path.join(process.cwd(), 'uploads', filename);
  
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Video file not found' });
  }

  if (req.method === 'GET') {
    // Return video info
    return res.status(200).json({
      filename,
      rtspUrl: `rtsp://localhost:8554/${filename}`,
      status: 'ready'
    });
  }

  if (req.method === 'POST') {
    // Start RTSP streaming - ensure only one stream at a time
    try {
      // Stop any existing stream
      const currentStream = getActiveStream();
      if (currentStream) {
        console.log('Stopping existing stream:', currentStream.filename);
        currentStream.process.kill('SIGTERM');
        clearActiveStream();
      }

      // Generate a simple stream name (only alphanumeric and underscore)
      const streamName = filename.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
      
      // Determine the host (Railway domain or localhost)
      const host = req.headers.host || 'localhost:3000';
      const isDevelopment = host.includes('localhost');
      const rtspHost = isDevelopment ? 'localhost' : host.split(':')[0];
      
      const rtspPublishUrl = `rtsp://localhost:8554/${streamName}`; // Internal publishing
      const rtspPlayUrl = `rtsp://${rtspHost}:8554/${streamName}`; // External RTSP access
      
      // FFmpeg args for looping RTSP streaming with VLC compatibility
      const ffmpegArgs = [
        '-stream_loop', '-1', // Loop the input indefinitely
        '-re', // Read input at native frame rate (essential for live streaming)
        '-i', videoPath,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-profile:v', 'baseline',
        '-level', '3.0',
        '-pix_fmt', 'yuv420p',
        '-g', '30', // Smaller GOP for better seeking
        '-keyint_min', '15',
        '-sc_threshold', '0',
        '-b:v', '1000k',
        '-maxrate', '1500k',
        '-bufsize', '2000k',
        '-c:a', 'aac',
        '-b:a', '64k',
        '-ar', '44100',
        '-ac', '2',
        '-avoid_negative_ts', 'make_zero',
        '-fflags', '+genpts',
        '-f', 'rtsp',
        rtspPublishUrl
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      
      // Track the active stream
      setActiveStream({
        process: ffmpeg,
        filename: filename as string,
        streamName
      });

      ffmpeg.stdout.on('data', (data) => {
        console.log(`FFmpeg stdout: ${data}`);
      });

      ffmpeg.stderr.on('data', (data) => {
        console.log(`FFmpeg stderr: ${data}`);
      });

      ffmpeg.on('error', (error) => {
        console.error('FFmpeg spawn error:', error.message);
        if (error.message.includes('ENOENT')) {
          return res.status(500).json({ 
            error: 'FFmpeg not found. Please install FFmpeg first.',
            installInstructions: {
              mac: 'brew install ffmpeg',
              linux: 'apt-get install ffmpeg or yum install ffmpeg',
              windows: 'Download from https://ffmpeg.org/download.html'
            }
          });
        }
      });

      ffmpeg.on('close', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
        // Clear active stream when it ends
        const currentStream = getActiveStream();
        if (currentStream && currentStream.filename === filename) {
          clearActiveStream();
        }
      });

      // Give FFmpeg a moment to start
      setTimeout(() => {
        res.status(200).json({
          message: 'RTSP stream started',
          rtspUrl: rtspPlayUrl,
          publishUrl: rtspPublishUrl,
          filename,
          streamName,
          instructions: 'Open the RTSP URL in VLC Media Player'
        });
      }, 2000);

    } catch (error) {
      console.error('Stream start error:', error);
      res.status(500).json({ error: 'Failed to start RTSP stream' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}