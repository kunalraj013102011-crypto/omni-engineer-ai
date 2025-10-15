import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Sparkles } from "lucide-react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { MultiModalInput } from "@/components/MultiModalInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { EmptyState } from "@/components/EmptyState";
import { UserMenu } from "@/components/UserMenu";
import { Auth } from "@/components/Auth";
import { VoiceRecognition, VoiceSynthesis } from "@/utils/voiceUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const voiceRecognition = useRef(new VoiceRecognition());
  const voiceSynthesis = useRef(new VoiceSynthesis());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auth state management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
      if (session) {
        loadConversations();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadConversations();
    }
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      setConversations(data);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    
    if (data) {
      setMessages(data as Message[]);
    }
  };

  const createConversation = async (firstMessage: string) => {
    const { data } = await supabase
      .from("conversations")
      .insert({
        title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : ""),
        user_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();
    
    if (data) {
      setCurrentConversationId(data.id);
      setConversations([data, ...conversations]);
      return data.id;
    }
    return null;
  };

  const saveMessage = async (conversationId: string, role: "user" | "assistant", content: string) => {
    const { data } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();
    
    if (data) {
      setMessages((prev) => [...prev, data as Message]);
    }
  };

  const handleSendMessage = async (text: string, imageUrl?: string, url?: string) => {
    if (!text.trim()) return;

    let convId = currentConversationId;
    
    if (!convId) {
      convId = await createConversation(text);
      if (!convId) return;
    }

    await saveMessage(convId, "user", text);
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: text }
          ]
        }
      });

      if (error) throw error;

      const aiResponse = data.response;
      await saveMessage(convId, "assistant", aiResponse);
      
    } catch (error) {
      console.error("Error calling AI:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (shouldRecord: boolean) => {
    if (!voiceRecognition.current.isSupported()) {
      toast({
        title: "Not supported",
        description: "Voice recognition is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    if (shouldRecord) {
      setIsRecording(true);
      voiceRecognition.current.start(
        (transcript) => {
          setIsRecording(false);
          handleSendMessage(transcript);
          toast({
            title: "Voice recognized",
            description: transcript,
          });
        },
        (error) => {
          setIsRecording(false);
          toast({
            title: "Voice recognition error",
            description: error,
            variant: "destructive",
          });
        }
      );
    } else {
      setIsRecording(false);
      voiceRecognition.current.stop();
    }
  };

  const handleSpeak = (text: string) => {
    if (!voiceSynthesis.current.isSupported()) {
      toast({
        title: "Not supported",
        description: "Speech synthesis is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    voiceSynthesis.current.speak(text);
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = async (id: string) => {
    setCurrentConversationId(id);
    await loadMessages(id);
    setIsSidebarOpen(false);
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-primary mx-auto animate-pulse-glow" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <header className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Omni Engineer AI
            </h1>
          </div>
        </div>
        <UserMenu userEmail={session.user.email} />
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  onSpeak={msg.role === "assistant" ? handleSpeak : undefined}
                />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>

      <MultiModalInput
        onSendMessage={handleSendMessage}
        onVoiceInput={handleVoiceInput}
        isRecording={isRecording}
        disabled={isLoading}
      />
    </div>
  );
};

export default Index;
