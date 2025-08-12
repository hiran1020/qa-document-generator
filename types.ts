
export interface TestCase {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  preConditions: string[];
  description: string;
  steps: string[];
  expectedResult: string;
}

export interface UserStory {
    story: string;
    acceptanceCriteria: string[];
}

export interface GeneratedDocuments {
  testPlan: string;
  qaDocument: string;
  featureManual: string;
  testCases: TestCase[];
  userStories: UserStory[];
}

export interface HistoryItem {
    id: string;
    title: string;
    timestamp: number;
    documents: GeneratedDocuments;
}

export type InputContentPart =
  | { type: 'text'; content: string }
  | { type: 'image'; mimeType: string; base64Data: string };
