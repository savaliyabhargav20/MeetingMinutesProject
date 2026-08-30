export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface DiscussionTopic {
  topic: string;
  summary: string;
}

export interface MeetingMinutes {
  title: string;
  date: string;
  attendees?: string;
  executiveSummary: string;
  keyDecisions: string[];
  discussionTopics: DiscussionTopic[];
  actionItems: ActionItem[];
  nextSteps: string[];
  transcript?: string;
}

export type ProcessingState = 'idle' | 'transcribing' | 'summarizing' | 'complete' | 'error';

export interface SampleMeeting {
  id: string;
  title: string;
  duration: string;
  description: string;
  transcript: string;
}

export interface ConnectedUser {
  id: string;
  name: string;
  color: string;
}

export interface RealtimeSyncNotice {
  message: string;
  senderName: string;
  timestamp: number;
}

