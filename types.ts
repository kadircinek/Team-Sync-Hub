export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  userId: string;
}

export interface Topic {
  id: string;
  name: string;
  members: string[]; // array of user ids
  messages: Message[];
}

export enum ProjectStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Project {
  id: string;
  customerName: string;
  materialName: string;
  quantity: number; // kg
  price: number;
  currency: Currency;
  assignedTo: string; // user id
  status: ProjectStatus;
}

export enum ShipmentStatus {
  PENDING = 'Beklemede',
  IN_TRANSIT = 'Yolda',
  DELIVERED = 'Teslim Edildi',
}

export interface Shipment {
    id: string;
    customerName: string;
    product: string;
    quantityKg: number;
    vehiclePlate: string;
    status: ShipmentStatus;
    shipmentDate: string; // YYYY-MM-DD format
}