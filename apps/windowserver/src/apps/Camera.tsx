import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, RefreshCw, Save } from 'lucide-react';
import { KernelAPI } from '@macos/darwin-api';

export const Camera: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const kernel = KernelAPI.getInstance();

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const handleRetake = () => {
    setImgSrc(null);
  };

  const handleSave = async () => {
    if (imgSrc) {
      try {
        const fileName = `/Users/guest/Pictures/Photo-${Date.now()}.png`;
        // In a real scenario, we'd convert base64 to binary for VFS
        // For now, we'll just save the base64 string
        await kernel.writeFile(fileName, imgSrc);
        alert(`Saved to ${fileName}`);
        setImgSrc(null);
      } catch (e) {
        console.error('Failed to save photo:', e);
        alert('Failed to save photo');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {imgSrc ? (
          <img src={imgSrc} alt="Captured" className="max-h-full max-w-full" />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="h-full w-full object-cover"
            videoConstraints={{ facingMode: 'user' }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8">
        {!imgSrc ? (
          <button
            onClick={capture}
            className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 shadow-lg hover:scale-105 transition-transform active:scale-95"
          />
        ) : (
          <>
            <button
              onClick={handleRetake}
              className="px-6 py-3 bg-gray-600/80 backdrop-blur-md rounded-full text-white font-medium flex items-center gap-2 hover:bg-gray-500/90 transition-colors"
            >
              <RefreshCw size={20} /> Retake
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-500 rounded-full text-white font-medium flex items-center gap-2 shadow-lg hover:bg-blue-600 transition-colors"
            >
              <Save size={20} /> Save
            </button>
          </>
        )}
      </div>
    </div>
  );
};
