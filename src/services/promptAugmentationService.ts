import { AzureOpenAI } from 'openai';
import { ApiError } from '../lib/apiError';

// Environment configuration
const O4_MINI_ENDPOINT = import.meta.env.VITE_O4_MINI_ENDPOINT;
const API_KEY = import.meta.env.VITE_AZURE_API_KEY;
const DEPLOYMENT = import.meta.env.VITE_O4_MINI_DEPLOYMENT;
const API_VERSION = import.meta.env.VITE_O4_MINI_API_VERSION;

if (!O4_MINI_ENDPOINT || !API_KEY || !DEPLOYMENT || !API_VERSION) {
  throw new Error(
    'Missing required environment variables for prompt augmentation. Please check your .env file.'
  );
}

// Initialize Azure OpenAI client
// WARNING: dangerouslyAllowBrowser is enabled for client-side usage
// This is NOT production-ready - API keys should be protected by a backend proxy
const client = new AzureOpenAI({
  apiVersion: API_VERSION,
  endpoint: O4_MINI_ENDPOINT,
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true, // Allow browser usage (client-side only app)
});

// System prompt optimized for video generation enhancement
const SYSTEM_PROMPT = `You are an expert video prompt engineer specializing in AI video generation. Your task is to enhance user prompts to create more vivid, cinematic, and detailed video descriptions that will produce better results with Sora (Azure OpenAI's video generation model).

Guidelines for enhancement:
1. Add specific visual details (lighting, colors, textures, movements)
2. Include camera movements and angles (dolly, pan, zoom, tracking shot, etc.)
3. Specify mood and atmosphere
4. Add temporal transitions (how the scene evolves)
5. Include artistic style references when appropriate (cinematic, documentary, artistic, etc.)
6. Keep the core concept from the original prompt
7. Stay within 2000 characters maximum
8. Be specific about motion and dynamics
9. Use vivid, descriptive language
10. Consider composition and framing

Transform short, simple prompts into rich, detailed video descriptions that maintain the original intent while adding professional cinematography elements.

Return ONLY the enhanced prompt, without any explanation or additional text.`;

/**
 * Augments a user prompt using Azure OpenAI's o4-mini model
 * with high reasoning capabilities to enhance video generation quality.
 *
 * @param prompt - The original user prompt
 * @returns Enhanced prompt optimized for video generation
 * @throws ApiError if the API call fails
 */
export async function augmentPrompt(prompt: string): Promise<string> {
  if (!prompt.trim()) {
    throw new ApiError('Prompt cannot be empty', 400);
  }

  try {
    const response = await client.chat.completions.create({
      model: DEPLOYMENT,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Enhance this video prompt: "${prompt}"`,
        },
      ],
      // Note: o4-mini only supports default temperature (1) and doesn't support frequency/presence penalties
    });

    const augmentedPrompt = response.choices[0]?.message?.content?.trim();

    if (!augmentedPrompt) {
      throw new ApiError('Empty response from prompt augmentation service', 500);
    }

    // Enforce 2000 character limit for Sora API
    if (augmentedPrompt.length > 2000) {
      return augmentedPrompt.substring(0, 1997) + '...';
    }

    return augmentedPrompt;
  } catch (error) {
    // Handle OpenAI SDK errors
    if (error instanceof Error) {
      // Check for rate limiting
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new ApiError(
          'Prompt augmentation rate limit exceeded. Please try again in a moment.',
          429
        );
      }

      // Check for authentication errors
      if (error.message.includes('401') || error.message.includes('authentication')) {
        throw new ApiError(
          'Authentication failed for prompt augmentation. Please check your API key.',
          401
        );
      }

      // Generic error
      throw new ApiError(
        `Prompt augmentation failed: ${error.message}`,
        500,
        error.message
      );
    }

    // Unknown error type
    throw new ApiError('Unknown error during prompt augmentation', 500);
  }
}
