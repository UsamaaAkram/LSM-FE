import React, { useEffect, useState } from "react";

type ImageGlobalProps = {
  src: string | undefined;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string; // Fallback image src
  width?: number | string;
  height?: number | string;
  onClick?: () => void;
};

const DEFAULT_FALLBACK = "/assets/img/no-image.jpg"; // Change as needed

const ImageGlobal: React.FC<ImageGlobalProps> = ({
  src,
  alt = "Image",
  className = "",
  style,
  fallbackSrc = DEFAULT_FALLBACK,
  width,
  height,
  onClick
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined | null>("");

  useEffect(() => {
    setImgSrc(src && src !== "" ? src : fallbackSrc);
  }, [src, fallbackSrc]);

  const handleError = () => setImgSrc(fallbackSrc);

  return (
    <img
      src={imgSrc ? imgSrc : "/assets/img/no-image.jpg"}
      alt={alt}
      className={className}
      style={{ objectFit: "cover", borderRadius: 4, ...style, width, height }}
      onError={handleError}
      crossOrigin="anonymous"
      onClick={onClick}
    />
  );
};

export default ImageGlobal;
