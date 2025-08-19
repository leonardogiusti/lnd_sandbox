// Shared stream state across API routes
export let activeStream: { 
  process: any, 
  filename: string, 
  streamName: string 
} | null = null;

export function setActiveStream(stream: typeof activeStream) {
  activeStream = stream;
}

export function getActiveStream() {
  return activeStream;
}

export function clearActiveStream() {
  activeStream = null;
}