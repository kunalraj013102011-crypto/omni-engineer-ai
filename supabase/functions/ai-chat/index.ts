import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Free web search using DuckDuckGo
async function performWebSearch(query: string): Promise<string> {
  try {
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    let results = '';
    
    // Get abstract
    if (data.Abstract) {
      results += `Summary: ${data.Abstract}\n\n`;
    }
    
    // Get related topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      results += 'Related Information:\n';
      data.RelatedTopics.slice(0, 5).forEach((topic: any, index: number) => {
        if (topic.Text) {
          results += `${index + 1}. ${topic.Text}\n`;
          if (topic.FirstURL) {
            results += `   Source: ${topic.FirstURL}\n`;
          }
        }
      });
    }
    
    return results || 'No specific results found. Please try a different search query.';
  } catch (error) {
    console.error('Web search error:', error);
    return 'Web search unavailable at the moment.';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model, generateImage, imagePrompt, webSearch, searchQuery } = await req.json();
    
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

    // Handle web search if requested
    if (webSearch && searchQuery) {
      console.log("Performing web search for:", searchQuery);
      const searchResults = await performWebSearch(searchQuery);
      
      // Add search results to the conversation context
      messages.push({
        role: "system",
        content: `Web Search Results for "${searchQuery}":\n\n${searchResults}`
      });
    }

    // Use Claude Sonnet 4.5 for best reasoning, Nano Banana for image generation
    let selectedModel = model || "anthropic/claude-sonnet-4.5";
    let requestBody: any = {
      model: selectedModel,
      messages: [
        {
          role: "system",
          content: "You are K.R.I.S (Knowledge Reinforcement and Intelligence System), the world's most advanced engineering assistant with unparalleled reasoning capabilities. You excel at software architecture, algorithm design, system optimization, and creative problem-solving. You write clean, efficient, production-ready code following best practices. You can design complex systems, debug intricate issues, and provide innovative solutions across all engineering domains. You have access to web search results when provided. You think deeply, reason step-by-step, and deliver exceptional results."
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
        "HTTP-Referer": "https://kris-ai.app",
        "X-Title": "K.R.I.S AI"
      },
      body: JSON.stringify(requestBody),
    });

    console.log("OpenRouter response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      
      let userMessage = "AI service error. Please try again.";
      
      // Parse common errors for user-friendly messages
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.metadata?.raw) {
          const rawError = JSON.parse(errorData.error.metadata.raw);
          if (rawError.error?.message?.includes("prompt is too long")) {
            userMessage = "Conversation is too long. Please start a new conversation.";
          }
        }
      } catch (e) {
        // Use default message if parsing fails
      }
      
      return new Response(
        JSON.stringify({ 
          error: userMessage,
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
