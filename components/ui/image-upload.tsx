"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import ImageIcon from "../icons/image";
import { CameraIcon } from "../icons/camera";
import CameraModal from "./camera-modal";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageUploadProps {
  /** Nombre del campo en el FormData */
  name: string;
  /** URL de la imagen existente (para modo edición) */
  existingImageUrl?: string | null;
  /** Texto alternativo de la imagen existente */
  existingImageAlt?: string;
  /** Deshabilitar los controles */
  disabled?: boolean;
  /** Errores de validación del servidor */
  serverErrors?: string[];
}

export default function ImageUpload({
  name,
  existingImageUrl,
  existingImageAlt,
  disabled = false,
  serverErrors,
}: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      setImagePreview(null);
      setImageError("El archivo debe ser una imagen (JPG, PNG, WebP).");
      return false;
    }
    if (file.size >= MAX_FILE_SIZE) {
      setImagePreview(null);
      setImageError("La imagen no debe superar los 5MB.");
      return false;
    }
    setImageError(null);
    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateFile(file)) {
        e.target.value = "";
        return;
      }
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
      setImageError(null);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCameraConfirm = (photoDataUrl: string) => {
    setImagePreview(photoDataUrl);
    setImageError(null);

    fetch(photoDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "camera-photo.png", {
          type: "image/png",
        });
        if (fileInputRef.current) {
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInputRef.current.files = dt.files;
        }
      });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Vista previa */}
      <div className="relative w-full h-36 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
        {imagePreview ? (
          <Image
            src={imagePreview}
            alt="Vista previa"
            fill
            unoptimized
            className="object-contain rounded-lg"
          />
        ) : existingImageUrl && !showFallback ? (
          <Image
            src={existingImageUrl}
            alt={existingImageAlt || "Imagen actual"}
            fill
            className="object-contain rounded-lg"
            onError={() => setShowFallback(true)}
          />
        ) : (
          <span className="text-gray-400">
            <ImageIcon className="w-10 h-10" />
          </span>
        )}
      </div>

      {/* Controles */}
      <div className="flex gap-2 flex-wrap items-center">
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 min-w-0 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon className="w-4 h-4" />
          Subir imagen
          <input
            ref={fileInputRef}
            type="file"
            name={name}
            accept="image/*"
            disabled={disabled}
            onChange={handleImageChange}
            className="hidden"
          />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setCameraModalOpen(true)}
          className="flex-1 min-w-0 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CameraIcon />
          Tomar foto
        </button>

        {imagePreview && (
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled}
            className="flex-1 min-w-0 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">&times;</span> Quitar
          </button>
        )}

        <p className="text-xs text-gray-400 w-full text-center">
          JPG, PNG o WebP. Máximo 5MB.
        </p>
      </div>

      {/* Error de validación client-side */}
      {imageError && (
        <div className="flex items-center justify-center text-sm text-red-800">
          <span>{imageError}</span>
          <button
            type="button"
            onClick={() => setImageError(null)}
            className="text-red-500 hover:text-red-700 text-2xl ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Errores de validación del servidor */}
      {serverErrors?.map((err, index) => (
        <div key={index} className="text-sm text-red-800">
          {err}
        </div>
      ))}

      {/* Modal de cámara */}
      <CameraModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onConfirm={handleCameraConfirm}
      />
    </div>
  );
}
