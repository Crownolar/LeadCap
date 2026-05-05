const ImagePreviewModal = ({ src, onClose }) => {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[6000]"
      onClick={onClose}
    >
      <img
        src={src}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
      />
    </div>
  );
};

export default ImagePreviewModal