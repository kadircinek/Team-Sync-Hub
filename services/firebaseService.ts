// This service is now connected to a live Firebase Firestore database.
import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
    getDoc,
    writeBatch,
    setDoc,
    where
} from "firebase/firestore";

import type { User, Topic, Message, Project, Shipment, Currency } from '../types';
import { ProjectStatus, ShipmentStatus } from '../types';

// --- FIREBASE SETUP ---
// Configuration provided by the user.
const firebaseConfig = {
  apiKey: "AIzaSyCaG_W-G0aOGdKrONBlMI3N2QeUsCfC_cU",
  authDomain: "buteohub.firebaseapp.com",
  projectId: "buteohub",
  storageBucket: "buteohub.firebasestorage.app",
  messagingSenderId: "713494695772",
  appId: "1:713494695772:web:9aa11e2e8a1bcc175cfb99",
  measurementId: "G-3ZMYRJM0FK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- DATA CONVERTERS & HELPERS ---
// Helper functions to convert Firestore documents to application-specific types.
const docToData = (d: any) => ({ id: d.id, ...d.data() });

const toAppTypes = {
    user: (d: any): User => docToData(d),
    topic: (d: any): Topic => ({ ...docToData(d), messages: [] }),
    project: (d: any): Project => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : undefined,
        };
    },
    shipment: (d: any): Shipment => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : undefined,
        };
    },
    message: (d: any): Message => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            timestamp: data.timestamp.toDate().toISOString(),
        };
    },
};

// --- SEEDING LOGIC (for first run) ---
let hasInitialized = false;

const seedDatabase = async () => {
    console.log("First run detected, seeding database with initial data...");

    const MOCK_USERS: User[] = [
        { id: 'u1', name: 'Ali Veli', avatarUrl: 'https://i.pravatar.cc/150?u=u1', email: 'ali@buteo.com' },
        { id: 'u2', name: 'Ayşe Fatma', avatarUrl: 'https://i.pravatar.cc/150?u=u2', email: 'ayse@buteo.com' },
        { id: 'u3', name: 'Can Yılmaz', avatarUrl: 'https://i.pravatar.cc/150?u=u3', email: 'can@buteo.com' },
        { id: 'u4', name: 'Zeynep Kaya', avatarUrl: 'https://i.pravatar.cc/150?u=u4', email: 'zeynep@buteo.com' },
    ];
    const MOCK_TOPICS: Topic[] = [
      {
        id: 't1',
        name: 'q4-pazarlama-kampanyası',
        members: ['u1', 'u2', 'u4'],
        messages: [
          { id: 'm1', text: 'Hey Zeynep, yeni kampanya için görseller hazır mı?', userId: 'u1', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
          { id: 'm2', text: 'Evet Ali, son revizyonları yapıyorum. Yarın sabah sende olur.', userId: 'u4', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
          { id: 'm3', text: 'Harika, teşekkürler!', userId: 'u1', timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString() },
          { id: 'm4', text: 'Bütçe onayını aldım bu arada, bilginiz olsun.', userId: 'u2', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
          { id: 'm4.5', text: 'Süper haber @AyseFatma, teşekkürler!', userId: 'u1', timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
        ],
      },
      {
        id: 't2',
        name: 'mobil-uygulama-v2',
        members: ['u1', 'u3'],
        messages: [
            { id: 'm5', text: 'Can, v2 için backend servisleri hazır mı?', userId: 'u1', timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
            { id: 'm6', text: 'Login endpoint\'i tamam, ürün listeleme üzerinde çalışıyorum. @AliVeli test edebilirsin.', userId: 'u3', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
        ],
      },
    ];
    const MOCK_PROJECTS: Project[] = [
        { id: 'proj1', customerName: 'Polimer Sanayi Ltd.', materialName: 'HDPE Film', quantity: 5000, price: 6200, currency: 'USD', assignedTo: 'u4', status: ProjectStatus.IN_PROGRESS },
        { id: 'proj2', customerName: 'ABC Plastik A.Ş.', materialName: 'PET Granül', quantity: 2500, price: 92500, currency: 'TRY', assignedTo: 'u2', status: ProjectStatus.DONE },
        { id: 'proj3', customerName: 'Global Polimerler', materialName: 'PP Çuval', quantity: 10000, price: 10500, currency: 'EUR', assignedTo: 'u3', status: ProjectStatus.IN_PROGRESS },
        { id: 'proj4', customerName: 'Teknik Ambalaj', materialName: 'PVC Levha', quantity: 1200, price: 48000, currency: 'TRY', assignedTo: 'u1', status: ProjectStatus.TODO },
    ];
    const MOCK_SHIPMENTS: Shipment[] = [
        { id: 's1', customerName: 'ABC Plastik A.Ş.', product: 'PET Granül', quantityKg: 2500, vehiclePlate: '34 ABC 123', status: ShipmentStatus.DELIVERED, shipmentDate: '2024-07-28' },
        { id: 's2', customerName: 'Polimer Sanayi Ltd.', product: 'HDPE Film', quantityKg: 5000, vehiclePlate: '34 XYZ 789', status: ShipmentStatus.IN_TRANSIT, shipmentDate: '2024-07-29' },
        { id: 's3', customerName: 'Teknik Ambalaj', product: 'PVC Levha', quantityKg: 1200, vehiclePlate: '34 KLM 456', status: ShipmentStatus.IN_TRANSIT, shipmentDate: '2024-07-29' },
        { id: 's4', customerName: 'Global Polimerler', product: 'PP Çuval', quantityKg: 10000, vehiclePlate: '34 DEF 567', status: ShipmentStatus.PENDING, shipmentDate: '2024-07-30' },
    ];

    const batch = writeBatch(db);

    MOCK_USERS.forEach(user => { const { id, ...data } = user; batch.set(doc(db, 'users', id), data); });
    MOCK_TOPICS.forEach(topic => {
        const { id, messages, ...data } = topic;
        batch.set(doc(db, 'topics', id), data);
        messages.forEach(message => {
            const { id: msgId, ...msgData } = message;
            batch.set(doc(db, `topics/${id}/messages`, msgId), { ...msgData, timestamp: Timestamp.fromDate(new Date(msgData.timestamp)) });
        });
    });
    MOCK_PROJECTS.forEach(project => { const { id, ...data } = project; batch.set(doc(db, 'projects', id), { ...data, createdAt: serverTimestamp() }); });
    MOCK_SHIPMENTS.forEach(shipment => { const { id, ...data } = shipment; batch.set(doc(db, 'shipments', id), { ...data, createdAt: serverTimestamp() }); });

    await batch.commit();
    console.log("Database seeded successfully.");
};


const checkAndSeedDatabase = async () => {
    if (hasInitialized) return;

    const usersRef = collection(db, "users");
    const snapshot = await getDocs(query(usersRef));
    if (snapshot.empty) {
        await seedDatabase();
    }
    hasInitialized = true;
};

// --- API FUNCTIONS ---

export const getUsers = async (): Promise<User[]> => {
    const finalSnapshot = await getDocs(collection(db, "users"));
    return finalSnapshot.docs.map(toAppTypes.user);
};

export const getTopics = async (): Promise<Topic[]> => {
    const snapshot = await getDocs(query(collection(db, "topics"), orderBy('name')));
    const topics = snapshot.docs.map(toAppTypes.topic);
    for (const topic of topics) {
        const messagesCol = collection(db, `topics/${topic.id}/messages`);
        const messagesSnapshot = await getDocs(query(messagesCol, orderBy('timestamp', 'asc')));
        topic.messages = messagesSnapshot.docs.map(toAppTypes.message);
    }
    return topics;
};

export const getProjects = async (): Promise<Project[]> => {
    // The query `orderBy('status'), orderBy('customerName')` requires a composite index in Firestore.
    // To fix this without requiring manual console configuration, we fetch with a simple sort
    // and then perform the more complex sort on the client-side.
    const snapshot = await getDocs(query(collection(db, "projects"), orderBy('createdAt', 'desc')));
    const projects = snapshot.docs.map(toAppTypes.project);

    // Client-side sort: by status, then by customer name.
    const statusOrder: Record<ProjectStatus, number> = {
        [ProjectStatus.TODO]: 1,
        [ProjectStatus.IN_PROGRESS]: 2,
        [ProjectStatus.DONE]: 3,
    };

    projects.sort((a, b) => {
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }
        return a.customerName.localeCompare(b.customerName);
    });

    return projects;
};

export const getShipments = async (): Promise<Shipment[]> => {
    const snapshot = await getDocs(query(collection(db, "shipments"), orderBy('shipmentDate', 'desc')));
    return snapshot.docs.map(toAppTypes.shipment);
};


export const initializeAndFetchData = async () => {
    await checkAndSeedDatabase();

    const [usersData, topicsData, projectsData, shipmentsData] = await Promise.all([
        getUsers(),
        getTopics(),
        getProjects(),
        getShipments()
    ]);

    return { usersData, topicsData, projectsData, shipmentsData };
};

export const addMessageToTopic = async (topicId: string, messageText: string, userId: string): Promise<Message> => {
    const messagesCol = collection(db, `topics/${topicId}/messages`);
    const docRef = await addDoc(messagesCol, { text: messageText, userId, timestamp: serverTimestamp() });
    const newDoc = await getDoc(docRef);
    return toAppTypes.message(newDoc);
};

export const addNewProject = async (data: { customerName: string; materialName: string; quantity: number; price: number; currency: Currency; }, currentUserId: string): Promise<Project> => {
    const newProjectData = { ...data, assignedTo: currentUserId, status: ProjectStatus.TODO, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, "projects"), newProjectData);
    return { id: docRef.id, ...data, assignedTo: currentUserId, status: ProjectStatus.TODO };
};

export const addNewTopic = async (name: string, memberIds: string[], currentUser: User): Promise<Topic> => {
    const topicName = name.toLowerCase().replace(/\s+/g, '-');
    const allMemberIds = Array.from(new Set([currentUser.id, ...memberIds]));
    const newTopicData = { name: topicName, members: allMemberIds };
    const topicDocRef = await addDoc(collection(db, "topics"), newTopicData);
    const initialMessage = { text: `${currentUser.name} "${name}" konusunu oluşturdu.`, userId: currentUser.id, timestamp: serverTimestamp() };
    const msgDocRef = await addDoc(collection(db, `topics/${topicDocRef.id}/messages`), initialMessage);
    const newMsgDoc = await getDoc(msgDocRef);

    return {
        id: topicDocRef.id,
        ...newTopicData,
        messages: [toAppTypes.message(newMsgDoc)],
    };
};

export const addNewShipment = async (shipmentData: Omit<Shipment, 'id' | 'status'>): Promise<Shipment> => {
    const newShipmentData = { ...shipmentData, status: ShipmentStatus.PENDING, createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, "shipments"), newShipmentData);
    return { id: docRef.id, ...shipmentData, status: ShipmentStatus.PENDING };
};

export const updateProject = async (projectToUpdate: Project): Promise<Project> => {
    const { id, ...data } = projectToUpdate;
    await updateDoc(doc(db, "projects", id), data);
    return projectToUpdate;
};

export const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus): Promise<Project | null> => {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, { status: newStatus });
    const updatedDoc = await getDoc(projectRef);
    return updatedDoc.exists() ? toAppTypes.project(updatedDoc) : null;
};

export const updateShipment = async (shipmentToUpdate: Shipment): Promise<Shipment> => {
    const { id, ...data } = shipmentToUpdate;
    await updateDoc(doc(db, "shipments", id), data);
    return shipmentToUpdate;
};

export const deleteProjectById = async (projectId: string): Promise<void> => {
    await deleteDoc(doc(db, "projects", projectId));
};

export const deleteShipmentById = async (shipmentId: string): Promise<void> => {
    await deleteDoc(doc(db, "shipments", shipmentId));
};

export const signInUser = async (email: string): Promise<User | null> => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return toAppTypes.user(querySnapshot.docs[0]);
};

export const signUpUser = async (name: string, email: string): Promise<User> => {
    const lowercasedEmail = email.toLowerCase();
    const existingUser = await signInUser(lowercasedEmail);
    if (existingUser) {
        throw new Error("Bu e-posta adresi zaten kullanılıyor.");
    }
    
    const newUserRef = doc(collection(db, "users"));
    
    const newUser: Omit<User, 'id'> = {
        name,
        email: lowercasedEmail,
        avatarUrl: `https://i.pravatar.cc/150?u=${newUserRef.id}`
    };
    await setDoc(newUserRef, newUser);
    return { id: newUserRef.id, ...newUser };
};

export const updateUser = async (userToUpdate: Partial<User> & { id: string }): Promise<User> => {
    const { id, ...data } = userToUpdate;
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, data);
    const updatedDoc = await getDoc(userRef);
    if (!updatedDoc.exists()) {
        throw new Error("Kullanıcı güncellendikten sonra bulunamadı.");
    }
    return toAppTypes.user(updatedDoc);
};