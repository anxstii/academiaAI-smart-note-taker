
import React from 'react';
import { 
  UserPreferences, 
  LearningStyle, 
  NoteDepth, 
  Tone, 
  Structure, 
  HighlightPriority 
} from '../types';

interface PreferencesPanelProps {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}

export const PreferencesPanel: React.FC<PreferencesPanelProps> = ({ preferences, setPreferences }) => {
  const updatePref = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const togglePriority = (priority: HighlightPriority) => {
    const current = preferences.highlightPriority;
    const next = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority];
    updatePref('highlightPriority', next);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Learning Preferences</h2>
        <p className="text-slate-500">Customize how the AI captures and structures your notes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Learning Style */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Learning Style</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: LearningStyle.VISUAL, label: 'Visual', icon: '🎨' },
              { id: LearningStyle.TEXT, label: 'Text', icon: '📝' },
              { id: LearningStyle.HYBRID, label: 'Hybrid', icon: '🧠' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => updatePref('learningStyle', item.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  preferences.learningStyle === item.id 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                }`}
              >
                <span className="text-2xl mb-2">{item.icon}</span>
                <span className="text-xs font-bold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note Depth */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Note Depth</label>
          <div className="grid grid-cols-3 gap-3">
            {[NoteDepth.BRIEF, NoteDepth.STANDARD, NoteDepth.DETAILED].map(depth => (
              <button
                key={depth}
                onClick={() => updatePref('noteDepth', depth)}
                className={`py-3 rounded-xl border-2 font-bold text-xs capitalize transition-all ${
                  preferences.noteDepth === depth 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                }`}
              >
                {depth}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Academic Tone</label>
          <select 
            value={preferences.tone}
            onChange={e => updatePref('tone', e.target.value as Tone)}
            className="w-full p-3 rounded-xl border-2 border-slate-100 bg-white text-slate-700 font-medium focus:border-indigo-600 outline-none"
          >
            <option value={Tone.ACADEMIC}>Formal Academic</option>
            <option value={Tone.CONVERSATIONAL}>Conversational (ELI5)</option>
            <option value={Tone.SIMPLIFIED}>Strictly Simplified</option>
          </select>
        </div>

        {/* Structure */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Note Structure</label>
          <select 
            value={preferences.structure}
            onChange={e => updatePref('structure', e.target.value as Structure)}
            className="w-full p-3 rounded-xl border-2 border-slate-100 bg-white text-slate-700 font-medium focus:border-indigo-600 outline-none"
          >
            <option value={Structure.OUTLINE}>Hierarchical Outline</option>
            <option value={Structure.MIND_MAP}>Mind Map Style</option>
            <option value={Structure.NARRATIVE}>Narrative Summary</option>
          </select>
        </div>
      </div>

      {/* Priorities */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Highlight Priorities</label>
        <div className="flex flex-wrap gap-3">
          {(['definitions', 'examples', 'formulas', 'exam-relevant-points'] as HighlightPriority[]).map(priority => (
            <button
              key={priority}
              onClick={() => togglePriority(priority)}
              className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                preferences.highlightPriority.includes(priority)
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              {priority.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-2xl">🤖</div>
          <div>
            <h3 className="text-lg font-bold">Smart Optimization Active</h3>
            <p className="text-indigo-200 text-sm">Preferences will be used to guide LLM synthesis.</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          The AI Academic Note-Taking System will prioritize <span className="text-white font-bold">{preferences.highlightPriority.join(', ')}</span> using a <span className="text-white font-bold">{preferences.tone}</span> tone. 
          Notes will be structured as a <span className="text-white font-bold">{preferences.structure}</span> with <span className="text-white font-bold">{preferences.noteDepth}</span> detail levels.
        </p>
      </div>
    </div>
  );
};
