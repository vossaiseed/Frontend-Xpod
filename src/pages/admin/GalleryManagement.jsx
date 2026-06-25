import { Plus } from 'lucide-react';
import React, { useState } from 'react';

const GalleryManagement = () => {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('projects')}
            className={`p-2 border border-gray-400 rounded-xl text-md w-20 transition ${activeTab === 'projects'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-black'
              }`}
          >
            Projects
          </button>

          <button
            onClick={() => setActiveTab('concepts')}
            className={`p-2 border border-gray-400 rounded-xl text-md w-20 transition ${activeTab === 'concepts'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-black'
              }`}
          >
            Concepts
          </button>
        </div>

        <button className="flex bg-amber-600 text-white px-4 py-2 rounded-xl">
          <Plus />
          Create Project
        </button>
      </div>
    </div>
  );
};

export default GalleryManagement;