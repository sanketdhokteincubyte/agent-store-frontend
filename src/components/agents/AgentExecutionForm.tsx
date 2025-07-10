import { useState } from "react";
import { Send, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";

interface AgentExecutionFormProps {
  agentPrompt?: string;
  isRunning: boolean;
  onSubmit: (data: { prompt: string; email: string; files?: File[] }) => Promise<void>;
  onClear?: () => void;
}

export const AgentExecutionForm = ({
  agentPrompt,
  isRunning,
  onSubmit,
  onClear,
}: AgentExecutionFormProps) => {
  const [userPrompt, setUserPrompt] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (email.trim()) {
      // Validate email format
      console.log("Validating email:", email);
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    try {
      await onSubmit({
        prompt: userPrompt.trim(),
        email: email.trim(),
        files: files.length > 0 ? files : undefined,
      });

      // Clear form on success
      setUserPrompt("");
      setEmail("");
      setFiles([]);
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Form submission error:", error);
    }
  };

  const handleClear = () => {
    setUserPrompt("");
    setEmail("");
    setFiles([]);
    onClear?.();
  };

  return (
    <Card className="border-gray-200 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Execute Agent
        </CardTitle>
        <CardDescription>
          Enter your prompt and email to interact with this agent
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Your Prompt</Label>
            <Textarea
              id="prompt"
              placeholder={agentPrompt ?? "Type your prompt here..."}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="min-h-32 resize-none"
              required
              disabled={isRunning}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{userPrompt.length} characters</span>
              <span>Be specific for better results</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isRunning}
                required
              />
            </div>
          </div>

          {/* Selected Files Display */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-600 font-medium">
                Selected Files ({files.length})
              </div>
              <div className="space-y-1">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 truncate max-w-[150px]">{file.name}</span>
                      <span className="text-gray-500">({Math.round(file.size / 1024)}KB)</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newFiles = files.filter((_, i) => i !== index);
                        setFiles(newFiles);
                      }}
                      disabled={isRunning}
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <FileUpload
              onFilesChange={setFiles}
              disabled={isRunning}
              maxFiles={5}
              maxFileSize={25 * 1024 * 1024} // 25MB
              compact={true}
              value={files}
            />

            <Button
              type="submit"
              disabled={isRunning || !userPrompt.trim() || !email.trim()}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Generate Response
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isRunning}
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
