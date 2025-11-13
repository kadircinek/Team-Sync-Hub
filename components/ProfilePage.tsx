import React, { useState, useEffect } from 'react';
import type { User, Project } from '../types';
import { PencilIcon, CheckIcon, CloseIcon, XMarkIcon } from './icons';

interface ProfilePageProps {
  user: User;
  projects: Project[];
  onUpdateUser: (updatedData: Partial<User> & { id: string }) => void;
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, projects, onUpdateUser, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatarUrl);

  useEffect(() => {
    setName(user.name);
    setAvatar(user.avatarUrl);
  }, [user]);

  const assignedProjects = projects.filter(p => p.assignedTo === user.id);

  const handleSave = () => {
    if (name.trim() !== user.name || avatar.trim() !== user.avatarUrl) {
      onUpdateUser({ id: user.id, name: name.trim(), avatarUrl: avatar.trim() });
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setName(user.name);
    setAvatar(user.avatarUrl);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 h-full p-6 text-white overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Profil</h1>
        <button onClick={onBack} className="text-slate-400 hover:text-white">
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      
      <div className="max-w-4xl mx-auto w-full">
        {/* Profile Header */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
                <img src={avatar} alt={name} className="h-24 w-24 rounded-full ring-4 ring-slate-700" />
                {isEditing && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <PencilIcon className="h-6 w-6 text-white"/>
                    </div>
                )}
            </div>
            <div className="flex-1 text-center sm:text-left">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                         <input 
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="text-2xl font-bold bg-slate-700 border border-slate-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                         />
                    </div>
                ) : (
                    <h2 className="text-2xl font-bold">{name}</h2>
                )}
                <p className="text-slate-400">{user.email}</p>
            </div>
            <div>
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <button onClick={handleSave} className="p-2 bg-green-600 hover:bg-green-700 rounded-md"><CheckIcon className="h-5 w-5"/></button>
                        <button onClick={handleCancel} className="p-2 bg-slate-600 hover:bg-slate-500 rounded-md"><XMarkIcon className="h-5 w-5"/></button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition-colors">
                        <PencilIcon className="h-4 w-4"/>
                        Profili Düzenle
                    </button>
                )}
            </div>
        </div>
        
        {isEditing && (
             <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mt-4">
                 <label className="block text-sm font-medium text-slate-300 mb-1">Avatar URL</label>
                 <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://i.pravatar.cc/150?u=..."
                    className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
             </div>
        )}

        {/* Assigned Projects */}
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Atanan Projeler ({assignedProjects.length})</h3>
            <div className="bg-slate-800 rounded-lg border border-slate-700">
                <ul className="divide-y divide-slate-700">
                    {assignedProjects.length > 0 ? (
                        assignedProjects.map(project => (
                             <li key={project.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-200">{project.customerName}</p>
                                    <p className="text-sm text-slate-400">{project.materialName}</p>
                                </div>
                                <span className="text-sm font-medium text-green-400">{project.price.toLocaleString('tr-TR', { style: 'currency', currency: project.currency })}</span>
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-slate-500">Size atanmış proje bulunmamaktadır.</li>
                    )}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
