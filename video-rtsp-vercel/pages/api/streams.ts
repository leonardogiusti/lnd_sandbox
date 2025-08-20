import { NextApiRequest, NextApiResponse } from 'next';
import { getActiveStream, clearActiveStream } from '../../lib/streamState';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get current active stream
    const currentStream = getActiveStream();
    
    // Determine the host (Railway domain or localhost)
    const host = req.headers.host || 'localhost:3000';
    const isDevelopment = host.includes('localhost');
    const rtspHost = isDevelopment ? 'localhost' : host.split(':')[0];
    
    return res.status(200).json({
      activeStream: currentStream ? {
        filename: currentStream.filename,
        streamName: currentStream.streamName,
        rtspUrl: `rtsp://${rtspHost}:8554/${currentStream.streamName}`
      } : null
    });
  }

  if (req.method === 'DELETE') {
    // Stop current stream
    const currentStream = getActiveStream();
    if (currentStream) {
      try {
        currentStream.process.kill('SIGTERM');
        const stoppedStream = currentStream.filename;
        clearActiveStream();
        
        return res.status(200).json({ 
          message: 'Stream stopped',
          filename: stoppedStream
        });
      } catch (error) {
        console.error('Error stopping stream:', error);
        return res.status(500).json({ error: 'Failed to stop stream' });
      }
    } else {
      return res.status(404).json({ error: 'No active stream to stop' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}