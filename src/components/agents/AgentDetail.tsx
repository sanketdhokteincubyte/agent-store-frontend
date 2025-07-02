import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  AlertCircle,
  Zap,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { useAgent } from "@/hooks/useAgents";
import { useRunAgent } from "@/hooks/useRunAgent";
import { useAgentStore } from "@/store/useAgentStore";
import { AgentResponseContainer } from "./AgentResponseContainer";
import { AgentExecutionForm } from "./AgentExecutionForm";
import { toast } from "sonner";

export const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const agentId = parseInt(id ?? "0", 10);

  const { data, isLoading, error } = useAgent(agentId);
  const agent = data?.agent;
  const agentPrompt = data?.prompt;
  const runAgentMutation = useRunAgent(agentId);
  const { isRunning } = useAgentStore();
  const [currentResult, setCurrentResult] = useState<string | null>(null);

  const getAgentCapabilities = (name: string) => {
    // Generate relevant capabilities based on agent name/type
    const capabilities = [
      "Automated data processing",
      "Real-time analysis",
      "Intelligent decision making",
      "Workflow optimization",
      "24/7 operation",
      "Error reduction",
      "Performance monitoring",
      "Custom integrations",
    ];

    // Return 3 capabilities based on agent name hash
    const hash = name.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return [
      capabilities[hash % capabilities.length],
      capabilities[(hash + 1) % capabilities.length],
      capabilities[(hash + 2) % capabilities.length],
    ];
  };

  const handleAgentExecution = async (data: {
    prompt: string;
    email: string;
    files?: File[];
  }) => {
    try {
      const result = await runAgentMutation.mutateAsync({
        prompt: data.prompt,
        user_email: data.email,
        files: data.files,
      });
      // Store result in local state instead of global store
      setCurrentResult(result.response || "Response generated successfully");
    } catch (error) {
      console.error("Error running agent:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to run agent"
      );
      throw error; // Re-throw to let form handle it
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error?.message ?? "Agent not found"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const formattedDate = formatDistanceToNow(new Date(agent.created_at), {
    addSuffix: true,
  });

  const capabilities = getAgentCapabilities(agent.name);

  return (
    <>
      {/* Hero Section - compact */}
      <section className="py-8 lg:py-10 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              {/* AI Agent Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-4">
                <Zap className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium text-white">AI Agent</span>
              </div>

              {/* Agent Name */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {agent.name}
              </h1>

              {/* Agent Description */}
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                {agent.description ||
                  "An intelligent AI agent designed to automate tasks and boost productivity."}
              </p>

              {/* Key Capabilities */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white mb-3">
                  Key Capabilities
                </h3>
                <div className="space-y-1">
                  {capabilities.map((capability, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-300"
                    >
                      <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" />
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Meta */}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Created {formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Execution Section */}
      <main className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Back button */}
            <div className="mb-8">
              <Link to="/agents">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Agents
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <AgentExecutionForm
                agentPrompt={agentPrompt}
                isRunning={isRunning}
                onSubmit={handleAgentExecution}
              />

              {/* Results Panel */}
              <AgentResponseContainer
                agentName={agent.name}
                isRunning={isRunning}
                response={currentResult}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
