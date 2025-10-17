import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ExpertSelector, ExpertField } from "./ExpertSelector";

export function ProjectAnalysis() {
  const [projectDetails, setProjectDetails] = useState("");
  const [circuitDiagram, setCircuitDiagram] = useState("");
  const [selectedExpert, setSelectedExpert] = useState<ExpertField>();
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeProject = async () => {
    if (!projectDetails.trim() || !selectedExpert) {
      toast.error("Please provide project details and select an expert");
      return;
    }

    setLoading(true);
    try {
      const prompt = `As a ${selectedExpert.replace('_', ' ')} expert, analyze this project:

Project Details:
${projectDetails}

${circuitDiagram ? `Circuit Diagram/Technical Details:\n${circuitDiagram}\n` : ''}

Please provide:
1. Overall assessment and feasibility
2. Potential problems and challenges
3. Recommended improvements
4. Best practices to follow
5. Simulation considerations (if applicable)`;

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{ role: "user", content: prompt }],
          model: "google/gemini-2.5-flash"
        }
      });

      if (error) throw error;

      setAnalysis(data.response || "Analysis completed");
      toast.success("Project analyzed successfully!");
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Project Analysis & Simulation</CardTitle>
          <CardDescription>
            Get expert feedback on your project and simulate its behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExpertSelector value={selectedExpert} onChange={setSelectedExpert} />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Details</label>
            <Textarea
              placeholder="Describe your project, its objectives, and implementation..."
              value={projectDetails}
              onChange={(e) => setProjectDetails(e.target.value)}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Circuit Diagram / Technical Details (Optional)</label>
            <Textarea
              placeholder="Paste circuit diagrams, technical specifications, or code snippets..."
              value={circuitDiagram}
              onChange={(e) => setCircuitDiagram(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={analyzeProject} 
            disabled={loading || !selectedExpert}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Project'
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {analysis}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
