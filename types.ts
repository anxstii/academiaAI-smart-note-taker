
export enum LearningStyle {
  VISUAL = 'visual',
  TEXT = 'text',
  HYBRID = 'hybrid'
}

export enum NoteDepth {
  BRIEF = 'brief',
  STANDARD = 'standard',
  DETAILED = 'detailed'
}

export enum Tone {
  ACADEMIC = 'academic',
  CONVERSATIONAL = 'conversational',
  SIMPLIFIED = 'simplified'
}

export enum Structure {
  OUTLINE = 'outline',
  MIND_MAP = 'mind-map',
  NARRATIVE = 'narrative'
}

export type HighlightPriority = 'definitions' | 'examples' | 'formulas' | 'exam-relevant-points';

export interface UserResource {
  id: string;
  type: 'pdf' | 'ppt' | 'video';
  title: string;
  content: string;
}

export interface UserPreferences {
  learningStyle: LearningStyle;
  noteDepth: NoteDepth;
  tone: Tone;
  structure: Structure;
  highlightPriority: HighlightPriority[];
}

export interface Reference {
  source_type: 'pdf' | 'ppt' | 'video' | 'lecture';
  source_title: string;
  context: string;
}

export interface Section {
  title: string;
  content: string;
  references: Reference[];
  visual_aids?: {
    diagrams?: string[];
    tables?: any[][];
    charts?: string[];
  };
}

export interface LectureNotes {
  metadata: {
    lecture_title: string;
    date: string;
    topics_covered: string[];
  };
  notes: {
    sections: Section[];
  };
  summary: {
    key_takeaways: string[];
    exam_focus_points: string[];
  };
}
