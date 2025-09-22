import React from "react";
import { FaCheckCircle } from "react-icons/fa";

interface Step5Props {
  formData: {
    eventVideoFile?: File;
    galleryFiles?: File[];
  };
  handleGalleryChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleVideoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Step5: React.FC<Step5Props> = ({
  formData,
  handleGalleryChange,
  handleVideoChange,
}) => (
  <div className="space-y-4 rounded-lg p-6">
    <div>
      <label className="block text-white mb-2">Event Video</label>
      <p className="text-gray-400 text-sm mb-2">
        Select a promotional video for your event (Max 100MB, MP4/WebM/OGG)
      </p>
      <input
        type="file"
        name="eventVideo"
        accept="video/mp4,video/webm,video/ogg"
        onChange={handleVideoChange}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:cursor-pointer hover:file:bg-teal-600 transition-all duration-300"
      />
      {formData.eventVideoFile && (
        <div className="mt-2 text-green-400 text-sm flex items-center">
          <FaCheckCircle className="mr-1" />
          Video selected: {formData.eventVideoFile.name}
        </div>
      )}
    </div>

    <div>
      <label className="block text-white mb-2">Event Gallery</label>
      <p className="text-gray-400 text-sm mb-2">
        Select images for your event gallery (Max 5MB each, JPG/PNG/WebP)
      </p>
      <input
        type="file"
        name="gallery"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleGalleryChange}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:cursor-pointer hover:file:bg-teal-600 transition-all duration-300"
      />
      {formData.galleryFiles && formData.galleryFiles.length > 0 && (
        <div className="mt-2">
          {formData.galleryFiles.map((file, index) => (
            <div key={index} className="text-green-400 text-sm">
              <FaCheckCircle className="mr-1" /> {file.name}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default Step5;
