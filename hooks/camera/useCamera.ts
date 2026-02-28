'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  photo: string | null;
  cameraActive: boolean;
  countdown: number | null;
  requestCamera: () => Promise<void>;
  startCountdown: () => void;
  stopCamera: () => void;
  resetPhoto: () => void;
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Vincular el stream al elemento <video> cuando ambos estén disponibles
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraActive]);

  const requestCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          toast.error(
            'Permiso denegado. Por favor, permite el acceso a la cámara.',
          );
        } else if (err.name === 'NotFoundError') {
          toast.error('No se encontró ninguna cámara en este dispositivo.');
        } else {
          toast.error(`Error al acceder a la cámara: ${err.message}`);
        }
      } else {
        toast.error('Error desconocido al acceder a la cámara.');
      }
    }
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/png');
      setPhoto(imageDataUrl);
    }
  }, []);

  const startCountdown = useCallback(() => {
    if (countdown !== null) return; // Ya hay un conteo en curso

    setCountdown(3);
    let remaining = 3;

    countdownRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(null);
        captureFrame();
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }, [countdown, captureFrame]);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
  }, []);

  const stopCamera = useCallback(() => {
    clearCountdown();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  }, [stream, clearCountdown]);

  const resetPhoto = useCallback(() => {
    clearCountdown();
    setPhoto(null);
  }, [clearCountdown]);

  // Limpiar el intervalo y el stream al desmontar
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    videoRef,
    canvasRef,
    photo,
    cameraActive,
    countdown,
    requestCamera,
    startCountdown,
    stopCamera,
    resetPhoto,
  };
}
