import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Search, X } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  isOpen,
  onClose,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Chat History</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4">
        <Button onClick={onNewConversation} className="w-full bg-gradient-primary">
          New Conversation
        </Button>
      </div>

      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {filteredConversations.map((conv) => (
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
        </div>
      </ScrollArea>
    </div>
  );
};
