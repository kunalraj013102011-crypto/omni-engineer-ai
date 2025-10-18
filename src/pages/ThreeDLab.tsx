import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Image, Sparkles, Edit2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  role: string;
  content: string;
  images?: any[];
}

interface ChatHistory {
  id: string;
  name: string;
  messages: ChatMessage[];
}

const ThreeDLab = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [activeTab, setActiveTab] = useState<"prompt" | "image">("prompt");

  const generatePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [
            { role: "system", content: "You are K.R.I.S, an AI assistant specialized in generating detailed 3D engineering prompts. Create comprehensive, technical prompts for 3D modeling based on user input." },
            { role: "user", content: `Generate a detailed 3D engineering prompt for: ${prompt}` }
          ]
        }
      });

      if (error) throw error;
      setGeneratedPrompt(data.response);
      
      const newMessages = [
        { role: "user", content: prompt },
        { role: "assistant", content: data.response }
      ];
      setMessages(newMessages);
      
      if (!currentChat) {
        const newChat: ChatHistory = {
          id: Date.now().toString(),
          name: `3D Session ${chatHistories.length + 1}`,
          messages: newMessages
        };
        setChatHistories([...chatHistories, newChat]);
        setCurrentChat(newChat.id);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate prompt");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          generateImage: true,
          imagePrompt: prompt
        }
      });

      if (error) throw error;
      
      const newMessages = [
        { role: "user", content: prompt },
        { role: "assistant", content: "Image generated successfully", images: data.images }
      ];
      setMessages(newMessages);
      
      if (!currentChat) {
        const newChat: ChatHistory = {
          id: Date.now().toString(),
          name: `Image Session ${chatHistories.length + 1}`,
          messages: newMessages
        };
        setChatHistories([...chatHistories, newChat]);
        setCurrentChat(newChat.id);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = (id: string) => {
    setChatHistories(chatHistories.map(chat => 
      chat.id === id ? { ...chat, name: editName } : chat
    ));
    setEditingId(null);
  };

  const selectChat = (id: string) => {
    const chat = chatHistories.find(c => c.id === id);
    if (chat) {
      setCurrentChat(id);
      setMessages(chat.messages);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Button
            onClick={() => navigate("/lab")}
            variant="ghost"
            className="w-full justify-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lab
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Chat History</h3>
          <div className="space-y-2">
            {chatHistories.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChat === chat.id ? "bg-primary/20" : "bg-muted/50 hover:bg-muted"
                }`}
                onClick={() => selectChat(chat.id)}
              >
                {editingId === chat.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveEdit(chat.id);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{chat.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(chat.id, chat.name);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-4">
          <h1 className="text-2xl font-bold text-primary">K.R.I.S 3D Laboratory</h1>
        </div>

        <div className="flex-1 flex">
          {/* Left Side - AI Tools */}
          <div className="w-1/2 border-r border-border flex flex-col">
            <div className="border-b border-border p-2 flex gap-2">
              <Button
                variant={activeTab === "prompt" ? "default" : "ghost"}
                onClick={() => setActiveTab("prompt")}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                3D Prompt Generator
              </Button>
              <Button
                variant={activeTab === "image" ? "default" : "ghost"}
                onClick={() => setActiveTab("image")}
                className="flex-1"
              >
                <Image className="w-4 h-4 mr-2" />
                Image Generator
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 p-4 rounded-lg ${
                    msg.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"
                  }`}
                >
                  <div className="text-sm font-semibold mb-2">
                    {msg.role === "user" ? "You" : "K.R.I.S"}
                  </div>
                  <div className="text-sm">{msg.content}</div>
                  {msg.images && msg.images.map((img: any, i: number) => (
                    <img key={i} src={img.image_url.url} alt="Generated" className="mt-2 rounded-lg max-w-full" />
                  ))}
                </div>
              ))}
            </ScrollArea>

            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={activeTab === "prompt" ? "Describe your 3D engineering project..." : "Describe the image you want to generate..."}
                  className="min-h-20"
                />
                <Button
                  onClick={activeTab === "prompt" ? generatePrompt : generateImage}
                  disabled={isGenerating}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - 3D Viewer */}
          <div className="w-1/2 flex flex-col">
            <div className="border-b border-border p-4">
              <h2 className="text-lg font-semibold">3D Interactive Viewer</h2>
            </div>
            <iframe
              src="https://roblox-cube3d-interactive.hf.space/"
              className="flex-1 w-full"
              title="3D Viewer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDLab;
