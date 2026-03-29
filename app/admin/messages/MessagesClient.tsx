'use client';
import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Check, Clock } from 'lucide-react';
import type { Conversation } from './page';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MessagesClient({ initialConversations }: { initialConversations: Conversation[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);

  async function markRead(id: string) {
    setMarking(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
        );
      }
    } finally {
      setMarking(null);
    }
  }

  return (
    <div className="space-y-3">
      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-500">No messages yet</p>
        </div>
      ) : (
        conversations.map((convo) => {
          const isExpanded = expanded === convo.id;
          const hasUnread = convo.unreadCount > 0;
          return (
            <div
              key={convo.id}
              className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition ${hasUnread ? 'border-green-200' : 'border-slate-200'}`}
            >
              <div
                className="flex items-start justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition"
                onClick={() => setExpanded(isExpanded ? null : convo.id)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${hasUnread ? 'bg-green-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {convo.guestName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{convo.guestName}</span>
                      {hasUnread && (
                        <span className="rounded-full bg-green-700 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {convo.unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{convo.propertyTitle}</div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {fmt(convo.lastMessageAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasUnread && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markRead(convo.id); }}
                      disabled={marking === convo.id}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition"
                    >
                      <Check className="h-3 w-3 inline mr-1" />
                      Mark read
                    </button>
                  )}
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50 space-y-3">
                  {convo.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.sender === 'guest' ? '' : 'flex-row-reverse'}`}
                    >
                      <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${msg.sender === 'guest' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                        {msg.senderName.charAt(0)}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'guest' ? 'bg-white border border-slate-200 text-slate-800' : 'bg-slate-800 text-white'}`}>
                        <div className="text-xs font-medium opacity-60 mb-1">{msg.senderName}</div>
                        {msg.body}
                        <div className="text-[10px] opacity-50 mt-1">{fmt(msg.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
