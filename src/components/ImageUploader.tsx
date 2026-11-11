"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addImage } from "@/app/admin/(panel)/products/[id]/actions";

const MAX_SIDE = 1600;

// Shrinks a photo so customers' phones load it fast
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encode failed"))),
      "image/jpeg",
      0.85
    )
  );
}

export default function ImageUploader({
  productId,
  colorId,
}: {
  productId: string;
  colorId: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setBusy(true);
    setMessage("");
    const supabase = createClient();
    let failed = 0;

    for (const file of files) {
      try {
        if (!file.type.startsWith("image/")) throw new Error("Not an image");

        const blob = await shrink(file);
        const path = `${productId}/${colorId}/${crypto.randomUUID()}.jpg`;

        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (error) throw error;

        const result = await addImage(productId, colorId, path);
        if (!result.ok) {
          // Don't leave an orphan file behind
          await supabase.storage.from("product-images").remove([path]);
          throw new Error("Could not record the photo");
        }
      } catch {
        failed += 1;
      }
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    setMessage(failed ? `${failed} photo(s) could not be uploaded.` : "Uploaded.");
    router.refresh();
  }

  return (
    <div className="mt-3">
      <label className="inline-block cursor-pointer rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold">
        {busy ? "Uploading…" : "Add photos"}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy}
          onChange={onChange}
          className="hidden"
        />
      </label>
      {message && <p className="mt-2 text-xs text-purple-200">{message}</p>}
    </div>
  );
}