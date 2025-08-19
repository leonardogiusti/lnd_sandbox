'use client';

import { useState, useEffect } from 'react';

interface Video {
  filename: string;
  streamName: string;
  size: number;
  uploadDate: string;
  rtspUrl: string;
  isStreaming: boolean;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeStream, setActiveStream] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load videos on component mount
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const result = await response.json();
      if (response.ok) {
        setVideos(result.videos);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setUploadResult(result);
        // Reload videos list
        loadVideos();
        // Clear selected file
        setSelectedFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        console.error('Upload failed:', result.error);
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const startStream = async (filename: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stream/${filename}`, {
        method: 'POST',
      });

      const result = await response.json();
      if (response.ok) {
        setActiveStream(filename);
        alert(`Stream started for ${filename}\nRTSP URL: ${result.rtspUrl}`);
      } else {
        console.error('Stream start failed:', result.error);
        alert('Stream start failed: ' + result.error);
      }
    } catch (error) {
      console.error('Stream error:', error);
      alert('Stream start failed');
    } finally {
      setLoading(false);
    }
  };

  const stopStream = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/streams', {
        method: 'DELETE',
      });

      const result = await response.json();
      if (response.ok) {
        setActiveStream(null);
        alert('Stream stopped');
      } else {
        console.error('Stream stop failed:', result.error);
        alert('Stream stop failed: ' + result.error);
      }
    } catch (error) {
      console.error('Stream stop error:', error);
      alert('Stream stop failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Video RTSP Streamer</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Video</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {selectedFile && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Selected: {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>

              {uploadResult && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">Upload Successful!</p>
                  <p className="text-sm text-green-600">File: {uploadResult.filename}</p>
                </div>
              )}
            </div>
          </div>

          {/* Video List Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Uploaded Videos</h2>
              <button
                onClick={loadVideos}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg"
              >
                Refresh
              </button>
            </div>

            {activeStream && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-800 font-medium">Stream Active</p>
                    <p className="text-xs text-purple-600">{activeStream}</p>
                  </div>
                  <button
                    onClick={stopStream}
                    disabled={loading}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    Stop
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {videos.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No videos uploaded yet</p>
              ) : (
                videos.map((video) => (
                  <div
                    key={video.filename}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {video.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(video.size / 1024 / 1024).toFixed(2)} MB • {' '}
                          {new Date(video.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-2 flex space-x-2">
                        {activeStream === video.filename ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Streaming
                          </span>
                        ) : (
                          <button
                            onClick={() => startStream(video.filename)}
                            disabled={loading || activeStream !== null}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Stream
                          </button>
                        )}
                      </div>
                    </div>
                    {activeStream === video.filename && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <p className="text-gray-600">RTSP URL:</p>
                        <p className="font-mono text-blue-600 break-all">{video.rtspUrl}</p>
                        <p className="text-gray-500 mt-1">Open in VLC: Media → Open Network Stream</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}