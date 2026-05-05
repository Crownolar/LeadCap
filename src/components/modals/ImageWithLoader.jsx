import { useState } from "react";

const ImageWithLoader = ({ src, alt, className, onClick }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse rounded-xl">
          <span className="text-xs text-gray-500">Loading...</span>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        onClick={onClick}
        className={`rounded-xl h-52 w-full object-cover cursor-zoom-in transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
};

export default ImageWithLoader