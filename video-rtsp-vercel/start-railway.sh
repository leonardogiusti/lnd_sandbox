#!/bin/bash

# Railway startup script for video-rtsp-vercel
echo "Starting video-rtsp-vercel on Railway..."

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Install system dependencies if needed
echo "Installing system dependencies..."

# Start MediaMTX in the background
echo "Starting MediaMTX RTSP server..."
mediamtx mediamtx.yml &
MEDIAMTX_PID=$!

# Wait a moment for MediaMTX to start
sleep 2

# Start Next.js application
echo "Starting Next.js application..."
next start

# If Next.js exits, also kill MediaMTX
kill $MEDIAMTX_PID 2>/dev/null