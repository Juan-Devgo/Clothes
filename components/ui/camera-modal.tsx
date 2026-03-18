'use client';

import { useEffect, useRef } from 'react';
import Modal from './modal';
import { CameraIcon } from '../icons/camera';
import { useCamera } from '@/hooks/camera';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (photoDataUrl: string) => void;
}

export default function CameraModal({
  isOpen,
  onClose,
  onConfirm,
}: CameraModalProps) {
  const {
    videoRef,
    canvasRef,
    photo,
    cameraActive,
    countdown,
    requestCamera,
    startCountdown,
    stopCamera,
    resetPhoto,
  } = useCamera();

  // Ref para acceder a stopCamera/resetPhoto sin causar re-ejecución del efecto
  const stopCameraRef = useRef(stopCamera);
  const resetPhotoRef = useRef(resetPhoto);
  useEffect(() => {
    stopCameraRef.current = stopCamera;
    resetPhotoRef.current = resetPhoto;
  }, [stopCamera, resetPhoto]);

  // Solicitar cámara al abrir el modal y detenerla al cerrarlo
  useEffect(() => {
    if (isOpen) {
      requestCamera();
    } else {
      stopCameraRef.current();
      resetPhotoRef.current();
    }
  }, [isOpen, requestCamera]);

  // Detener cámara al cerrar el modal
  const handleClose = () => {
    stopCamera();
    resetPhoto();
    onClose();
  };

  const handleRetake = () => {
    resetPhoto();
    requestCamera();
  };

  const handleConfirm = () => {
    if (photo) {
      stopCamera();
      onConfirm(photo);
      resetPhoto();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Captura de Foto">
      <div className="flex flex-col gap-4">
        {/* Preview del video en vivo */}
        {cameraActive && !photo && (
          <div className="relative w-full rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg bg-black aspect-video object-cover"
            />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <span
                  className="text-white text-7xl font-bold drop-shadow-lg animate-ping"
                  style={{ animationDuration: '1s' }}
                >
                  {countdown}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Vista previa de la foto capturada */}
        {photo && (
          <img
            src={photo}
            alt="Foto capturada"
            className="w-full rounded-lg aspect-video object-contain bg-gray-100"
          />
        )}

        {/* Estado inicial / sin cámara */}
        {!cameraActive && !photo && (
          <div className="w-full rounded-lg bg-gray-100 aspect-video flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <CameraIcon className="w-12 h-12" />
              <span className="text-sm">Iniciando cámara...</span>
            </div>
          </div>
        )}

        {/* Canvas oculto para capturar la foto */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controles */}
        <div className="flex gap-3">
          {!photo ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={startCountdown}
                disabled={!cameraActive || countdown !== null}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CameraIcon className="w-4 h-4 [&_path]:fill-white" />
                {countdown !== null ? `${countdown}...` : 'Tomar foto'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                Volver a tomar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
              >
                Usar esta foto
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
