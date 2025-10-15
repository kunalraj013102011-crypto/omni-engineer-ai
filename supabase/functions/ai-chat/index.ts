import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model, generateImage, imagePrompt } = await req.json();
    
    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages input:", messages);
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Use Claude Sonnet 4.5 for best reasoning, Nano Banana for image generation
    let selectedModel = model || "anthropic/claude-sonnet-4.5";
    let requestBody: any = {
      model: selectedModel,
      messages: [
        {
          role: "system",
          content: "You are Omni Engineer AI, the world's most advanced engineering assistant with unparalleled reasoning capabilities. You excel at software architecture, algorithm design, system optimization, and creative problem-solving. You write clean, efficient, production-ready code following best practices. You can design complex systems, debug intricate issues, and provide innovative solutions across all engineering domains. You think deeply, reason step-by-step, and deliver exceptional results."
        },
        ...messages
      ],
      max_tokens: 4000,
      temperature: 0.7,
    };

    // Handle image generation with Nano Banana
    if (generateImage && imagePrompt) {
      selectedModel = "google/gemini-2.5-flash-image-preview";
      requestBody = {
        model: selectedModel,
        messages: [
          {
            role: "user",
            content: imagePrompt
          }
        ],
        modalities: ["image", "text"]
      };
    }
    
    console.log("Calling OpenRouter with model:", selectedModel, generateImage ? "(image generation mode)" : "");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://omni-engineer-ai.app",
        "X-Title": "Omni Engineer AI"
      },
      body: JSON.stringify(requestBody),
    });

    console.log("OpenRouter response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `OpenRouter API error: ${response.status}`,
          details: errorText 
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const data = await response.json();
    console.log("OpenRouter response data:", JSON.stringify(data).substring(0, 500));

    // Validate response structure
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error("Invalid response structure:", data);
      return new Response(
        JSON.stringify({ error: "Invalid response from AI model" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const aiResponse = data.choices[0].message?.content;
    const generatedImages = data.choices[0].message?.images;
    
    if (!aiResponse && !generatedImages) {
      console.error("No content in response:", data);
      return new Response(
        JSON.stringify({ error: "No content in AI response" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Return response with optional images
    const responseData: any = { response: aiResponse };
    if (generatedImages && generatedImages.length > 0) {
      responseData.images = generatedImages.map((img: any) => img.image_url?.url).filter(Boolean);
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
