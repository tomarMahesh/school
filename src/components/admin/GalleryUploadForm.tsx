"use client";

import { useActionState, useRef, useState, startTransition } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
  cropToCanvas,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { uploadGalleryImage } from "@/lib/actions/gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const ASPECT_OPTIONS = [
  { label: "Free", value: undefined },
  { label: "Square", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
] as const;

function centeredCropFor(width: number, height: number, aspect?: number) {
  if (!aspect) {
    return { unit: "%" as const, x: 5, y: 5, width: 90, height: 90 };
  }
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height),
    width,
    height,
  );
}

export function GalleryUploadForm() {
  const [state, formAction, pending] = useActionState(uploadGalleryImage, {});
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [preparing, setPreparing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const captionRef = useRef<HTMLInputElement | null>(null);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalError(null);
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  function applyCrop(width: number, height: number, ratio: number | undefined) {
    const next = centeredCropFor(width, height, ratio);
    setCrop(next);
    setCompletedCrop(convertToPixelCrop(next, width, height));
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    applyCrop(width, height, aspect);
  }

  function changeAspect(value: number | undefined) {
    setAspect(value);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      applyCrop(width, height, value);
    }
  }

  async function handleUpload() {
    setLocalError(null);
    if (!imgRef.current || !canvasRef.current || !completedCrop) {
      setLocalError("Draw a crop area on the photo first.");
      return;
    }
    if (completedCrop.width === 0 || completedCrop.height === 0) {
      setLocalError("Draw a crop area on the photo first.");
      return;
    }

    setPreparing(true);
    await cropToCanvas(imgRef.current, canvasRef.current, completedCrop);
    canvasRef.current.toBlob(
      (blob) => {
        setPreparing(false);
        if (!blob) {
          setLocalError("Could not process the cropped image. Try again.");
          return;
        }
        const formData = new FormData();
        formData.set("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
        formData.set("caption", captionRef.current?.value ?? "");
        startTransition(() => {
          formAction(formData);
        });
      },
      "image/jpeg",
      0.9,
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 pt-6">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="photo">Photo</Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={onSelectFile}
          />
        </div>

        {imageSrc && (
          <>
            <div className="flex flex-wrap gap-2">
              {ASPECT_OPTIONS.map((opt) => (
                <Button
                  key={opt.label}
                  type="button"
                  size="sm"
                  variant={aspect === opt.value ? "default" : "outline"}
                  onClick={() => changeAspect(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            <div className="max-h-[480px] overflow-auto rounded-md border bg-muted/30 p-2">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Selected photo to crop"
                  onLoad={onImageLoad}
                  className="max-w-full"
                />
              </ReactCrop>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input id="caption" ref={captionRef} placeholder="Annual Day 2026" />
            </div>
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {(localError || state.error) && (
          <p className="text-sm text-destructive">{localError ?? state.error}</p>
        )}

        <Button
          type="button"
          onClick={handleUpload}
          disabled={!imageSrc || pending || preparing}
          className="self-start"
        >
          {pending || preparing ? "Uploading..." : "Upload Photo"}
        </Button>
      </CardContent>
    </Card>
  );
}
