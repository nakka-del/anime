export const FALLBACK_ANIME_IMAGE =
  "https://placehold.co/600x900/0f172a/e2e8f0?text=AnimeVerse";

export const FALLBACK_CHARACTER_IMAGE =
  "https://placehold.co/320x480/111827/e5e7eb?text=Character";

export const handleImageError = (event, fallbackSrc = FALLBACK_ANIME_IMAGE) => {
  const image = event.currentTarget;

  if (image.dataset.fallbackApplied === "true") {
    return;
  }

  image.dataset.fallbackApplied = "true";
  image.src = fallbackSrc;
};
