import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { readFileSync } from 'fs';
import { join } from 'path';
import MessagesClient from './MessagesClient';

export interface Conversation {
  id: string;
  bookingId: string;
  propertyTitle: string;
  guestName: string;
  hostName: string;
  unreadCount: number;
  lastMessageAt: string;
  messages: Array<{
    id: string;
    sender: string;
    senderName: string;
    body: string;
    timestamp: string;
  }>;
}

export default function AdminMessagesPage() {
  const token = cookies().get('admin-session')?.value;
  if (!token || !verifyAdminToken(token)) redirect('/admin/login');

  const raw = readFileSync(join(process.cwd(), 'data', 'messages.json'), 'utf-8');
  const { conversations }: { conversations: Conversation[] } = JSON.parse(raw);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="mt-1 text-sm text-slate-500">
          {conversations.length} conversations &middot; {conversations.filter((c) => c.unreadCount > 0).length} unread
        </p>
      </div>
      <MessagesClient initialConversations={conversations} />
    </div>
  );
}
