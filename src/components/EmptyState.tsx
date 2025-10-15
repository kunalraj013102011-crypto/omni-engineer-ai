import { Sparkles } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4 animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-20 animate-pulse-glow" />
        <Sparkles className="w-16 h-16 text-primary relative z-10" />
      </div>
      <h2 className="text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
        Welcome to Omni Engineer AI
      </h2>
      <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">
        Your powerful AI assistant with multi-modal capabilities. Ask questions, share images, 
        provide URLs, or use voice input. I learn from our conversation to provide better answers.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="text-2xl mb-2">💬</div>
          <div className="font-medium mb-1">Text Chat</div>
          <div className="text-sm text-muted-foreground">Type naturally and get intelligent responses</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="text-2xl mb-2">🎤</div>
          <div className="font-medium mb-1">Voice Input</div>
          <div className="text-sm text-muted-foreground">Speak your questions using voice recognition</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="font-medium mb-1">Images & URLs</div>
          <div className="text-sm text-muted-foreground">Share images and web links for analysis</div>
        </div>
      </div>
    </div>
  );
};
