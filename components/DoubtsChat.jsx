"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const DoubtsChat = ({ chapter, courseId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/doubts-chat', {
        question: userMessage.content,
        chapter: {
          title: chapter.title,
          content: chapter.content,
          topics: chapter.topics
        },
        courseId
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      let errorMessage = 'Sorry, I encountered an error while processing your question. Please try again.';
      let toastMessage = 'Failed to get AI response. Please try again.';

      if (error.response) {
        const status = error.response.status;
        const apiError = error.response.data?.error;

        if (status === 500 && apiError?.includes('AI service is not configured')) {
          errorMessage = 'AI service is currently not available. Please contact support.';
          toastMessage = 'AI service is not configured. Please contact support.';
        } else if (status === 400) {
          errorMessage = 'Invalid request. Please check your question and try again.';
          toastMessage = 'Invalid request. Please try again.';
        } else if (status >= 500) {
          errorMessage = 'Server error occurred. Please try again later.';
          toastMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
        toastMessage = 'Network error. Please check your connection.';
      }

      toast.error(toastMessage);

      // Add error message
      const aiErrorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <h4 className="font-medium text-gray-900">AI Learning Assistant</h4>
        <p className="text-sm text-gray-500 mt-1">
          Ask questions about "{chapter.title}" and get instant help
        </p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="h-80 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Start a conversation by asking a question about this chapter!</p>
              <div className="mt-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("Explain this concept in simpler terms")}
                  className="text-xs"
                >
                  Explain this concept in simpler terms
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("Give me an example")}
                  className="text-xs ml-2"
                >
                  Give me an example
                </Button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <div className="flex-shrink-0">
                  <Bot className="h-6 w-6 text-blue-500" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {message.type === 'user' && (
                <div className="flex-shrink-0">
                  <User className="h-6 w-6 text-blue-500" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <Bot className="h-6 w-6 text-blue-500" />
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about this chapter..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default DoubtsChat;
