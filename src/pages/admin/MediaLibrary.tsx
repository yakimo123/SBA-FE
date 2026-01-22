import { Folder, Grid, Image as ImageIcon, List as ListIcon, Search, Trash2,Upload } from 'lucide-react';
import { useState } from 'react';

export function MediaLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Media Library</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage your images and files</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600">
          <Upload className="h-5 w-5" /> Upload Files
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
           {/* Search */}
           <div className="relative">
             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
             <input
               type="text"
               placeholder="Search files..."
               className="w-64 rounded-lg border border-gray-300 py-1.5 pl-9 pr-4 text-sm outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
             />
           </div>
           {/* Filters */}
           <select className="rounded-lg border border-gray-300 py-1.5 px-3 text-sm outline-none focus:border-purple-600">
             <option>All Types</option>
             <option>Images</option>
             <option>Videos</option>
             <option>Documents</option>
           </select>
           <select className="rounded-lg border border-gray-300 py-1.5 px-3 text-sm outline-none focus:border-purple-600">
             <option>Newest First</option>
             <option>Oldest First</option>
             <option>Name A-Z</option>
           </select>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 p-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={`rounded p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button 
             onClick={() => setViewMode('list')}
             className={`rounded p-1.5 transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {/* Folders */}
        {['Products', 'Banners', 'Marketing', 'Users'].map((folder) => (
          <div key={folder} className="group relative cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-center transition-all hover:border-purple-300 hover:shadow-md">
            <Folder className="mx-auto h-12 w-12 text-yellow-400 mb-2" />
            <p className="truncate text-sm font-medium text-gray-700">{folder}</p>
            <p className="text-xs text-gray-500">12 items</p>
          </div>
        ))}

        {/* Files */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((file) => (
          <div key={file} className="group relative cursor-pointer rounded-lg border border-gray-200 bg-white p-2 transition-all hover:border-purple-300 hover:shadow-md">
            <div className="aspect-square w-full rounded-md bg-gray-100 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <ImageIcon className="h-8 w-8" />
              </div>
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="rounded-full bg-white p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-2 px-1">
              <p className="truncate text-sm font-medium text-gray-700">image-file-{file}.jpg</p>
              <p className="text-xs text-gray-500">2.5 MB</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
