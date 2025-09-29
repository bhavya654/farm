// src/components/MessageItem.tsx -- CORRECTED VERSION

import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Ensure this interface matches the one in Chatbot.tsx
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date; // Add the timestamp property here
}

interface MessageItemProps {
  message: Message;
  isTyping?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isTyping = false }) => {
  const isBot = message.sender === 'bot';

  if (isTyping) {
    return (
      <div className="flex gap-2 mr-auto max-w-[90%]">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Bot className="h-3 w-3 text-primary-foreground" />
        </div>
        <div className="bg-muted text-muted-foreground p-2 rounded-lg text-sm">
          <div className="flex gap-1 items-center">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-2 max-w-[90%]',
        isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'
      )}
    >
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
          isBot ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
        )}
      >
        {isBot ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
      </div>
      <div
        className={cn(
          'p-2 rounded-lg text-sm',
          isBot ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'
        )}
      >
        <p>{message.text}</p>
      </div>
    </div>
  );
};

export default MessageItem;