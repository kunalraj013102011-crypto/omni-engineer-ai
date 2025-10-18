import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CircuitBoard, Box, Brain, Eye, Atom, LogOut } from "lucide-react";

const Laboratory = () => {
  const navigate = useNavigate();

  const labButtons = [
    { id: "circuit", label: "Circuit Simulation", icon: CircuitBoard, position: "top-center", available: false },
    { id: "3d", label: "3D/Cubify", icon: Box, position: "top-right", available: true, route: "/3d-lab" },
    { id: "ai-scientists", label: "AI Scientists", icon: Brain, position: "middle-right", available: true, route: "/" },
    { id: "visual", label: "Visual Circuit", icon: Eye, position: "bottom-right", available: false },
    { id: "engineering", label: "Engineering AI", icon: Atom, position: "bottom-left", available: true, route: "/" },
  ];

  const getButtonPosition = (position: string) => {
    const positions: Record<string, string> = {
      "top-center": "top-[15%] left-1/2 -translate-x-1/2",
      "top-right": "top-[25%] right-[15%]",
      "middle-right": "top-1/2 right-[10%] -translate-y-1/2",
      "bottom-right": "bottom-[25%] right-[15%]",
      "bottom-left": "bottom-[25%] left-[15%]",
    };
    return positions[position] || "";
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Exit button */}
      <Button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-10 bg-red-500/20 text-red-400 border border-red-400 hover:bg-red-500/30"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Exit Laboratory
      </Button>

      {/* Title */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
        <h1 className="text-3xl font-bold text-primary tracking-wider">
          K.R.I.S Laboratory Hub
        </h1>
      </div>

      {/* Central hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative">
          {/* Glowing ring */}
          <div className="w-48 h-48 rounded-full border-4 border-primary animate-pulse-glow" />
          
          {/* Inner circle with face/circuit design */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/10 border border-primary/50 flex items-center justify-center">
              <Brain className="w-16 h-16 text-primary" />
            </div>
          </div>

          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full -z-10" style={{ transform: 'scale(2.5)' }}>
            <circle cx="96" cy="96" r="80" fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Lab buttons */}
      {labButtons.map((btn) => (
        <div
          key={btn.id}
          className={`absolute ${getButtonPosition(btn.position)} z-10`}
        >
          <Button
            onClick={() => btn.route && navigate(btn.route)}
            disabled={!btn.available}
            className="relative group w-48 h-24 bg-black/50 border-2 border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center gap-2">
              <btn.icon className="w-8 h-8 text-primary" />
              <span className="text-sm font-semibold text-primary">{btn.label}</span>
              {!btn.available && (
                <span className="text-xs text-muted-foreground">(upcoming)</span>
              )}
            </div>
            
            {/* Neon glow effect */}
            <div className="absolute inset-0 border-2 border-primary/50 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
          </Button>
        </div>
      ))}

      {/* Bottom info */}
      <div className="absolute bottom-6 left-6 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
        <span className="text-sm text-primary font-semibold">System Active</span>
      </div>

      <div className="absolute bottom-6 right-6">
        <span className="text-sm text-muted-foreground">Created by Kunal Raj</span>
      </div>
    </div>
  );
};

export default Laboratory;
