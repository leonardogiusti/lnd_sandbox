import './globals.css'

export const metadata = {
  title: 'Video RTSP Streamer',
  description: 'Upload videos and stream them via RTSP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}