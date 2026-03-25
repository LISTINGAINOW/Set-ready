export type MessageSenderRole = 'host' | 'guest';

export interface ConversationMessage {
  id: string;
  sender: MessageSenderRole;
  senderName: string;
  body: string;
  timestamp: string;
}

export interface MessageConversation {
  id: string;
  bookingId: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  hostName: string;
  unreadCount: number;
  lastMessageAt: string;
  messages: ConversationMessage[];
}
