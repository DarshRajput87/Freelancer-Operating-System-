const { GoogleGenerativeAI } = require('@google/generative-ai');
const AILog = require('../models/AILog');

// Default (fallback) instance using environment key
const defaultGenAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Core AI call wrapper with logging
 * Supports per-user API keys (BYOK model)
 */
const callAI = async ({ userId, type, messages, refProject, refClient, userApiKey }) => {
  const startTime = Date.now();

  // Use user's API key if provided, otherwise fall back to env key
  const genAI = userApiKey
    ? new GoogleGenerativeAI(userApiKey)
    : defaultGenAI;

  if (!genAI) {
    throw new Error('No API key configured. Please add your Gemini API key in Settings.');
  }

  try {
    const isJson = type === 'analyze' || type === 'tasks' || type === 'proposal';
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: isJson ? { responseMimeType: 'application/json' } : undefined,
    });

    // Gemini doesn't have a direct "system" role in the messages array in the same way, 
    // but gemini-1.5 supports system instruction. For simplicity and compatibility, 
    // we'll combine system and user prompts.
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    
    const prompt = systemMessage 
      ? `${systemMessage}\n\nUSER INPUT:\n${userMessage}`
      : userMessage;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const output = response.text();

    // Persist log
    await AILog.create({
      user: userId,
      type,
      input: userMessage,
      output,
      model: 'gemini-1.5-flash',
      tokensUsed: {
        prompt: 0,
        completion: 0,
        total: 0,
      },
      durationMs: Date.now() - startTime,
      status: 'success',
      refProject,
      refClient,
    });

    return { success: true, output };
  } catch (error) {
    console.error('Gemini error:', error);
    await AILog.create({
      user: userId,
      type,
      input: messages[messages.length - 1].content,
      status: 'error',
      error: error.message,
      durationMs: Date.now() - startTime,
    }).catch(() => {});

    // Provide a helpful error message for bad API keys
    if (error.message?.includes('API_KEY_INVALID') || error.status === 400) {
      throw new Error('Invalid API key. Please check your Gemini API key in Settings.');
    }
    throw new Error(`AI service error: ${error.message}`);
  }
};

/**
 * AI 1: Requirement Analyzer
 */
const analyzeRequirement = async ({ userId, rawRequirement, projectType, refProject, refClient, userApiKey }) => {
  const systemPrompt = `You are a senior software architect and technical consultant.
Analyze raw client requirements and produce a structured technical breakdown JSON.
Be thorough and realistic.`;

  const userPrompt = `Analyze the following ${projectType || 'software'} project requirements and return a structured JSON:

REQUIREMENTS:
${rawRequirement}

Return this exact JSON structure:
{
  "features": ["List of features"],
  "missing": ["Missing requirements"],
  "risks": ["Project risks"],
  "modules": ["System modules"],
  "complexity": "Low | Medium | High | Very High",
  "estimatedHours": <number>,
  "recommendedStack": ["Tech stack"],
  "summary": "Executive summary"
}`;

  const { output } = await callAI({
    userId,
    type: 'analyze',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    refProject,
    refClient,
    userApiKey,
  });

  return JSON.parse(output);
};

/**
 * AI 2: Proposal Generator
 */
const generateProposal = async ({
  userId,
  structuredRequirement,
  budget,
  timeline,
  clientName,
  freelancerName,
  projectName,
  tone = 'professional',
  refProject,
  refClient,
  userApiKey,
}) => {
  const systemPrompt = `You are an expert freelance consultant. Write professional project proposals in ${tone} tone. Return valid JSON only.`;

  const userPrompt = `Generate a project proposal:

CLIENT: ${clientName || 'Valued Client'}
PROJECT: ${projectName || 'Project'}
FREELANCER: ${freelancerName || 'Professional Freelancer'}
BUDGET: ${budget ? `$${budget}` : 'To be discussed'}
TIMELINE: ${timeline || 'To be discussed'}

PROJECT BREAKDOWN:
${JSON.stringify(structuredRequirement, null, 2)}

Return this exact JSON structure:
{
  "title": "Proposal title",
  "intro": "Introduction",
  "understanding": "Detailed understanding",
  "scope": "Scope with bullet points",
  "timeline": "Phases and milestones",
  "pricing": "Investment breakdown",
  "terms": "Payment and project terms",
  "whyMe": "Why me",
  "nextSteps": "Next steps"
}`;

  const { output } = await callAI({
    userId,
    type: 'proposal',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    refProject,
    refClient,
    userApiKey,
  });

  return JSON.parse(output);
};

/**
 * AI 3: Task Breakdown Generator
 */
const generateTasks = async ({
  userId,
  structuredRequirement,
  techStack,
  projectName,
  refProject,
  refClient,
  userApiKey,
}) => {
  const systemPrompt = `You are an experienced project manager. Break down projects into actionable tasks. Return JSON only.`;

  const userPrompt = `Break down the following project into development tasks:

PROJECT: ${projectName || 'Project'}
TECH STACK: ${techStack?.join(', ') || 'Not specified'}

PROJECT REQUIREMENTS:
${JSON.stringify(structuredRequirement, null, 2)}

Return this exact JSON structure:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "estimatedHours": <number>,
      "priority": "Low | Medium | High | Urgent",
      "phase": "Phase name",
      "tags": ["relevant", "tags"]
    }
  ],
  "totalEstimatedHours": <number>,
  "phases": ["Phases in order"],
  "notes": "Important notes"
}`;

  const { output } = await callAI({
    userId,
    type: 'tasks',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    refProject,
    refClient,
    userApiKey,
  });

  return JSON.parse(output);
};

/**
 * AI 4: Client Reply Assistant
 */
const generateReply = async ({
  userId,
  clientMessage,
  context,
  tone,
  freelancerName,
  clientName,
  refProject,
  refClient,
  userApiKey,
}) => {
  const systemPrompt = `You are a professional freelancer. Write a ${tone || 'professional'} reply to a client. Return plaintext only.`;

  const userPrompt = `Write a reply to this client:

CLIENT: ${clientName || 'Client'}
FREELANCER: ${freelancerName || 'Freelancer'}
CONTEXT: ${context || 'Ongoing project'}
MESSAGE: "${clientMessage}"`;

  const { output } = await callAI({
    userId,
    type: 'reply',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    refProject,
    refClient,
    userApiKey,
  });

  return output;
};

/**
 * AI 5: Freelance Proposal Writer (Upwork/Fiverr style)
 */
const generateFreelanceProposal = async ({
  userId,
  jobDescription,
  clientName,
  skills,
  experience,
  portfolio,
  tone = 'professional',
  customInstructions,
  refProject,
  refClient,
  userApiKey,
}) => {
  const systemPrompt = `You are a top 1% freelance proposal writer with a high success rate on platforms like Upwork and Fiverr.

Your task is to generate a highly personalized, human-like, and persuasive proposal based on the given project details.

STRICT INSTRUCTIONS:
- Do NOT sound like AI or use generic phrases
- Do NOT start with "I hope you're doing well"
- Keep it concise (150–250 words)
- Focus on solving the client's problem, not just listing skills
- Use simple, natural, confident language
- Make it feel like it was written quickly by an expert
- Use short paragraphs for readability

STRUCTURE:
1. Personalized opening (hook the client immediately)
2. Show clear understanding of the problem
3. Explain your approach/solution
4. Add relevant experience or proof (if available)
5. End with a strong CTA

OUTPUT REQUIREMENTS:
- Only return the final proposal (no explanations, no labels, no headers)
- Make it specific to the project
- Avoid buzzwords and fluff
- Make it feel premium and conversion-focused

Act like a freelancer who has closed 100+ projects and knows exactly what clients look for.

Write a proposal that:
- Immediately grabs attention in the first 2 lines
- Makes the client feel understood
- Clearly shows how you will solve their problem
- Includes a subtle differentiator (why you vs others)
- Ends with a question or action to increase reply chances

Avoid:
- Generic openings
- Long paragraphs
- Over-explaining

Tone: ${tone}

Make it sharp, confident, and natural. Return ONLY the proposal text, nothing else.`;

  const userPrompt = `Generate a freelance proposal for this project:

PROJECT DESCRIPTION:
${jobDescription}

${clientName ? `CLIENT NAME: ${clientName}` : ''}

FREELANCER SKILLS:
${skills || 'Not specified'}

FREELANCER EXPERIENCE:
${experience || 'Not specified'}

${portfolio ? `PORTFOLIO/PROOF:\n${portfolio}` : ''}

${customInstructions ? `ADDITIONAL NOTES:\n${customInstructions}` : ''}`;

  const { output } = await callAI({
    userId,
    type: 'freelance-proposal',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    refProject,
    refClient,
    userApiKey,
  });

  return output;
};

module.exports = {
  analyzeRequirement,
  generateProposal,
  generateTasks,
  generateReply,
  generateFreelanceProposal,
};
