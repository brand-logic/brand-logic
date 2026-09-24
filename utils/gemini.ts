
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

// ── Model Setup ──────────────────────────────────────────────
const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

const genAI = new GoogleGenerativeAI(geminiKey || "");

const geminiVisionModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-05-20",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

const geminiFullModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-05-20",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

// ── Helpers ──────────────────────────────────────────────────

/** Convert a 0-100 UI slider value to a 1-10 prompt scale */
function toScale10(value: number | undefined, fallback = 5): number {
  if (value === undefined || value === null) return fallback;
  return Math.max(1, Math.min(10, Math.round((value / 100) * 9 + 1)));
}

/** Extract base64 data and mime type from a data URL */
function parseDataUrl(dataUrl: string): { base64: string; mimeType: string } | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

// ── Vision Analysis Prompt (Gemini 2.5 Flash) ────────────────

function buildVisionPrompt(extractedColors: string[]): string {
  return `You are analyzing moodboard images for a brand identity project. Extract and return the following:

### 1. THREE DOMINANT VISUAL STYLES
Look across all uploaded images and identify three recurring visual themes or aesthetics. Name each style with an evocative 2-4 word title and write a 2-3 sentence description of what makes it distinct. Be specific to what you see in the images.

### 2. COLOR ANALYSIS
For each of these HEX codes extracted from the images: ${JSON.stringify(extractedColors)}
Analyze how each color appeared in the moodboard and assign:
- A new evocative color name (not generic — e.g., "Dusk Terracotta", "Fog Linen", "Deep Harbor")
- A role from: PRIMARY / SECONDARY / ACCENT / NEUTRAL / BACKGROUND
- Usage rules (2 sentences max) describing when and where to use this color
- A short psychology phrase (e.g., "signals quiet authority and trust")

Return valid JSON with this exact structure:
{
  "visual_styles": [
    { "title": "string", "description": "string" },
    { "title": "string", "description": "string" },
    { "title": "string", "description": "string" }
  ],
  "colors": [
    {
      "hex": "#XXXXXX",
      "name": "string",
      "role": "PRIMARY|SECONDARY|ACCENT|NEUTRAL|BACKGROUND",
      "usage_rules": "string",
      "psychology": "string"
    }
  ]
}`;
}

// ── Content Generation Prompt (Claude Sonnet) ────────────────

function buildContentPrompt(
  brandData: any,
  voiceSliders: { conversational_to_authoritative: number; calm_to_energetic: number; traditional_to_innovative: number; playful_to_serious: number },
  imageAnalysis: any
): string {
  return `You are the Brand Logic content engine. Your job is to generate a complete, founder-ready brand summary for a specific user based on their inputs. Every word you write must be unique to this user's brand—no generic filler, no placeholder copy. Write as if you are a senior brand strategist who has deeply studied this founder's business before the meeting.

BRAND INPUT DATA:
- brand_name: ${brandData.brand_name}
- brand_description: ${brandData.description}
- core_values: ${JSON.stringify(brandData.core_values || [])}
- target_audience: ${brandData.target_audience}
- voice_sliders:
  - conversational_to_authoritative: ${voiceSliders.conversational_to_authoritative} (1 = very conversational, 10 = very authoritative)
  - calm_to_energetic: ${voiceSliders.calm_to_energetic} (1 = very calm, 10 = very energetic)
  - traditional_to_innovative: ${voiceSliders.traditional_to_innovative} (1 = very traditional, 10 = very innovative)
  - playful_to_serious: ${voiceSliders.playful_to_serious} (1 = very playful, 10 = very serious)
- primary_font: ${brandData.typography_pairing?.primaryFont || 'Inter'}
- secondary_font: ${brandData.typography_pairing?.secondaryFont || 'Inter'}

IMAGE ANALYSIS (from moodboard):
${JSON.stringify(imageAnalysis, null, 2)}

Generate ALL of the following sections. Every output must be specific to the brand_name and brand_description. Do not write anything that could apply to any brand.

SECTION 1: TAGLINE — Write 2 tagline options (3-7 words each). Distinct from each other. Do NOT use generic wellness/productivity clichés.

SECTION 2: POSITIONING STATEMENT — One sentence: "[Brand name] [does/helps/creates] [specific offering] for [specific audience] so they can [specific outcome]." Under 30 words.

SECTION 3: MISSION & VISION — Mission: 3-4 sentences, first-person plural ("We..."). Vision: 2-3 sentences, aspirational but specific.

SECTION 4: CORE VALUES — For each value in core_values, write a single sentence (under 8 words) specific to THIS brand. Not dictionary definitions.

SECTION 5: BRAND PERSONA — 3-4 sentence persona archetype description. Include: a name (e.g., "The Structural Sage"), how they speak, what makes them memorable, their relationship to audience. 5 keywords.

SECTION 6: BRAND VOICE TONE EXAMPLES — 3 named tone examples based on voice_sliders. Each needs: short name, 1-sentence description, 2 brand-specific example sentences.

Slider interpretation guide:
- conversational_to_authoritative > 6: structured, declarative language; < 4: first-person, relaxed
- calm_to_energetic > 6: momentum words, active voice; < 4: measured pace, spacious sentences
- traditional_to_innovative > 6: challenge conventions, fresh metaphors; < 4: proven frameworks, familiar language
- playful_to_serious > 6: precision over warmth; < 4: include lightness, humor

SECTION 7: MESSAGING PILLARS + SOCIAL CAPTION — 3 messaging pillars (title + 2-3 sentence description each). 1 social caption (4-6 sentences, no CTA).

SECTION 8: VISUAL GUARDRAILS — Using image analysis output: Visual North Star (1 sentence), 3 Visual Principles, Photography Direction (3 bullets), Graphic Elements Direction (2 bullets).

SECTION 9: TYPOGRAPHY EXAMPLES — Using the primary_font and secondary_font, generate brand-specific example copy for: H1 Hero (4-8 words), H2 Section Header, H3 Card Title, Body Lead (2 sentences), Body Standard (2 sentences), 2 CTA options (2-4 words each), Caption (under 10 words). Do NOT use "The quick brown fox."

OUTPUT RULES:
1. Never write copy that could belong to a different brand
2. No em-dash stacking
3. Match voice slider calibration
4. Never use these phrases: "in a world where," "at the intersection of," "we believe in the power of," "journey," "empower your potential," "unlock your best self"
5. JSON only — return valid JSON, no prose outside JSON
6. For calm/authoritative brands (sliders > 6), use longer sentences. For conversational/energetic (< 4), use shorter punchy sentences.

Return one complete JSON object:
{
  "taglines": { "tagline_1": "string", "tagline_2": "string" },
  "positioning_statement": "string",
  "mission_statement": "string",
  "vision_statement": "string",
  "core_values": [{ "value": "string", "descriptor": "string" }],
  "brand_persona": {
    "persona_name": "string",
    "persona_description": "string",
    "persona_keywords": ["string"]
  },
  "tone_examples": [{
    "tone_name": "string",
    "tone_description": "string",
    "example_1": "string",
    "example_2": "string"
  }],
  "messaging_pillars": [{ "title": "string", "description": "string" }],
  "social_caption": "string",
  "visual_guardrails": {
    "visual_north_star": "string",
    "visual_principles": [{ "title": "string", "description": "string" }],
    "photography": { "lighting": "string", "composition": "string", "subject": "string" },
    "graphics": { "shapes_patterns": "string", "icons": "string" }
  },
  "typography_examples": {
    "h1_hero": "string",
    "h2_section": "string",
    "h3_card": "string",
    "body_lead": "string",
    "body_standard": "string",
    "cta_options": ["string", "string"],
    "caption": "string"
  }
}`;
}

// ── Main Generation Function ─────────────────────────────────

// @ts-ignore
export async function generateBrandIdentityAI(brandData: any) {
  if (!geminiKey) {
    throw new Error("Google Gemini API Key is missing");
  }

  // Map voice slider values from DB (0-100) to prompt (1-10)
  const voiceSliders = {
    conversational_to_authoritative: toScale10(
      brandData.brand_tone?.conversational_authoritative ?? brandData.brand_tone?.conversational
    ),
    calm_to_energetic: toScale10(
      brandData.brand_tone?.calm_energetic ?? brandData.brand_tone?.energetic
    ),
    traditional_to_innovative: toScale10(
      brandData.brand_tone?.traditional_innovative ?? brandData.brand_tone?.innovative
    ),
    playful_to_serious: toScale10(
      brandData.brand_tone?.playful_serious
    ),
  };

  // Extract color hex values
  const extractedColors: string[] = (brandData.brand_colors || []).map((c: any) => c.hex);

  // ── STEP 1: Image Analysis (Gemini 2.5 Flash Vision) ──────
  let imageAnalysis: any = { visual_styles: [], colors: [] };

  const moodboardImages: string[] = brandData.moodboard_images || [];

  if (moodboardImages.length > 0) {
    try {
      console.log(`[Brand Logic] Running Gemini vision analysis on ${moodboardImages.length} moodboard images...`);

      // Build multimodal parts: images + text prompt
      const parts: any[] = [];

      for (const img of moodboardImages) {
        const parsed = parseDataUrl(img);
        if (parsed) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.base64,
            },
          });
        }
      }

      parts.push({ text: buildVisionPrompt(extractedColors) });

      const visionResult = await geminiVisionModel.generateContent(parts);
      const visionResponse = await visionResult.response;
      const visionText = visionResponse.text();
      const cleanedVision = visionText.replace(/```json/g, "").replace(/```/g, "").trim();
      imageAnalysis = JSON.parse(cleanedVision);
      console.log("[Brand Logic] Vision analysis complete.");
    } catch (error) {
      console.error("[Brand Logic] Vision analysis failed, using fallback:", error);
      // Generate fallback color analysis without vision
      imageAnalysis = {
        visual_styles: [
          { title: "Modern Minimalism", description: "Clean lines and generous whitespace define the overall aesthetic. The composition favors simplicity and intentional restraint." },
          { title: "Warm Sophistication", description: "Rich, grounded tones create a sense of maturity and trust. Textures feel organic and inviting." },
          { title: "Bold Elegance", description: "Confident use of contrast and scale creates visual impact. Typography and imagery work together with purpose." }
        ],
        colors: extractedColors.map((hex: string, i: number) => ({
          hex,
          name: `Brand Tone ${i + 1}`,
          role: i === 0 ? "PRIMARY" : i === 1 ? "SECONDARY" : i === 2 ? "ACCENT" : "NEUTRAL",
          usage_rules: "Use for key brand touchpoints and primary communications.",
          psychology: "Conveys professionalism and brand consistency"
        }))
      };
    }
  } else {
    // No moodboard images — build basic color analysis
    imageAnalysis.colors = extractedColors.map((hex: string, i: number) => ({
      hex,
      name: `Brand Tone ${i + 1}`,
      role: i === 0 ? "PRIMARY" : i === 1 ? "SECONDARY" : i === 2 ? "ACCENT" : "NEUTRAL",
      usage_rules: "Use for key brand touchpoints and primary communications.",
      psychology: "Conveys professionalism and brand consistency"
    }));
  }

  // ── STEP 2: Content Generation (Claude Sonnet 4.6 or Gemini fallback) ──
  const contentPrompt = buildContentPrompt(brandData, voiceSliders, imageAnalysis);

  let contentResult: any;

  if (anthropicKey) {
    // Use Claude Sonnet 4.6 for best-in-class brand copy
    try {
      console.log("[Brand Logic] Generating brand content via Claude Sonnet...");
      const anthropic = new Anthropic({ apiKey: anthropicKey });

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: contentPrompt,
          },
        ],
      });

      const textBlock = message.content.find((block: any) => block.type === "text");
      if (textBlock && textBlock.type === "text") {
        const rawText = textBlock.text;
        // Extract JSON from potential markdown code blocks
        const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        contentResult = JSON.parse(cleaned);
      } else {
        throw new Error("No text content in Claude response");
      }

      console.log("[Brand Logic] Claude content generation complete.");
    } catch (error) {
      console.error("[Brand Logic] Claude generation failed, falling back to Gemini:", error);
      contentResult = null; // Will fall through to Gemini fallback
    }
  }

  if (!contentResult) {
    // Gemini fallback for content generation
    try {
      console.log("[Brand Logic] Generating brand content via Gemini...");
      const result = await geminiFullModel.generateContent(contentPrompt);
      const response = await result.response;
      const text = response.text();
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      contentResult = JSON.parse(cleaned);
      console.log("[Brand Logic] Gemini content generation complete.");
    } catch (error) {
      console.error("[Brand Logic] Gemini content generation failed:", error);
      // Fall back to mock
      return getMockBrandIdentity(brandData, imageAnalysis);
    }
  }

  // ── STEP 3: Combine outputs ────────────────────────────────
  return {
    image_analysis: imageAnalysis,
    colors: imageAnalysis.colors || [],
    ...contentResult,
  };
}

// ── Mock Data Generator (v4 Schema) ──────────────────────────

function getMockBrandIdentity(brand: any, imageAnalysis?: any) {
  const colors = imageAnalysis?.colors || (brand.brand_colors || []).map((c: any, i: number) => ({
    hex: c.hex,
    name: `Brand Color ${i + 1}`,
    role: i === 0 ? "PRIMARY" : i === 1 ? "SECONDARY" : "ACCENT",
    usage_rules: "Use for primary brand elements and key touchpoints.",
    psychology: "Conveys brand identity and recognition"
  }));

  const primaryFont = brand.typography_pairing?.primaryFont || "Inter";
  const secondaryFont = brand.typography_pairing?.secondaryFont || "Inter";

  return {
    image_analysis: imageAnalysis || {
      visual_styles: [
        { title: "Modern Minimalism", description: "Clean lines and generous whitespace define the overall aesthetic." },
        { title: "Warm Sophistication", description: "Rich, grounded tones create maturity and trust." },
        { title: "Bold Elegance", description: "Confident use of contrast and scale creates visual impact." }
      ],
      colors
    },
    colors,
    taglines: {
      tagline_1: `${brand.brand_name}: Where Purpose Meets Precision`,
      tagline_2: `Built Different. Built to Last.`
    },
    positioning_statement: `${brand.brand_name} creates strategic brand foundations for ${brand.target_audience || "ambitious founders"} so they can grow with clarity and confidence.`,
    mission_statement: `We exist to make brand strategy accessible and actionable. ${brand.brand_name} translates founder vision into structured, scalable brand systems. Every decision we make serves clarity over complexity.`,
    vision_statement: `A future where every founder has access to the brand strategy tools that were once reserved for Fortune 500 companies. ${brand.brand_name} is building that bridge.`,
    core_values: (brand.core_values || ["Innovation", "Trust"]).map((v: string) => ({
      value: v,
      descriptor: `We live ${v.toLowerCase()} in every detail.`
    })),
    brand_persona: {
      persona_name: "The Strategic Architect",
      persona_description: `Methodical yet creative, The Strategic Architect approaches every brand challenge with both analytical rigor and an intuitive sense for what resonates. They speak with quiet confidence, backing every recommendation with clear reasoning. Their presence signals competence without intimidation.`,
      persona_keywords: ["Strategic", "Clear-eyed", "Purposeful", "Grounded", "Forward-thinking"]
    },
    tone_examples: [
      {
        tone_name: "Calm Authority",
        tone_description: "Use when establishing expertise or introducing core concepts.",
        example_1: `${brand.brand_name} doesn't guess—we build from data, instinct, and years of pattern recognition.`,
        example_2: `Your brand already has a story. We make sure it's told with intention.`
      },
      {
        tone_name: "Direct & Grounded",
        tone_description: "Use for calls to action and decision-point moments.",
        example_1: `Stop tweaking your logo. Start building your brand system.`,
        example_2: `This isn't about aesthetics alone—it's about alignment.`
      },
      {
        tone_name: "Warm Precision",
        tone_description: "Use in onboarding, education, and relationship-building content.",
        example_1: `We've been where you are—staring at a blank brand deck wondering where to start.`,
        example_2: `The process is simple. The thinking behind it isn't. That's why we're here.`
      }
    ],
    messaging_pillars: [
      { title: "Clarity Over Complexity", description: `${brand.brand_name} distills brand strategy into clear, actionable frameworks. No jargon walls, no hundred-page decks.` },
      { title: "Built for Founders", description: `Every feature is designed for people building something new. We respect your time and your vision.` },
      { title: "System-First Thinking", description: `Individual assets fade. Brand systems compound. We build the latter.` }
    ],
    social_caption: `Your brand isn't your logo. It's not your color palette. It's the feeling someone gets the moment they encounter you. Most founders skip this step—they jump straight to visuals without building the strategic foundation underneath. That's like decorating a house before pouring the foundation. ${brand.brand_name} exists because we've seen too many brilliant ideas held back by unclear positioning.`,
    visual_guardrails: {
      visual_north_star: `Clean, confident, and intentionally warm—every visual choice should feel like a conversation between precision and humanity.`,
      visual_principles: [
        { title: "Structured Breathing Room", description: "Generous whitespace signals confidence; never crowd the composition." },
        { title: "Grounded Palette", description: "Colors should feel organic and earned, not artificial or trendy." },
        { title: "Typographic Hierarchy", description: "Let the type system do the heavy lifting—scale and weight create visual rhythm." }
      ],
      photography: {
        lighting: "Soft, natural light with warm undertones; avoid harsh artificial lighting.",
        composition: "Center-weighted or rule-of-thirds; leave intentional negative space.",
        subject: "Real people in focused work moments, textured materials, architectural details."
      },
      graphics: {
        shapes_patterns: "Clean geometric forms—circles, rounded rectangles—with subtle texture overlays.",
        icons: "Outlined, consistent 2px stroke weight, rounded caps."
      }
    },
    typography_examples: {
      h1_hero: `${brand.brand_name}: Strategy Made Tangible`,
      h2_section: "How We Build Brands",
      h3_card: "Strategic Foundation",
      body_lead: `${brand.brand_name} transforms raw founder vision into polished brand systems. We handle the strategy so you can focus on building.`,
      body_standard: `Every brand begins with a set of decisions. ${brand.brand_name} ensures those decisions are made with intention, backed by research and refined through iteration.`,
      cta_options: ["Start Building", "See the Process"],
      caption: `${brand.brand_name} Brand System v1.0`
    }
  };
}
