// src/components/Chatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, X, Bot, User, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import VoiceflowChatbot from './VoiceflowChatbot';
import MessageItem from './MessageItem';

// Define the window.voiceflow type to avoid TypeScript errors
declare global {
  interface Window {
    voiceflow: any;
  }
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot: React.FC<{ className?: string }> = ({ className }) => {
  const [isCustomChatOpen, setIsCustomChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [customMessages, setCustomMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [customMessages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
        return 'Hello there! How can I assist you today? Ask me about crops, weather, or talk to our advanced AI.';
    }
    if (lowerCaseMessage.includes('weather')) {
        return 'The weather in your region is currently 28°C and sunny. Expected rainfall later this week.';
    }
    if (lowerCaseMessage.includes('crop')) {
        return 'For this season, consider planting soybeans or maize. They are well-suited to the current climate.';
    }
    return "I can help with basic questions. For more complex queries, please switch to our Farm Assistant AI.";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setCustomMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(currentInput),
        sender: 'bot',
        timestamp: new Date(),
      };
      setCustomMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSwitchToVoiceflow = () => {
    // Hide our custom chat UI
    setIsCustomChatOpen(false);

    // Open the Voiceflow widget using its API
    // Check if the voiceflow API is available on the window object
    if (window.voiceflow && window.voiceflow.chat) {
      window.voiceflow.chat.open();
    } else {
      console.error("Voiceflow widget is not available.");
    }
  };

  return (
    <>
      {/* This component loads the Voiceflow script once and for all.
        It renders `null`, so it's invisible.
      */}
      {/* <VoiceflowChatbot /> */}

      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        {!isCustomChatOpen ? (
          // This button now only opens our custom chat. Voiceflow has its own button.
          <Button onClick={() => setIsCustomChatOpen(true)} className="h-14 w-14 rounded-full shadow-lg">
            <MessageCircle className="h-6 w-6" />
          </Button>
        ) : (
          <Card className="w-80 h-[450px] shadow-strong flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-md">
                <Bot className="h-4 w-4" />
                Farmer Assistant
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsCustomChatOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {customMessages.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}
                {isTyping && (
                  <MessageItem message={{ id: 'typing', text: '...', sender: 'bot', timestamp: new Date() }} isTyping />
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-2 border-t">
                <Button onClick={handleSwitchToVoiceflow} className="w-full mb-2" variant="outline" size="sm">
                  <BrainCircuit className="h-4 w-4 mr-2" /> Talk to Advanced AI
                </Button>
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a quick question..."
                    className="flex-1"
                  />
                  <Button onClick={handleSend} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default Chatbot;