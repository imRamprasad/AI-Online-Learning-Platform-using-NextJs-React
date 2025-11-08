import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function POST(request) {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('GOOGLE_AI_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const { question, chapter, courseId } = await request.json();

    if (!question || !chapter || !chapter.title || !chapter.content) {
      return NextResponse.json(
        { error: 'Question, chapter title, and chapter content are required' },
        { status: 400 }
      );
    }

    // Truncate chapter content to prevent exceeding token limits (limit to 2000 characters)
    const truncatedContent = chapter.content.length > 2000
      ? chapter.content.substring(0, 2000) + '...'
      : chapter.content;

    // Create the prompt for the AI
    const prompt = `
You are an expert AI tutor helping students understand course material. A student has asked a question about a specific chapter.

Chapter Title: ${chapter.title}
Chapter Content: ${truncatedContent}
Chapter Topics: ${chapter.topics?.join(', ') || 'Not specified'}

Student's Question: ${question}

Please provide a clear, helpful, and accurate answer that:
1. Directly addresses the student's question
2. Uses the chapter content as the primary source of information
3. Explains concepts in an easy-to-understand way
4. Provides examples when helpful
5. Stays focused on the chapter's material
6. Is concise but comprehensive

If the question is not directly related to this chapter's content, politely redirect the student to ask about the chapter material.

Answer as a knowledgeable and patient tutor.
`;

    // Generate response using Gemini (updated model)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Error in doubts-chat API:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to process your question. Please try again.' },
      { status: 500 }
    );
  }
}
