import { FALLBACK_ANIME_IMAGE, handleImageError } from "../utils/media";

const SafeImage = ({ src, alt, fallbackSrc = FALLBACK_ANIME_IMAGE, ...props }) => (
  <img
    src={src || fallbackSrc}
    alt={alt}
    onError={(event) => handleImageError(event, fallbackSrc)}
    loading="lazy"
    {...props}
  />
);

export default SafeImage;
