import { Sparkles } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 mb-4 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 animate-pulse-glow">
        <Sparkles className="w-5 h-5 text-primary-foreground" />
      </div>
      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <div className="flex gap-1">
          <div 
            className="w-2 h-2 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: "0ms" }} 
          />
          <div 
            className="w-2 h-2 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: "150ms" }} 
          />
          <div 
            className="w-2 h-2 bg-primary rounded-full animate-bounce" 
            style={{ animationDelay: "300ms" }} 
          />
        </div>
      </div>
    </div>
  );
};
