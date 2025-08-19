import { NextApiRequest, NextApiResponse } from 'next';
import { getActiveStream, clearActiveStream } from '../../lib/streamState';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get current active stream
    const currentStream = getActiveStream();
    return res.status(200).json({
      activeStream: currentStream ? {
        filename: currentStream.filename,
        streamName: currentStream.streamName,
        rtspUrl: `rtsp://localhost:8554/${currentStream.streamName}`
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