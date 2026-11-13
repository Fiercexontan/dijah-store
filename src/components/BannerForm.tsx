"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { shrinkImage } from "@/lib/shrink-image";
import { createBanner } from "@/app/admin/(panel)/banners/actions";

const field =
  "mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base outline-none focus:border-white/60";

export default function BannerForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    setIsError(false);

    const fd = new FormData(e.currentTarget);
    const file = fd.get("photo");
    const get = (k: string) => String(fd.get(k) ?? "");

    const supabase = createClient();
    let path = "";

    try {
      if (!(file instanceof File) || file.size === 0 || !file.type.startsWith("image/")) {
        throw new Error("Choose a photo for the banner.");
      }

      const blob = await shrinkImage(file);
      path = `banners/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (uploadError) throw new Error("The photo could not be uploaded.");

      const result = await createBanner({
        path,
        title: get("title"),
        subtitle: get("subtitle"),
        link: get("link"),
        startDate: get("start"),
        endDate: get("end"),
      });

      if (!result.ok) {
        // Don't leave an unused photo behind
        await supabase.storage.from("product-images").remove([path]);
        throw new Error(result.message);
      }

      formRef.current?.reset();
      setMessage("Banner added.");
      router.refresh();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
    setBusy(false);
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="mt-4 max-w-md space-y-4 rounded-2xl border border-white/15 bg-white/10 p-4"
    >
      <h2 className="text-lg font-bold">Add a banner</h2>

      <label className="block text-sm">
        Photo (wide photos work best)
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className={field}
        />
      </label>

      <label className="block text-sm">
        Headline
        <input name="title" required maxLength={80} placeholder="e.g. Christmas Sale" className={field} />
      </label>

      <label className="block text-sm">
        Line under the headline (optional)
        <input name="subtitle" maxLength={160} placeholder="e.g. Up to 20% off selected pieces" className={field} />
      </label>

      <label className="block text-sm">
        Where should it lead? (optional)
        <select name="link" defaultValue="/shop" className={field}>
          <option value="" className="text-black">Nowhere</option>
          <option value="/shop" className="text-black">The shop</option>
          <option value="/shop?preorder=1" className="text-black">Pre-order items</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          Starts (optional)
          <input name="start" type="date" className={field} />
        </label>
        <label className="block text-sm">
          Ends (optional)
          <input name="end" type="date" className={field} />
        </label>
      </div>

      {message && (
        <p
          role={isError ? "alert" : "status"}
          className={
            "rounded-xl px-4 py-3 text-sm " +
            (isError ? "bg-red-500/20" : "bg-emerald-500/25")
          }
        >
          {message}
        </p>
      )}

      <button
        disabled={busy}
        className="w-full rounded-xl bg-white py-3 font-semibold text-purple-950 disabled:opacity-60"
      >
        {busy ? "Saving…" : "Add banner"}
      </button>
    </form>
  );
}