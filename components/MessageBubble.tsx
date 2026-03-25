import { ConversationMessage } from '@/types/message';

interface MessageBubbleProps {
  message: ConversationMessage;
  isOwnMessage: boolean;
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
          isOwnMessage
            ? 'rounded-br-md bg-blue-600 text-white'
            : 'rounded-bl-md border border-black/10 bg-white text-black'
        }`}
      >
        <p className="text-sm leading-6 sm:text-[15px]">{message.body}</p>
        <div
          className={`mt-2 flex items-center justify-between gap-3 text-xs ${
            isOwnMessage ? 'text-blue-100' : 'text-black/50'
          }`}
        >
          <span>{message.senderName}</span>
          <span>{formatTimestamp(message.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
