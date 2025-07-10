export interface Agent {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentWithPrompt {
  agent: Agent;
  prompt: string;
}

export interface RunAgentRequest {
  prompt: string;
  user_email: string;
  files?: File[];
}

export interface FileUploadInfo {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
}

export const SUPPORTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/json': ['.json'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'video/mp4': ['.mp4'],
} as const;

export type SupportedFileType = keyof typeof SUPPORTED_FILE_TYPES;

export interface RunAgentResponse {
  response: string;
}

export interface ApiError {
  message: string;
  status?: number;
}