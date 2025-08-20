FROM node:18-alpine

# Install FFmpeg and other system dependencies
RUN apk add --no-cache \
    ffmpeg \
    wget \
    bash \
    curl

# Install MediaMTX
RUN wget -O /tmp/mediamtx.tar.gz https://github.com/bluenviron/mediamtx/releases/download/v1.14.0/mediamtx_v1.14.0_linux_amd64.tar.gz && \
    tar -xzf /tmp/mediamtx.tar.gz -C /usr/local/bin && \
    chmod +x /usr/local/bin/mediamtx && \
    rm /tmp/mediamtx.tar.gz

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Make startup script executable
RUN chmod +x start-railway.sh

# Expose ports (3000 for Next.js, 8554 for RTSP)
EXPOSE 3000 8554

# Start the application
CMD ["npm", "run", "start:railway"]