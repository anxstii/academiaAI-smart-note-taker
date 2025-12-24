
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { UserResource, UserPreferences, LectureNotes } from '../types';

interface LiveLectureProps {
  resources: UserResource[];
  preferences: UserPreferences;
  onNotesGenerated: (notes: LectureNotes, transcript: string) => void;
}

export const LiveLecture: React.FC<LiveLectureProps> = ({ resources, preferences, onNotesGenerated }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  const startSession = async () => {
    try {
      setStatus('listening');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: ['AUDIO' as any],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are an AI Academic Note-Taking System. 
            Transcribe the lecture audio accurately.
            Currently, just focus on capturing the transcript text.`
        },
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
            sessionRef.current = { sessionPromise, scriptProcessor, stream };
          },
          onmessage: (message: any) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              if (text) setTranscript(prev => [...prev, text]);
            }
          },
          onerror: (e) => console.error("Session Error:", e),
          onclose: () => console.log("Session Closed")
        }
      });
      
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setStatus('idle');
    }
  };

  const stopSession = async () => {
    if (sessionRef.current) {
      sessionRef.current.scriptProcessor.disconnect();
      sessionRef.current.stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      setIsRecording(false);
      setStatus('processing');
      
      await generateFinalNotes();
    }
  };

  const generateFinalNotes = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Limit transcript to ~1.5M characters (~400k tokens)
      const MAX_TRANSCRIPT_CHARS = 1500000;
      let fullTranscriptText = transcript.join(' ');
      if (fullTranscriptText.length > MAX_TRANSCRIPT_CHARS) {
        fullTranscriptText = fullTranscriptText.slice(-MAX_TRANSCRIPT_CHARS) + "\n[...Transcript Truncated due to Length...]";
      }
      
      // Limit resources to ~1.5M characters total
      const MAX_RESOURCE_TOTAL_CHARS = 1500000;
      const resourceContext = resources.map(r => {
        const content = r.content.length > 300000 ? r.content.slice(0, 300000) + "... [Truncated]" : r.content;
        return `Title: ${r.title}\nContent: ${content}`;
      }).join('\n---\n').slice(0, MAX_RESOURCE_TOTAL_CHARS);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          Role: AI Academic Note-Taking System
          Objective: Transform the lecture transcript into structured notes.
          
          Lecture Transcript:
          ${fullTranscriptText}
          
          User Resources:
          ${resourceContext}
          
          User Preferences:
          Style: ${preferences.learningStyle}
          Depth: ${preferences.noteDepth}
          Tone: ${preferences.tone}
          Structure: ${preferences.structure}
          Priorities: ${preferences.highlightPriority.join(', ')}
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              metadata: {
                type: Type.OBJECT,
                properties: {
                  lecture_title: { type: Type.STRING },
                  date: { type: Type.STRING },
                  topics_covered: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              notes: {
                type: Type.OBJECT,
                properties: {
                  sections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        references: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              source_type: { type: Type.STRING },
                              source_title: { type: Type.STRING },
                              context: { type: Type.STRING }
                            }
                          }
                        },
                        visual_aids: {
                          type: Type.OBJECT,
                          properties: {
                            diagrams: { type: Type.ARRAY, items: { type: Type.STRING } },
                            tables: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                          }
                        }
                      }
                    }
                  }
                }
              },
              summary: {
                type: Type.OBJECT,
                properties: {
                  key_takeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
                  exam_focus_points: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      });
      
      if (response.text) {
        const notes = JSON.parse(response.text);
        onNotesGenerated(notes, fullTranscriptText);
        setStatus('idle');
      }
    } catch (err: any) {
      console.error("Failed to generate notes:", err);
      const errorMessage = err?.message || "Internal Error";
      alert(`Note generation failed: ${errorMessage.slice(0, 100)}... Try reducing the number of uploaded resources.`);
      setStatus('idle');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Recording Session</h2>
          <p className="text-sm text-slate-500">Capture your lecture and let AI do the heavy lifting.</p>
        </div>
        <div className="flex space-x-2">
          {!isRecording ? (
            <button 
              onClick={startSession}
              disabled={status === 'processing'}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Start Capture</span>
            </button>
          ) : (
            <button 
              onClick={stopSession}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm animate-pulse"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1 white 4 0 014 4a1 1 0 01-1 1H10a1 1 0 01-1-1v-4z" />
              </svg>
              <span>Stop & Process</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 p-6 bg-slate-50 overflow-y-auto relative">
        {status === 'processing' && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-600 font-medium">Synthesizing Notes...</p>
            <p className="text-sm text-slate-500 max-w-xs text-center mt-2">Correlating lecture audio with your uploaded resources.</p>
          </div>
        )}

        {transcript.length === 0 && !isRecording ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <p className="text-sm">Click "Start Capture" to begin recording the lecture.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transcript.map((line, i) => (
              <div key={i} className="animate-fade-in text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-sm">
                <span className="text-slate-400 font-mono text-[10px] block mb-1">Captured Transcript</span>
                {line}
              </div>
            ))}
            {isRecording && (
              <div className="flex items-center space-x-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                <span className="text-xs font-medium text-indigo-700 italic">Listening to audio...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
