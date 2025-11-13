import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ProjectBoard from './components/TaskBoard';
import ShipmentBoard from './components/ShipmentBoard';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import NewTopicModal from './components/NewTopicModal';
import { User, Topic, Project, ProjectStatus, Shipment, Currency } from './types';
import { CloseIcon, PencilIcon, CheckIcon } from './components/icons';
import { 
    initializeAndFetchData,
    addMessageToTopic,
    addNewProject,
    updateProject,
    updateProjectStatus,
    deleteProjectById,
    addNewTopic,
    addNewShipment,
    updateShipment,
    deleteShipmentById,
    signInUser,
    signUpUser,
    updateUser,
} from './services/firebaseService';

// MODAL COMPONENTS

interface ProjectDetailsModalProps {
    project: Project;
    users: User[];
    onClose: () => void;
    onSave: (updatedProject: Project) => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, users, onClose, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedProject, setEditedProject] = useState<Project>(project);

    useEffect(() => {
        setEditedProject(project); // Reset state if a new project is opened
    }, [project]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setEditedProject(prev => {
            const currentUnitPrice = prev.quantity > 0 ? prev.price / prev.quantity : 0;
            
            if (name === 'unitPrice') {
                const newUnitPrice = parseFloat(value) || 0;
                return { ...prev, price: prev.quantity * newUnitPrice };
            }
            
            if (name === 'quantity') {
                const newQuantity = parseFloat(value) || 0;
                return { ...prev, quantity: newQuantity, price: newQuantity * currentUnitPrice };
            }
            
            return { ...prev, [name]: value };
        });
    };

    const handleSave = () => {
        onSave(editedProject);
        setIsEditing(false); 
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProject(project); // Revert changes
    };
    
    const assignedUser = users.find(u => u.id === project.assignedTo);
    const statusStyles: Record<ProjectStatus, string> = {
        [ProjectStatus.TODO]: 'bg-yellow-500/20 text-yellow-300',
        [ProjectStatus.IN_PROGRESS]: 'bg-sky-500/20 text-sky-300',
        [ProjectStatus.DONE]: 'bg-green-500/20 text-green-300',
    };
    const statusTitles: Record<ProjectStatus, string> = {
        [ProjectStatus.TODO]: 'Sıcak Satış',
        [ProjectStatus.IN_PROGRESS]: 'Proje Satışlar',
        [ProjectStatus.DONE]: 'Tamamlanan Satışlar',
    };

    if (isEditing) {
        return (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={handleCancel}>
                <div className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Satışı Düzenle</h3>
                        <div className="flex items-center gap-3">
                            <button onClick={handleSave} className="text-green-400 hover:text-green-300" aria-label="Kaydet"><CheckIcon className="h-6 w-6"/></button>
                            <button onClick={handleCancel} className="text-slate-400 hover:text-white" aria-label="İptal"><CloseIcon className="h-6 w-6"/></button>
                        </div>
                    </div>
                    <div className="space-y-4 text-slate-300">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Müşteri Adı</label>
                            <input type="text" name="customerName" value={editedProject.customerName} onChange={handleInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Malzeme</label>
                            <input type="text" name="materialName" value={editedProject.materialName} onChange={handleInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-slate-400 mb-1">Miktar (kg)</label>
                                <input type="number" name="quantity" value={editedProject.quantity} onChange={handleInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"/>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-1">Birim Fiyat</label>
                                <div className="flex">
                                    <input type="number" name="unitPrice" step="0.01" value={editedProject.quantity > 0 ? (editedProject.price / editedProject.quantity).toFixed(2) : ''} onChange={handleInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-l-md p-2 rounded-r-none focus:ring-2 focus:ring-sky-500 focus:outline-none"/>
                                    <select name="currency" value={editedProject.currency} onChange={handleInputChange} className="bg-slate-600 border border-slate-600 border-l-0 rounded-r-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
                                        <option value="TRY">₺</option>
                                        <option value="USD">$</option>
                                        <option value="EUR">€</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Sorumlu Satışçı</label>
                            <select name="assignedTo" value={editedProject.assignedTo} onChange={handleInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none">
                                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{project.customerName}</h3>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-sky-400 transition-colors" aria-label="Düzenle">
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Kapat">
                            <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                <div className="space-y-4 text-slate-300">
                     <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                        <span className="font-semibold text-slate-400">Malzeme</span>
                        <span>{project.materialName}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                        <span className="font-semibold text-slate-400">Durum</span>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[project.status]}`}>{statusTitles[project.status]}</span>
                    </div>
                    {assignedUser && (
                        <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                            <span className="font-semibold text-slate-400">Sorumlu Satışçı</span>
                            <div className="flex items-center gap-2">
                                <img src={assignedUser.avatarUrl} alt={assignedUser.name} className="h-6 w-6 rounded-full" />
                                <span>{assignedUser.name}</span>
                            </div>
                        </div>
                    )}
                     <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                        <span className="font-semibold text-slate-400">Miktar</span>
                        <span className="font-mono">{project.quantity.toLocaleString('tr-TR')} kg</span>
                    </div>
                     <div className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                        <span className="font-semibold text-slate-400">Birim Fiyat</span>
                        <span className="font-mono">{project.quantity > 0 ? (project.price / project.quantity).toLocaleString('tr-TR', { style: 'currency', currency: project.currency, minimumFractionDigits: 2 }) : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-700 p-3 rounded-md border-t-2 border-green-500">
                        <span className="font-bold text-slate-300">Toplam Tutar</span>
                        <span className="font-bold text-lg text-green-400">{project.price.toLocaleString('tr-TR', { style: 'currency', currency: project.currency })}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


// MAIN APP COMPONENT

const App: React.FC = () => {
  // Auth state
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // App data state
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  
  // UI state
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [currentView, setCurrentView] = useState<'chat' | 'projects' | 'shipments' | 'profile'>('projects');
  const [lastView, setLastView] = useState<'chat' | 'projects' | 'shipments'>('projects');
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  
  useEffect(() => {
    // In a real app, you'd check for a session token. Here, we default to unauthenticated.
    setAuthStatus('unauthenticated');
  }, []);

  const loadAppData = async () => {
    try {
        setLoadingData(true);
        setError(null);
        const { usersData, topicsData, projectsData, shipmentsData } = await initializeAndFetchData();
        
        if (usersData.length === 0 || topicsData.length === 0) {
             throw new Error("Veritabanından başlangıç verileri okunamadı. Lütfen Firebase Firestore ayarlarınızı ve koleksiyonlarınızı kontrol edin.");
        }

        setUsers(usersData);
        setTopics(topicsData);
        setProjects(projectsData);
        setShipments(shipmentsData);
        setSelectedTopicId(topicsData[0]?.id || '');
    } catch (error: any) {
        console.error("Failed to fetch initial data:", error);
        setError(`Veri yüklenemedi: ${error.message || 'Bilinmeyen bir hata oluştu.'}. Lütfen Firebase proje yapılandırmanızı ve güvenlik kurallarınızı kontrol edin.`);
    } finally {
        setLoadingData(false);
    }
  };
  
  const handleLogin = async (email: string) => {
    const user = await signInUser(email);
    if (user) {
        setCurrentUser(user);
        setAuthStatus('authenticated');
        await loadAppData();
    } else {
        throw new Error("Kullanıcı bulunamadı veya bilgiler yanlış.");
    }
  };

  const handleSignUp = async (name: string, email: string) => {
    const newUser = await signUpUser(name, email);
    setCurrentUser(newUser);
    setAuthStatus('authenticated');
    await loadAppData();
  };
  
  const handleUpdateUser = useCallback(async (userData: Partial<User> & { id: string }) => {
    const updatedUser = await updateUser(userData);
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  }, []);
  
  // -- Other Handlers from original app --
  const handleSelectTopic = useCallback((topicId: string) => {
    setSelectedTopicId(topicId);
  }, []);

  const handleSetView = useCallback((view: 'chat' | 'projects' | 'shipments') => {
      setCurrentView(view);
      setLastView(view);
  }, []);

  const handleViewProfile = useCallback(() => {
      setCurrentView('profile');
  }, []);

  const handleBackFromProfile = useCallback(() => {
      setCurrentView(lastView);
  }, [lastView]);

  const handleSendMessage = useCallback(async (topicId: string, messageText: string) => {
    if (!currentUser) return;
    const newMessage = await addMessageToTopic(topicId, messageText, currentUser.id);
    setTopics(prevTopics =>
      prevTopics.map(topic =>
        topic.id === topicId
          ? { ...topic, messages: [...topic.messages, newMessage] }
          : topic
      )
    );
  }, [currentUser]);

  const handleAddProject = useCallback(async (data: { customerName: string; materialName: string; quantity: number; price: number; currency: Currency; }) => {
      if (!currentUser) return;
      const newProject = await addNewProject(data, currentUser.id);
      setProjects(prevProjects => [newProject, ...prevProjects]);
  }, [currentUser]);
  
  const handleUpdateProjectStatus = useCallback(async (projectId: string, newStatus: ProjectStatus) => {
    const updatedProject = await updateProjectStatus(projectId, newStatus);
    if(updatedProject) {
        setProjects(prevProjects =>
            prevProjects.map(project =>
                project.id === projectId ? updatedProject : project
            )
        );
    }
  }, []);

  const handleUpdateProject = useCallback(async (projectToUpdate: Project) => {
    const updatedProject = await updateProject(projectToUpdate);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setViewingProject(null); // Close modal on save
  }, []);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    await deleteProjectById(projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (viewingProject?.id === projectId) {
        setViewingProject(null);
    }
  }, [viewingProject]);

  const handleCreateTopic = useCallback(async (name: string, memberIds: string[]) => {
      if (!currentUser) return;
      const newTopic = await addNewTopic(name, memberIds, currentUser);
      setTopics(prevTopics => [...prevTopics, newTopic]);
      setSelectedTopicId(newTopic.id);
      setCurrentView('chat');
      setIsNewTopicModalOpen(false);
  }, [currentUser]);

  const handleAddShipment = useCallback(async (shipmentData: Omit<Shipment, 'id' | 'status'>) => {
    const newShipment = await addNewShipment(shipmentData);
    setShipments(prev => [newShipment, ...prev]);
  }, []);
  
  const handleUpdateShipment = useCallback(async (updatedShipment: Shipment) => {
      const result = await updateShipment(updatedShipment);
      setShipments(prev => prev.map(s => s.id === result.id ? result : s));
  }, []);
  
  const handleDeleteShipment = useCallback(async (shipmentId: string) => {
    await deleteShipmentById(shipmentId);
    setShipments(prev => prev.filter(s => s.id !== shipmentId));
  }, []);

  const selectedTopic = useMemo(() => topics.find(t => t.id === selectedTopicId) || topics[0], [topics, selectedTopicId]);

  if (authStatus === 'loading') {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
            <span>Yükleniyor...</span>
        </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  if (loadingData) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
            <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uygulama Verileri Yükleniyor...</span>
            </div>
        </div>
      );
  }

  if (error) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white p-8">
            <div className="bg-slate-800 border border-red-500/50 rounded-lg p-6 max-w-lg text-center">
                <h2 className="text-xl font-bold text-red-400 mb-2">Uygulama Başlatılamadı</h2>
                <p className="text-slate-300 mb-4">{error}</p>
                 <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors">
                    Tekrar Dene
                </button>
            </div>
        </div>
      )
  }

  if (!currentUser) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
            <span>Geçerli kullanıcı bulunamadı. Lütfen tekrar giriş yapın.</span>
          </div>
      );
  }

  const renderCurrentView = () => {
      switch(currentView) {
        case 'chat':
          if (!selectedTopic) return <div className="flex-1 flex items-center justify-center bg-slate-900 text-slate-400">Konu seçilmedi.</div>;
          return (
            <ChatWindow
              key={selectedTopic.id}
              topic={selectedTopic}
              currentUser={currentUser}
              users={users}
              onSendMessage={handleSendMessage}
            />
          );
        case 'projects':
            return (
                <ProjectBoard 
                    projects={projects} 
                    users={users} 
                    onAddProject={handleAddProject}
                    onUpdateProjectStatus={handleUpdateProjectStatus}
                    onViewProject={setViewingProject}
                    onDeleteProject={handleDeleteProject}
                />
            );
        case 'shipments':
            return (
                <ShipmentBoard 
                    shipments={shipments}
                    onAddShipment={handleAddShipment}
                    onUpdateShipment={handleUpdateShipment}
                    onDeleteShipment={handleDeleteShipment}
                />
            );
        case 'profile':
            return (
                <ProfilePage
                    user={currentUser}
                    projects={projects}
                    onUpdateUser={handleUpdateUser}
                    onBack={handleBackFromProfile}
                />
            );
        default:
            return null;
      }
  }

  return (
    <div className="flex h-screen font-sans">
      <Sidebar
        topics={topics}
        currentUser={currentUser}
        selectedTopicId={selectedTopicId}
        onSelectTopic={handleSelectTopic}
        currentView={currentView}
        onSetView={handleSetView}
        onAddNewTopic={() => setIsNewTopicModalOpen(true)}
        onViewProfile={handleViewProfile}
      />
      <main className="flex-1 h-full">
        {renderCurrentView()}
      </main>

      {viewingProject && (
        <ProjectDetailsModal 
            project={viewingProject} 
            users={users} 
            onClose={() => setViewingProject(null)}
            onSave={handleUpdateProject}
        />
      )}
      {isNewTopicModalOpen && (
          <NewTopicModal users={users} onClose={() => setIsNewTopicModalOpen(false)} onCreateTopic={handleCreateTopic} />
      )}
    </div>
  );
};

export default App;