import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
  context?: 'landing' | 'farmer' | 'vet' | 'admin';
}

const Chatbot: React.FC<ChatbotProps> = ({ className, context = 'landing' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message based on context
      const welcomeMessage = getWelcomeMessage(context);
      setMessages([{
        id: '1',
        text: welcomeMessage,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, context]);

  const getWelcomeMessage = (ctx: string) => {
    switch (ctx) {
      case 'farmer':
        return "Hi! I'm your farm assistant. I can help you with animal health, task management, compliance issues, and answer questions about your farm operations. How can I assist you today?";
      case 'vet':
        return "Hello Doctor! I can help you with medication information, treatment protocols, scheduling, and compliance guidelines. What would you like to know?";
      case 'admin':
        return "Welcome! I can assist with platform administration, user management, compliance monitoring, and system analytics. How can I help?";
      default:
        return "Welcome to FarmSafe Sync! I'm here to help you understand our platform and answer any questions about farm management, animal health tracking, and veterinary services. How can I assist you?";
    }
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Context-specific responses
    if (context === 'farmer') {
      if (lowerMessage.includes('animal') || lowerMessage.includes('livestock')) {
        return "For animal management, you can add new animals using the 'Add Animal' button in your dashboard. You can input details manually or use the barcode scanner for quick registration. Each animal gets tracked for health, treatments, and compliance status.";
      }
      if (lowerMessage.includes('task') || lowerMessage.includes('schedule')) {
        return "Your daily tasks are automatically generated based on treatments, vaccinations, and routine care. You can mark tasks as complete and receive notifications for upcoming activities.";
      }
      if (lowerMessage.includes('withdrawal') || lowerMessage.includes('compliance')) {
        return "Withdrawal periods are automatically calculated based on treatments. Animals in withdrawal show clearly on your dashboard with countdown timers. This ensures compliance with food safety regulations.";
      }
    }
    
    if (context === 'vet') {
      if (lowerMessage.includes('prescription') || lowerMessage.includes('treatment')) {
        return "You can create digital prescriptions in the 'Prescribe' tab. After completing a prescription, you can download it as a JPG file for the farmer's records. The system automatically calculates withdrawal periods.";
      }
      if (lowerMessage.includes('schedule') || lowerMessage.includes('visit')) {
        return "Use the 'Schedule' tab to book farm visits and consultations. You can set appointments, add notes, and coordinate with farmers for optimal timing.";
      }
    }

    // General responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm here to help. What would you like to know about?";
    }
    if (lowerMessage.includes('help')) {
      return "I can assist you with various topics including animal management, health tracking, compliance, schedules, and platform features. What specific area would you like help with?";
    }
    if (lowerMessage.includes('feature') || lowerMessage.includes('what can')) {
      return "FarmSafe Sync offers comprehensive farm management including animal tracking, health records, treatment management, compliance monitoring, task scheduling, and veterinary consultations. What feature interests you most?";
    }
    if (lowerMessage.includes('barcode') || lowerMessage.includes('scan')) {
      return "The barcode scanner feature allows quick animal registration and identification. Simply click 'Add Animal' and choose 'Scan Barcode' to capture animal tags or identification codes instantly.";
    }
    
    return "I understand you're asking about that topic. Could you be more specific? I'm here to help with farm management, animal health, compliance, scheduling, and platform features.";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(input),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-strong gradient-primary hover:scale-110 transition-smooth"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-80 h-96 shadow-strong animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gradient-primary text-primary-foreground">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Farm Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 text-primary-foreground hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2 max-w-[90%]",
                    message.sender === 'user' ? "ml-auto" : "mr-auto"
                  )}
                >
                  {message.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "p-2 rounded-lg text-sm",
                      message.sender === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {message.text}
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 text-accent-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 mr-auto max-w-[90%]">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div className="bg-muted text-muted-foreground p-2 rounded-lg text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1"
                />
                <Button onClick={handleSend} size="sm" className="px-3">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Chatbot;