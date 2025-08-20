import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      return res.status(200).json({ videos: [] });
    }

    const files = fs.readdirSync(uploadDir);
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];
    
    const videos = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return videoExtensions.includes(ext);
      })
      .map(filename => {
        const filePath = path.join(uploadDir, filename);
        const stats = fs.statSync(filePath);
        const streamName = filename.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
        
        // Determine the host (Railway domain or localhost)
        const host = req.headers.host || 'localhost:3000';
        const isDevelopment = host.includes('localhost');
        const rtspHost = isDevelopment ? 'localhost' : host.split(':')[0];
        
        return {
          filename,
          streamName,
          size: stats.size,
          uploadDate: stats.ctime.toISOString(),
          rtspUrl: `rtsp://${rtspHost}:8554/${streamName}`,
          isStreaming: false // Will be updated by frontend polling
        };
      })
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    res.status(200).json({ videos });
  } catch (error) {
    console.error('Error listing videos:', error);
    res.status(500).json({ error: 'Failed to list videos' });
  }
}