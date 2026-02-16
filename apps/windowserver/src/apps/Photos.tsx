import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export const Photos: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const photos = [
    { id: 1, url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80', title: 'Car 1' },
    { id: 2, url: 'https://images.unsplash.com/photo-1583121274602-3e2820c698d9?auto=format&fit=crop&w=800&q=80', title: 'Car 2' },
    { id: 3, url: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=800&q=80', title: 'Car 3' },
    { id: 4, url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', title: 'Car 4' },
    { id: 5, url: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=800&q=80', title: 'Car 5' },
    { id: 6, url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80', title: 'Car 6' },
    { id: 7, url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', title: 'Car 7' },
    { id: 8, url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80', title: 'Car 8' },
  ];

  return (
    <div className="h-full bg-white flex flex-col">
      {selectedPhoto ? (
        <div className="flex-1 flex flex-col bg-black relative">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 left-4 text-white z-10 flex items-center gap-1 hover:text-gray-300"
          >
            <ChevronLeft size={24} /> Back
          </button>
          <div className="flex-1 flex items-center justify-center p-8">
            <img
              src={selectedPhoto}
              alt="Selected"
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50">
             <span className="font-semibold text-lg text-gray-800">Library</span>
             <span className="text-sm text-gray-500">{photos.length} Photos</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo.url)}
                  className="aspect-square cursor-pointer overflow-hidden relative group"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
