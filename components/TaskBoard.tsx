import React, { useState } from 'react';
import type { Project, User, Currency } from '../types';
import { ProjectStatus } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface NewProjectData {
  customerName: string;
  materialName: string;
  quantity: number;
  price: number;
  currency: Currency;
}

interface ProjectBoardProps {
  projects: Project[];
  users: User[];
  onAddProject: (data: NewProjectData) => void;
  onUpdateProjectStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onViewProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectCard: React.FC<{ project: Project; user?: User; onViewProject: (project: Project) => void; onDeleteProject: (projectId: string) => void; }> = ({ project, user, onViewProject, onDeleteProject }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    if (window.confirm('Bu satışı kalıcı olarak silmek istediğinizden emin misiniz?')) {
        onDeleteProject(project.id);
    }
  };
    
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('projectId', project.id)}
      className="bg-slate-800 p-3 rounded-md shadow-lg border border-slate-700 cursor-grab active:cursor-grabbing hover:border-sky-500 transition-colors group relative"
    >
        <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/50 text-slate-400 hover:bg-red-500/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
            aria-label="Satışı Sil"
        >
            <TrashIcon className="h-4 w-4" />
        </button>

      <div onClick={() => onViewProject(project)} className="cursor-pointer">
        <p className="font-semibold text-slate-200 mb-2 truncate pr-6">{project.customerName}</p>
        <p className="text-sm text-slate-400">{project.materialName}</p>
        <div className="flex justify-between items-center mt-3 text-sm">
            <span className="font-mono text-slate-300">{project.quantity.toLocaleString('tr-TR')} kg</span>
            <span className="font-semibold text-green-400">{project.price.toLocaleString('tr-TR', { style: 'currency', currency: project.currency })}</span>
        </div>
        <div className="flex items-center justify-end mt-3 pt-2 border-t border-slate-700/50">
            {user && (
            <img
                src={user.avatarUrl}
                alt={user.name}
                title={user.name}
                className="h-6 w-6 rounded-full"
            />
            )}
        </div>
      </div>
    </div>
  );
};

const ProjectBoard: React.FC<ProjectBoardProps> = ({ projects, users, onAddProject, onUpdateProjectStatus, onViewProject, onDeleteProject }) => {
  const [newProjectData, setNewProjectData] = useState({ customerName: '', materialName: '', quantity: '', unitPrice: '', currency: 'TRY' as Currency });
  const [isAdding, setIsAdding] = useState(false);
  const [draggedOverColumn, setDraggedOverColumn] = useState<ProjectStatus | null>(null);

  const userMap = new Map(users.map(u => [u.id, u]));

  const columns: { status: ProjectStatus, title: string, color: string }[] = [
    { status: ProjectStatus.TODO, title: 'Sıcak Satış', color: 'border-yellow-500' },
    { status: ProjectStatus.IN_PROGRESS, title: 'Proje Satışlar', color: 'border-sky-500' },
    { status: ProjectStatus.DONE, title: 'Tamamlanan Satışlar', color: 'border-green-500' },
  ];

  const handleAddProjectSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(newProjectData.customerName.trim() && newProjectData.materialName.trim() && newProjectData.quantity && newProjectData.unitPrice) {
          onAddProject({
            customerName: newProjectData.customerName.trim(),
            materialName: newProjectData.materialName.trim(),
            quantity: parseFloat(newProjectData.quantity),
            price: parseFloat(newProjectData.quantity) * parseFloat(newProjectData.unitPrice),
            currency: newProjectData.currency,
          });
          setNewProjectData({ customerName: '', materialName: '', quantity: '', unitPrice: '', currency: 'TRY' });
          setIsAdding(false);
      }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProjectData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: ProjectStatus) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const projectId = e.dataTransfer.getData('projectId');
    const project = projects.find(p => p.id === projectId);
    if (project && project.status !== status) {
        onUpdateProjectStatus(projectId, status);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 h-full p-6 text-white overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Proje Satış</h1>
        {!isAdding && (
            <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors">
                <PlusIcon className="h-5 w-5"/>
                Yeni Satış Ekle
            </button>
        )}
      </div>

      {isAdding && (
          <form onSubmit={handleAddProjectSubmit} className="bg-slate-800 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 border border-slate-700">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Müşteri Adı</label>
                <input
                    type="text"
                    name="customerName"
                    value={newProjectData.customerName}
                    onChange={handleInputChange}
                    placeholder="ABC Plastik A.Ş."
                    className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Malzeme Adı</label>
                <input
                    type="text"
                    name="materialName"
                    value={newProjectData.materialName}
                    onChange={handleInputChange}
                    placeholder="PET Granül"
                    className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Miktar (kg)</label>
                <input
                    type="number"
                    name="quantity"
                    value={newProjectData.quantity}
                    onChange={handleInputChange}
                    placeholder="2500"
                    className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Birim Fiyat</label>
                 <div className="flex">
                    <input
                        type="number"
                        name="unitPrice"
                        value={newProjectData.unitPrice}
                        onChange={handleInputChange}
                        placeholder="18.50"
                        className="w-full bg-slate-700 border-slate-600 rounded-l-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-r-none"
                        step="0.01"
                        required
                    />
                    <select
                        name="currency"
                        value={newProjectData.currency}
                        onChange={handleInputChange}
                        className="bg-slate-600 border-slate-500 rounded-r-md px-2 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 border-l-0"
                    >
                        <option value="TRY">₺</option>
                        <option value="USD">$</option>
                        <option value="EUR">€</option>
                    </select>
                 </div>
            </div>
            <div className="flex items-end gap-2 md:col-span-6 md:justify-end">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-md bg-slate-600 text-white font-medium hover:bg-slate-500 transition-colors">İptal</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors">Ekle</button>
            </div>
          </form>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => (
          <div 
            key={column.status}
            onDragOver={(e) => { e.preventDefault(); setDraggedOverColumn(column.status); }}
            onDragLeave={() => setDraggedOverColumn(null)}
            onDrop={(e) => handleDrop(e, column.status)}
            className={`bg-slate-800/50 rounded-lg p-4 flex flex-col transition-colors ${draggedOverColumn === column.status ? 'bg-slate-700/50' : ''}`}
            >
            <h2 className={`text-lg font-semibold text-slate-200 pb-3 mb-4 border-b-2 ${column.color}`}>{column.title}</h2>
            <div className="space-y-4 overflow-y-auto">
              {projects
                .filter(project => project.status === column.status)
                .map(project => (
                  <ProjectCard key={project.id} project={project} user={userMap.get(project.assignedTo)} onViewProject={onViewProject} onDeleteProject={onDeleteProject} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectBoard;