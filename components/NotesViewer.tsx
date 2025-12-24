
import React from 'react';
import { LectureNotes, Section } from '../types';

interface NotesViewerProps {
  notes: LectureNotes | null;
  onOpenQA: () => void;
}

export const NotesViewer: React.FC<NotesViewerProps> = ({ notes, onOpenQA }) => {
  if (!notes) {
    return (
      <div className="h-full bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-600 mb-2">No Notes Generated</h3>
        <p className="max-w-sm text-sm">Once you finish your live session, the structured notes, summaries, and exam focus points will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold text-slate-900">{notes.metadata.lecture_title}</h2>
            <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-medium">
              {notes.metadata.date}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {notes.metadata.topics_covered.map((topic, i) => (
              <span key={i} className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                #{topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
        {/* Sections */}
        {notes.notes.sections.map((section, idx) => (
          <SectionView key={idx} section={section} />
        ))}

        {/* Summary Footer */}
        <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <h4 className="flex items-center text-emerald-800 font-bold mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Key Takeaways
            </h4>
            <ul className="space-y-3">
              {notes.summary.key_takeaways.map((item, i) => (
                <li key={i} className="text-sm text-emerald-900/80 flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-3 mt-1.5 shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <h4 className="flex items-center text-amber-800 font-bold mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Exam Focus Points
            </h4>
            <ul className="space-y-3">
              {notes.summary.exam_focus_points.map((item, i) => (
                <li key={i} className="text-sm text-amber-900/80 flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-3 mt-1.5 shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionView: React.FC<{ section: Section }> = ({ section }) => {
  return (
    <section className="group">
      <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
        <div className="w-1.5 h-6 bg-indigo-600 rounded-full mr-3"></div>
        {section.title}
      </h3>
      
      <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed mb-6 pl-4.5 whitespace-pre-wrap">
        {section.content}
      </div>

      {section.visual_aids?.tables && section.visual_aids.tables.length > 0 && (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse bg-white rounded-lg shadow-sm border border-slate-200">
            <thead>
              <tr className="bg-slate-50">
                {section.visual_aids.tables[0].map((header, i) => (
                  <th key={i} className="px-4 py-2 font-semibold text-slate-700 border-b border-slate-200">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.visual_aids.tables.slice(1).map((row, ri) => (
                <tr key={ri} className="hover:bg-slate-50/50 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-slate-600 border-b border-slate-100">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.visual_aids?.diagrams && section.visual_aids.diagrams.length > 0 && (
        <div className="mb-6 p-4 bg-slate-900 rounded-xl overflow-x-auto shadow-inner">
          <div className="text-slate-400 text-[10px] mb-2 font-mono uppercase tracking-widest">Process Logic Visualization</div>
          <pre className="text-indigo-400 font-mono text-xs leading-tight">
            {section.visual_aids.diagrams[0]}
          </pre>
        </div>
      )}

      <div className="pl-4.5 flex flex-wrap gap-3">
        {section.references.map((ref, i) => (
          <div key={i} className="group/ref relative flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 text-[11px] border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all cursor-help shadow-sm">
            <SourceIcon type={ref.source_type} />
            <span className="font-medium truncate max-w-[150px]">{ref.source_title}</span>
            <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-800 text-white p-3 rounded-xl text-[10px] opacity-0 group-hover/ref:opacity-100 transition-all z-10 pointer-events-none shadow-xl transform -translate-y-1">
              <div className="font-bold mb-1 uppercase tracking-tighter opacity-50">Cross-Reference Context</div>
              {ref.context}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const SourceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'pdf': return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    case 'ppt': return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
    case 'video': return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
    default: return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
  }
};
