
import React, { useState, useRef } from 'react';
import { UserResource } from '../types';

interface ResourceLibraryProps {
  resources: UserResource[];
  onAdd: (resource: UserResource) => void;
  onRemove: (id: string) => void;
}

export const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ resources, onAdd, onRemove }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', content: '', type: 'pdf' as any });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.title || !newResource.content) return;
    
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      title: newResource.title,
      content: newResource.content,
      type: newResource.type
    });
    
    setNewResource({ title: '', content: '', type: 'pdf' });
    setIsAdding(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      // Heuristic for type based on extension
      let type: 'pdf' | 'ppt' | 'video' = 'pdf';
      if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) type = 'ppt';
      if (file.name.endsWith('.mp4') || file.name.endsWith('.avi')) type = 'video';

      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        title: file.name,
        content: content || "No text content could be extracted from this file.",
        type
      });
      setIsUploading(false);
    };

    reader.onerror = () => {
      alert("Failed to read file.");
      setIsUploading(false);
    };

    // For simplicity in this demo, we read as text. In a production app,
    // you'd use specialized libraries for PDF/PPT parsing.
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Resource Library</h2>
          <p className="text-slate-500">Upload textbooks, presentation slides, or paste notes for AI cross-referencing.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".txt,.md,.pdf,.ppt,.pptx"
          />
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Manual</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-lg animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newResource.title}
                  onChange={e => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. Chapter 4: Thermodynamics"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resource Type</label>
                <select 
                  value={newResource.type}
                  onChange={e => setNewResource(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="pdf">PDF (Text Content)</option>
                  <option value="ppt">Presentation Slides</option>
                  <option value="video">Video Summary / Transcript</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Text Content</label>
              <textarea 
                rows={4}
                value={newResource.content}
                onChange={e => setNewResource(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder="Paste the text from your file here..."
                required
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {resources.length === 0 ? (
        <div 
          className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-20 h-20 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-medium text-slate-600">Drag and drop academic files</p>
          <p className="text-sm">Click to browse your computer for PDF, PPT, or TXT files.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(res => (
            <div key={res.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  res.type === 'pdf' ? 'bg-red-50 text-red-600' : 
                  res.type === 'ppt' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <ResourceIcon type={res.type} />
                </div>
                <button 
                  onClick={() => onRemove(res.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <h4 className="font-bold text-slate-800 mb-1 truncate">{res.title}</h4>
              <p className="text-xs text-slate-500 mb-4 uppercase font-semibold tracking-wider">{res.type} Resource</p>
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                {res.content}
              </p>
              <div className="pt-4 border-t border-slate-50 flex items-center text-[10px] text-slate-400 font-mono">
                Extracted: {res.content.length} characters
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ResourceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'pdf': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    case 'ppt': return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
    default: return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
  }
};
