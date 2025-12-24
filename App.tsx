
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LiveLecture } from './components/LiveLecture';
import { NotesViewer } from './components/NotesViewer';
import { ResourceLibrary } from './components/ResourceLibrary';
import { PreferencesPanel } from './components/PreferencesPanel';
import { ChatQA } from './components/ChatQA';
import { 
  LearningStyle, 
  NoteDepth, 
  Tone, 
  Structure, 
  UserPreferences, 
  UserResource,
  LectureNotes 
} from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'library' | 'preferences'>('live');
  const [resources, setResources] = useState<UserResource[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    learningStyle: LearningStyle.HYBRID,
    noteDepth: NoteDepth.STANDARD,
    tone: Tone.ACADEMIC,
    structure: Structure.OUTLINE,
    highlightPriority: ['definitions', 'exam-relevant-points']
  });
  const [generatedNotes, setGeneratedNotes] = useState<LectureNotes | null>(null);
  const [fullTranscript, setFullTranscript] = useState<string>("");
  const [showQA, setShowQA] = useState(false);

  const handleAddResource = (resource: UserResource) => {
    setResources(prev => [...prev, resource]);
  };

  const handleRemoveResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const handleNotesGenerated = (notes: LectureNotes, transcript: string) => {
    setGeneratedNotes(notes);
    setFullTranscript(transcript);
  };

  return (
    <div className="flex h-screen bg-slate-50 relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {activeTab === 'live' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
                <div className="flex flex-col space-y-4">
                  <LiveLecture 
                    resources={resources} 
                    preferences={preferences}
                    onNotesGenerated={handleNotesGenerated}
                  />
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-slate-600">Contextual Resources</h3>
                      <button 
                        onClick={() => setActiveTab('library')}
                        className="text-[10px] text-indigo-600 font-bold hover:underline"
                      >
                        Manage All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resources.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No resources added to this session.</p>
                      ) : (
                        resources.map(r => (
                          <span key={r.id} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs border border-blue-100">
                            {r.title}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="h-full relative">
                  <NotesViewer notes={generatedNotes} onOpenQA={() => setShowQA(true)} />
                  {generatedNotes && !showQA && (
                    <button 
                      onClick={() => setShowQA(true)}
                      className="absolute bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition-all transform hover:scale-110 active:scale-95 z-20 group"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span className="absolute right-full mr-3 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                        Ask Academic AI
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'library' && (
              <ResourceLibrary 
                resources={resources} 
                onAdd={handleAddResource} 
                onRemove={handleRemoveResource} 
              />
            )}

            {activeTab === 'preferences' && (
              <PreferencesPanel 
                preferences={preferences} 
                setPreferences={setPreferences} 
              />
            )}
          </div>
        </main>
      </div>

      {/* Interactive Q&A Panel */}
      <ChatQA 
        isOpen={showQA} 
        onClose={() => setShowQA(false)} 
        notes={generatedNotes}
        transcript={fullTranscript}
        resources={resources}
      />
    </div>
  );
};

export default App;
