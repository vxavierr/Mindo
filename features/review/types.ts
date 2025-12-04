export type ReviewMode = 'daily' | 'custom_tags' | 'custom_cluster' | 'path';

export type ReviewGrade = 'fail' | 'hard' | 'good' | 'easy';
export type QuestionType = 'concept' | 'fact' | 'connection' | 'analogy' | 'procedural';

export interface ReviewQuestion {
  id: string;
  question: string;
  relatedNodeIds: string[];
  questionType: QuestionType;
  relevantSegment: string; 
}

export interface ReviewSession {
  id: string;
  mode: ReviewMode;
  tags?: string[];
  nodeIds: string[];
  questions: ReviewQuestion[];
  currentIndex: number;
  startedAt: string;
  
  // Path Review Specifics
  pathNodes?: string[];
  activeMemoryUnitId?: string | null;
}
