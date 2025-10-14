import { Bot, User, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  onSpeak?: (text: string) => void;
}

export const ChatMessage = ({ role, content, onSpeak }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-lg p-4 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-foreground border border-border"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        
        {!isUser && onSpeak && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSpeak(content)}
            className="mt-2 text-xs text-muted-foreground hover:text-accent"
          >
            <Volume2 className="w-3 h-3 mr-1" />
            Speak
          </Button>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};
