import axios from "axios";
import type {
  Agent,
  AgentWithPrompt,
  RunAgentRequest,
  RunAgentResponse,
} from "@/types";

// Load base URL from environment variable, fallback to localhost
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Unable to connect to the API server. Please ensure the backend is running on http://127.0.0.1:8000"
      );
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    throw new Error(message);
  }
);

export const agentApi = {
  // Get all agents
  getAgents: async (): Promise<Agent[]> => {
    const response = await api.get<Agent[]>("/agents");
    return response.data;
  },

  // Get specific agent
  getAgent: async (agentId: number): Promise<AgentWithPrompt> => {
    const response = await api.get<AgentWithPrompt>(`/agents/${agentId}`);
    return response.data;
  },

  // Run agent with prompt
  runAgent: async (
    agentId: number,
    request: RunAgentRequest
  ): Promise<RunAgentResponse> => {
    const formData = new FormData();
    formData.append('prompt', request.prompt);
    formData.append('user_email', request.user_email);

    // Append files if present
    if (request.files) {
      request.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.post<RunAgentResponse>(
      `/run-agent/${agentId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
