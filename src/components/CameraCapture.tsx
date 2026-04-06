'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  prompt: string;
}

export default function CameraCapture({ onCapture, prompt }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setIsReady(true);
        }
      } catch {
        if (!cancelled) setHasCamera(false);
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob);
      },
      'image/jpeg',
      0.85
    );
  }, [onCapture]);

  // File input fallback
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onCapture(file);
  }

  if (!hasCamera) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-gray-500 text-center mb-2">{prompt}</p>
        <label className="bg-orange hover:bg-orange-dark text-white font-bold py-4 px-8 rounded-xl cursor-pointer transition-colors text-lg">
          Choose Photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="camera-viewfinder w-full aspect-[3/4] max-h-[60vh] rounded-2xl overflow-hidden relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="w-8 h-8 border-3 border-orange border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {/* Prompt overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
          <p className="text-white text-sm font-medium text-center">{prompt}</p>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={capture}
        disabled={!isReady}
        className="mt-4 w-20 h-20 rounded-full border-4 border-white bg-orange hover:bg-orange-dark transition-colors shadow-xl flex items-center justify-center disabled:opacity-50"
        aria-label="Take photo"
      >
        <div className="w-14 h-14 rounded-full bg-white/20" />
      </button>
    </div>
  );
}
