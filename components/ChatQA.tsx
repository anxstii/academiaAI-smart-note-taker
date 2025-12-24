
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { LectureNotes, UserResource } from '../types';

interface ChatQAProps {
  isOpen: boolean;
  onClose: () => void;
  notes: LectureNotes | null;
  transcript: string;
  resources: UserResource[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
}

export const ChatQA: React.FC<ChatQAProps> = ({ isOpen, onClose, notes, transcript, resources }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !notes) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Limit transcript to ~1M characters
      const transcriptContext = transcript.length > 1000000 
        ? transcript.slice(-1000000) + "... [Transcript Truncated]" 
        : transcript;

      // Limit individual resources to 200k chars each and total resources to 1M
      const resourceText = resources.map(r => {
        const content = r.content.length > 200000 ? r.content.slice(0, 200000) + "... [Truncated]" : r.content;
        return `[Resource: ${r.title}] ${content}`;
      }).join("\n\n").slice(0, 1000000);
      
      const context = `
        You are an Academic Assistant for a student. 
        You have access to the following context:
        
        LECTURE NOTES:
        ${JSON.stringify(notes).slice(0, 500000)}
        
        LECTURE TRANSCRIPT:
        ${transcriptContext}
        
        USER UPLOADED RESOURCES:
        ${resourceText}
        
        Student Question: ${userMessage}
        
        INSTRUCTIONS:
        1. Answer the question accurately based ONLY on the provided context.
        2. Be concise but educational.
        3. ALWAYS cite your source using format like "[Lecture]", "[Notes: Section Title]", or "[Resource: Title]".
        4. If the answer is not in the context, say so politely.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: context,
      });

      const assistantContent = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (err: any) {
      console.error("QA Error:", err);
      const assistantContent = `Sorry, I encountered an error: ${err?.message?.slice(0, 50) || "Unknown error"}. This might be due to too much context.`;
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="font-bold">Academic Assistant</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-indigo-500 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="text-center py-10 px-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-2xl">🧐</span>
            </div>
            <p className="text-slate-600 font-medium">Ask anything about the lecture!</p>
            <p className="text-xs text-slate-400 mt-2">Example: "What was the main definition of Thermodynamics mentioned?"</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-100' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'
              }`}>
                {m.content.split(/(\[.*?\])/).map((part, pi) => {
                  if (part.startsWith('[') && part.endsWith(']')) {
                    return <span key={pi} className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold mx-0.5 border border-indigo-100">{part}</span>;
                  }
                  return part;
                })}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 flex space-x-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading || !notes}
            placeholder={notes ? "Type your question..." : "Generate notes first!"}
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-400 transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading || !notes}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg disabled:bg-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          AI-generated answers. Verify with primary sources.
        </p>
      </form>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
