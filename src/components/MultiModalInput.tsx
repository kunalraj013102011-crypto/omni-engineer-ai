import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Link as LinkIcon, Mic, Send, MicOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MultiModalInputProps {
  onSendMessage: (text: string, imageUrl?: string, url?: string) => void;
  onVoiceInput: (isRecording: boolean) => void;
  isRecording: boolean;
  disabled?: boolean;
}

export const MultiModalInput = ({
  onSendMessage,
  onVoiceInput,
  isRecording,
  disabled,
}: MultiModalInputProps) => {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [url, setUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSend = () => {
    if (!text.trim() && !imageUrl && !url) return;
    
    onSendMessage(text, imageUrl, url);
    setText("");
    setImageUrl("");
    setUrl("");
    setShowImageInput(false);
    setShowUrlInput(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setShowImageInput(false);
        toast({
          title: "Image loaded",
          description: "Your image is ready to send",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-card border-t border-border p-4">
      {showImageInput && (
        <div className="mb-3 p-3 bg-muted/50 rounded-lg">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            Choose Image
          </Button>
        </div>
      )}

      {showUrlInput && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Enter URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-foreground"
          />
        </div>
      )}

      {imageUrl && (
        <div className="mb-3 relative">
          <img src={imageUrl} alt="Upload" className="max-h-32 rounded-lg" />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setImageUrl("")}
            className="absolute top-2 right-2"
          >
            Remove
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowImageInput(!showImageInput)}
            disabled={disabled}
            className="hover:bg-primary/20"
          >
            <Image className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={disabled}
            className="hover:bg-primary/20"
          >
            <LinkIcon className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onVoiceInput(!isRecording)}
            disabled={disabled}
            className={`hover:bg-primary/20 ${isRecording ? "bg-destructive/20 animate-pulse-glow" : ""}`}
          >
            {isRecording ? <MicOff className="w-5 h-5 text-destructive" /> : <Mic className="w-5 h-5" />}
          </Button>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={disabled}
          className="flex-1 min-h-[60px] max-h-[200px] resize-none"
        />

        <Button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !imageUrl && !url)}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
