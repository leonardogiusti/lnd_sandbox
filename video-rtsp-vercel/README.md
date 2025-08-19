# Video RTSP Streamer

A Next.js application that allows you to upload videos and stream them via RTSP for viewing in VLC Media Player.

## Features

- 📁 Upload video files (MP4, AVI, MOV, MKV, WebM)
- 🔄 Automatic video looping for continuous streaming
- 📺 RTSP streaming compatible with VLC Media Player
- 🎮 Single active stream management
- 🖥️ Clean web interface for video management

## Prerequisites

- Node.js 18+ 
- FFmpeg (for video processing)
- MediaMTX (for RTSP server)

### Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install ffmpeg
```

**Windows:**
Download from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)

### Install MediaMTX

**macOS:**
```bash
brew install mediamtx
```

**Linux/Windows:**
Download from [https://github.com/bluenviron/mediamtx/releases](https://github.com/bluenviron/mediamtx/releases)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd video-rtsp-vercel
```

2. Install dependencies:
```bash
npm install
```

3. Start the RTSP server:
```bash
mediamtx mediamtx.yml
```

4. Start the Next.js development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload a Video**: Use the upload form to select and upload a video file
2. **Start Streaming**: Click the "Stream" button next to any uploaded video
3. **Open in VLC**: 
   - Open VLC Media Player
   - Go to Media → Open Network Stream
   - Enter the RTSP URL (e.g., `rtsp://localhost:8554/videoname`)
   - Click Play

## Technical Details

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Video Processing**: FFmpeg with H.264 encoding
- **RTSP Server**: MediaMTX for stream distribution
- **Upload Handling**: Multer for multipart file uploads
- **Stream Management**: Shared state across API routes

## Configuration

### MediaMTX Configuration (`mediamtx.yml`)
- Supports UDP, TCP, and multicast transports
- Configured for VLC compatibility
- Dynamic path publishing enabled

### FFmpeg Parameters
- Real-time streaming with `-re` flag
- H.264 Baseline profile for maximum compatibility
- Infinite looping with `-stream_loop -1`
- Optimized for low-latency streaming

## API Endpoints

- `POST /api/upload` - Upload video files
- `GET /api/videos` - List all uploaded videos
- `POST /api/stream/[filename]` - Start RTSP stream
- `GET /api/streams` - Get active stream info
- `DELETE /api/streams` - Stop active stream

## Deployment

⚠️ **This application cannot be deployed to Vercel** due to requirements for:
- FFmpeg binaries
- Long-running MediaMTX process  
- Child process spawning

### Railway Deployment (Recommended)

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up
2. **Connect GitHub**: Link your GitHub account to Railway
3. **Deploy from GitHub**:
   - Click "New Project" → "Deploy from GitHub Repo"
   - Select `archetypeai/lnd_sandbox`
   - Choose the `video-rtsp-vercel` directory
   - Select the `remote_server` branch
4. **Configure Environment**:
   - Railway will automatically detect the Nixpacks configuration
   - FFmpeg and MediaMTX will be installed automatically
5. **Custom Domain** (Optional):
   - Go to Settings → Domains
   - Generate a Railway domain or add your custom domain

**Railway Features:**
- ✅ Automatic FFmpeg installation
- ✅ Long-running process support
- ✅ Built-in HTTPS
- ✅ Easy scaling
- ✅ Automatic deployments from GitHub

### Alternative Platforms:
- **Render**: Similar setup with Dockerfile
- **DigitalOcean Droplets**: Manual server setup
- **AWS EC2**: Full control VPS
- **Google Cloud VM**: Enterprise-grade deployment

## Troubleshooting

**VLC can't connect:**
- Ensure MediaMTX is running on port 8554
- Check that the stream is active before connecting
- Try both TCP and UDP transport in VLC settings

**Upload fails:**
- Check file size (max 100MB)
- Ensure supported video format
- Verify uploads directory exists and is writable

**FFmpeg not found:**
- Install FFmpeg and ensure it's in your PATH
- On macOS: `brew install ffmpeg`
- On Ubuntu: `sudo apt install ffmpeg`

## License

MIT License - feel free to use this project for your own purposes.