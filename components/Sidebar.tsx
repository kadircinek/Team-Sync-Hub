import React from 'react';
import type { Topic, User } from '../types';
import { ChatIcon, ProjectsIcon, PlusIcon, TruckIcon } from './icons';

interface SidebarProps {
  topics: Topic[];
  currentUser: User;
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  currentView: 'chat' | 'projects' | 'shipments' | 'profile';
  onSetView: (view: 'chat' | 'projects' | 'shipments') => void;
  onAddNewTopic: () => void;
  onViewProfile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  topics,
  currentUser,
  selectedTopicId,
  onSelectTopic,
  currentView,
  onSetView,
  onAddNewTopic,
  onViewProfile,
}) => {
  return (
    <div className="bg-slate-800 text-slate-200 flex flex-col h-full w-64">
      <div className="p-4 border-b border-slate-700">
        <h1 className="font-bold text-xl text-white">Team Sync Hub</h1>
      </div>

      <div className="p-4 flex gap-2">
        <button
          onClick={() => onSetView('chat')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'chat' ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          <ChatIcon className="h-5 w-5" />
          Chat
        </button>
        <button
          onClick={() => onSetView('projects')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'projects' ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          <ProjectsIcon className="h-5 w-5" />
          Projeler
        </button>
         <button
          onClick={() => onSetView('shipments')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentView === 'shipments' ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          <TruckIcon className="h-5 w-5" />
          Sevkiyat
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Konular</h2>
            <button onClick={onAddNewTopic} className="text-slate-400 hover:text-white transition-colors" aria-label="Yeni konu ekle">
                <PlusIcon className="h-5 w-5" />
            </button>
        </div>
        {topics.map(topic => (
          <a
            key={topic.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectTopic(topic.id);
              onSetView('chat');
            }}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTopicId === topic.id && currentView === 'chat'
                ? 'bg-sky-600 text-white'
                : 'hover:bg-slate-700 text-slate-300'
            }`}
          >
            # {topic.name}
          </a>
        ))}
      </nav>

      <div className="p-2 border-t border-slate-700">
        <button
          onClick={onViewProfile}
          className={`w-full text-left p-2 rounded-md transition-colors ${currentView === 'profile' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
        >
          <div className="flex items-center gap-3">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-10 w-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;