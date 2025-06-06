import React from "react";

interface ReviewsGalleryProps {
  media: string[];
}

const isVideo = (url: string) => {
  return /\.(mp4|webm|ogg)$/i.test(url);
};

const ReviewsGallery: React.FC<ReviewsGalleryProps> = ({ media }) => {
  if (!media || media.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {media.map((url, idx) =>
        isVideo(url) ? (
          <video
            key={idx}
            src={url}
            controls
            className="w-32 h-32 object-cover rounded"
          />
        ) : (
          <img
            key={idx}
            src={url}
            alt={`review-media-${idx}`}
            className="w-32 h-32 object-cover rounded"
          />
        )
      )}
    </div>
  );
};

export default ReviewsGallery;
