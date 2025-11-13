import React, { useState } from 'react';
import type { User } from '../types';
import { CloseIcon } from './icons';

interface NewTopicModalProps {
    users: User[];
    onClose: () => void;
    onCreateTopic: (name: string, memberIds: string[]) => void;
}

const NewTopicModal: React.FC<NewTopicModalProps> = ({ users, onClose, onCreateTopic }) => {
    const [topicName, setTopicName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

    const handleToggleMember = (userId: string) => {
        setSelectedMembers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topicName.trim() && selectedMembers.size > 0) {
            onCreateTopic(topicName.trim(), Array.from(selectedMembers));
        }
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <form className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Yeni Konu Oluştur</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="topic-name" className="block text-sm font-medium text-slate-300 mb-1">Konu Adı</label>
                        <input
                            id="topic-name"
                            type="text"
                            value={topicName}
                            onChange={e => setTopicName(e.target.value)}
                            placeholder="örn: proje-x-geliştirmeleri"
                            className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            required
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-300 mb-2">Üyeleri Seç</label>
                         <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                             {users.map(user => (
                                 <div key={user.id} onClick={() => handleToggleMember(user.id)} className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedMembers.has(user.id) ? 'bg-sky-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                     <div className="flex items-center gap-3">
                                         <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full" />
                                         <span className="text-white">{user.name}</span>
                                     </div>
                                     {selectedMembers.has(user.id) && <div className="h-5 w-5 bg-white rounded-full flex items-center justify-center"><div className="h-2 w-2 bg-sky-600 rounded-full"></div></div>}
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 text-white font-medium hover:bg-slate-500 transition-colors">İptal</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed" disabled={!topicName.trim() || selectedMembers.size === 0}>Oluştur</button>
                </div>
            </form>
        </div>
    )
};

export default NewTopicModal;