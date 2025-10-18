import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Search, X, GraduationCap, FileText, Users, FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  conversation_type?: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: 'chat' | 'lessons' | 'analysis') => void;
  currentSection: string;
}

export const ChatSidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  isOpen,
  onClose,
  onNavigate,
  currentSection,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const expertConversations = filteredConversations.filter(c => c.conversation_type === 'expert');
  const projectAnalyses = filteredConversations.filter(c => c.conversation_type === 'project_analysis');
  const regularChats = filteredConversations.filter(c => !c.conversation_type || c.conversation_type === 'chat');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">K.R.I.S</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4 space-y-2">
        <Button 
          onClick={() => onNavigate('chat')}
          variant={currentSection === 'chat' ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Expert Chat
        </Button>
        <Button 
          onClick={() => onNavigate('lessons')}
          variant={currentSection === 'lessons' ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          Daily Lessons
        </Button>
        <Button 
          onClick={() => onNavigate('analysis')}
          variant={currentSection === 'analysis' ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          <FileText className="mr-2 h-4 w-4" />
          Project Analysis
        </Button>
        <Button 
          onClick={() => navigate('/lab')}
          variant="ghost"
          className="w-full justify-start"
        >
          <FlaskConical className="mr-2 h-4 w-4" />
          Laboratory Hub
        </Button>
      </div>

      {currentSection === 'chat' && (
        <>
          <div className="px-4 pb-4">
            <Button onClick={onNewConversation} className="w-full bg-gradient-primary">
              New Conversation
            </Button>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 pb-4">
              {expertConversations.length > 0 && (
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium mb-2 w-full">
                    <Users className="h-4 w-4" />
                    Expert Consultations
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2">
                    {expertConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => onSelectConversation(conv.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          currentConversationId === conv.id
                            ? "bg-primary/20 border border-primary"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <div className="font-medium text-sm text-foreground truncate">
                          {conv.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(conv.created_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {projectAnalyses.length > 0 && (
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium mb-2 w-full">
                    <FileText className="h-4 w-4" />
                    Project Analyses
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2">
                    {projectAnalyses.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => onSelectConversation(conv.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          currentConversationId === conv.id
                            ? "bg-primary/20 border border-primary"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <div className="font-medium text-sm text-foreground truncate">
                          {conv.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(conv.created_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {regularChats.length > 0 && (
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium mb-2 w-full">
                    <MessageCircle className="h-4 w-4" />
                    Chat History
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2">
                    {regularChats.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => onSelectConversation(conv.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          currentConversationId === conv.id
                            ? "bg-primary/20 border border-primary"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <div className="font-medium text-sm text-foreground truncate">
                          {conv.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(conv.created_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};
