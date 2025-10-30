import { useState } from "react";
import { Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";

type ImageGalleryProps = {
  images: string[];
  title?: string;
};

const ImageGallery = ({ images = [], title = "" }: ImageGalleryProps) => {
  const [index, setIndex] = useState(0);
  const total = images.length;

  const hasImages = total > 0;
  const current = hasImages ? images[index] : "";

  const go = (dir: number) => {
    if (!total) return;
    setIndex((prev) => (prev + dir + total) % total);
  };

  if (!hasImages) {
    return (
      <div className="w-full aspect-[16/9] bg-muted flex items-center justify-center">
        <ImageIcon className="h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative">
        <img
          src={current}
          alt={`${title} - ${index + 1}`}
          className="w-full aspect-[16/9] object-cover"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/60 text-white rounded-full h-9 w-9 flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/60 text-white rounded-full h-9 w-9 flex items-center justify-center"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {index + 1}/{total}
            </div>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pl-4 pt-1 pb-4">
            {images.map((src, i) => {
              const active = i === index;
              return (
                <button
                  type="button"
                  key={src + i}
                  className={`relative shrink-0 border rounded-md overflow-hidden hover:opacity-90 transition ${
                    active ? "ring-2 ring-primary" : "border-border"
                  }`}
                  onClick={() => setIndex(i)}
                >
                  <img
                    src={src}
                    alt={`${title} - thumbnail ${i + 1}`}
                    className="h-16 w-24 object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;


