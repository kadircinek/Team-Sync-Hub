
import React, { useState, useRef, useEffect } from 'react';
import type { Topic, User, Message } from '../types';
import { SendIcon, SparklesIcon, CloseIcon } from './icons';
import { summarizeConversation } from '../services/geminiService';

interface ChatWindowProps {
  topic: Topic;
  currentUser: User;
  users: User[];
  onSendMessage: (topicId: string, messageText: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ topic, currentUser, users, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userMap = new Map<string, User>(users.map(u => [u.id, u]));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [topic.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(topic.id, newMessage);
      setNewMessage('');
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary(null);
    const result = await summarizeConversation(topic.messages, users);
    setSummary(result);
    setIsSummarizing(false);
  };
  
  const renderTextWithMentions = (text: string) => {
    const mentionRegex = /(@[a-zA-Z0-9_]+)/g;
    const parts = text.split(mentionRegex);

    return (
        <>
            {parts.map((part, index) =>
                mentionRegex.test(part) ? (
                    <strong key={index} className="text-sky-400 font-semibold bg-sky-900/50 px-1 rounded-sm">{part}</strong>
                ) : (
                    part
                )
            )}
        </>
    );
  };


  const renderMessage = (message: Message) => {
    const user = userMap.get(message.userId);
    const isCurrentUser = message.userId === currentUser.id;

    return (
      <div key={message.id} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {!isCurrentUser && (
          <img src={user?.avatarUrl} alt={user?.name} className="h-8 w-8 rounded-full mt-1" />
        )}
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-2 rounded-lg max-w-sm md:max-w-md lg:max-w-lg ${isCurrentUser ? 'bg-sky-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
            {!isCurrentUser && (
               <p className="text-xs font-bold text-sky-400 mb-1">{user?.name}</p>
            )}
            <p className="text-sm break-words">{renderTextWithMentions(message.text)}</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
        </div>
        {isCurrentUser && (
          <img src={user?.avatarUrl} alt={user?.name} className="h-8 w-8 rounded-full mt-1" />
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 text-white">
        <div>
            <h2 className="font-bold text-lg"># {topic.name}</h2>
            <div className="flex items-center -space-x-2 mt-1">
                {topic.members.map(memberId => {
                    const member = userMap.get(memberId);
                    return member ? <img key={member.id} src={member.avatarUrl} title={member.name} className="h-6 w-6 rounded-full border-2 border-slate-800" /> : null;
                })}
            </div>
        </div>
        <button onClick={handleSummarize} disabled={isSummarizing || !process.env.API_KEY} className="flex items-center gap-2 px-3 py-2 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
          <SparklesIcon className="h-5 w-5" />
          {isSummarizing ? 'Özetleniyor...' : 'Konuşmayı Özetle'}
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {topic.messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`#${topic.name} içinde mesaj...`}
            className="flex-1 bg-slate-700 border-slate-600 rounded-md px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white rounded-md p-2 transition-colors">
            <SendIcon className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* Summary Modal */}
      {summary && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-violet-400" />
                Konuşma Özeti
              </h3>
              <button onClick={() => setSummary(null)} className="text-slate-400 hover:text-white">
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-y-auto pr-2">
                <p className="text-slate-300 whitespace-pre-wrap">{summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
