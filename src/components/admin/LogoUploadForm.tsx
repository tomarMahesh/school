"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
  cropToCanvas,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { removeSiteLogo, uploadSiteLogo } from "@/lib/actions/settings";
import { SchoolLogo } from "@/components/site/SchoolLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LogoUploadForm({ currentLogo }: { currentLogo: string | null }) {
  const [pending, startTransition] = useTransition();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [preparing, setPreparing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalError(null);
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const next = centerCrop(
      makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),
      width,
      height,
    );
    setCrop(next);
    setCompletedCrop(convertToPixelCrop(next, width, height));
  }

  async function handleUpload() {
    setLocalError(null);
    if (!imgRef.current || !canvasRef.current || !completedCrop || completedCrop.width === 0) {
      setLocalError("Select the area of the image to use as the logo.");
      return;
    }
    setPreparing(true);
    await cropToCanvas(imgRef.current, canvasRef.current, completedCrop);
    canvasRef.current.toBlob((blob) => {
      setPreparing(false);
      if (!blob) {
        setLocalError("Could not process the cropped image. Try again.");
        return;
      }
      const formData = new FormData();
      formData.set("file", new File([blob], "logo.png", { type: "image/png" }));
      startTransition(async () => {
        const result = await uploadSiteLogo({}, formData);
        if (result.error) {
          setLocalError(result.error);
          return;
        }
        toast.success("Logo updated.");
        setImageSrc(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
    }, "image/png");
  }

  function handleRemove() {
    setRemoving(true);
    startTransition(async () => {
      await removeSiteLogo();
      setRemoving(false);
      toast.success("Logo removed. The default logo is shown again.");
    });
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>School Logo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <SchoolLogo src={currentLogo} className="h-16 w-16" />
          <div className="text-sm text-muted-foreground">
            {currentLogo ? "Current logo" : "Using the default logo"}
          </div>
          {currentLogo && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto"
              disabled={removing}
              onClick={handleRemove}
            >
              {removing ? "Removing..." : "Remove logo"}
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="logo-file">Upload a new logo</Label>
          <Input
            id="logo-file"
            type="file"
            accept="image/png,image/jpeg"
            ref={fileInputRef}
            onChange={onSelectFile}
          />
          <p className="text-xs text-muted-foreground">
            PNG or JPEG. You&apos;ll crop it to a square next. A PNG with a transparent background looks best.
          </p>
        </div>

        {imageSrc && (
          <div className="max-h-[360px] overflow-auto rounded-md border bg-muted/30 p-2">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Logo to crop"
                onLoad={onImageLoad}
                className="max-w-full"
              />
            </ReactCrop>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {localError && <p className="text-sm text-destructive">{localError}</p>}

        <Button
          type="button"
          onClick={handleUpload}
          disabled={!imageSrc || pending || preparing}
          className="w-fit"
        >
          {pending || preparing ? "Uploading..." : "Save Logo"}
        </Button>
      </CardContent>
    </Card>
  );
}
