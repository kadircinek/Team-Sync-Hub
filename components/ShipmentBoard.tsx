import React, { useState, useMemo } from 'react';
import type { Shipment } from '../types';
import { ShipmentStatus } from '../types';
import { PlusIcon, TruckIcon, PencilIcon, CheckIcon, XMarkIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from './icons';

interface ShipmentBoardProps {
  shipments: Shipment[];
  onAddShipment: (data: Omit<Shipment, 'id' | 'status'>) => void;
  onUpdateShipment: (shipment: Shipment) => void;
  onDeleteShipment: (shipmentId: string) => void;
}

type SortableKeys = keyof Shipment;

const ShipmentBoard: React.FC<ShipmentBoardProps> = ({ shipments, onAddShipment, onUpdateShipment, onDeleteShipment }) => {
  // Add form state
  const [isAdding, setIsAdding] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [shipmentDate, setShipmentDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit form state
  const [editingShipmentId, setEditingShipmentId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Shipment | null>(null);
  
  // Filtering state
  const [filterText, setFilterText] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' }>({
    key: 'shipmentDate',
    direction: 'descending'
  });

  const processedShipments = useMemo(() => {
    let filteredItems = [...shipments];

    // Filtering logic
    if (filterText) {
        const lowercasedFilter = filterText.toLowerCase();
        filteredItems = filteredItems.filter(
            (item) =>
                item.customerName.toLowerCase().includes(lowercasedFilter) ||
                item.product.toLowerCase().includes(lowercasedFilter)
        );
    }
    if (filterDate) {
        filteredItems = filteredItems.filter((item) => item.shipmentDate === filterDate);
    }
    if (filterStatus) {
        filteredItems = filteredItems.filter((item) => item.status === filterStatus);
    }

    // Sorting logic
    const { key, direction } = sortConfig;
    filteredItems.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        let comparison = 0;

        if (typeof valA === 'number' && typeof valB === 'number') {
            comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
            comparison = valA.localeCompare(valB, 'tr', { sensitivity: 'base' });
        }
        
        return direction === 'ascending' ? comparison : -comparison;
    });

    return filteredItems;
  }, [shipments, filterText, filterDate, filterStatus, sortConfig]);

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName.trim() && product.trim() && quantity.trim() && vehiclePlate.trim() && shipmentDate) {
      onAddShipment({
        customerName: customerName.trim(),
        product: product.trim(),
        quantityKg: parseInt(quantity, 10),
        vehiclePlate: vehiclePlate.trim().toUpperCase(),
        shipmentDate: shipmentDate,
      });
      // Reset form
      setIsAdding(false);
      setCustomerName('');
      setProduct('');
      setQuantity('');
      setVehiclePlate('');
      setShipmentDate(new Date().toISOString().split('T')[0]);
    }
  };
  
  const statusStyles: Record<ShipmentStatus, string> = {
    [ShipmentStatus.PENDING]: 'bg-yellow-500/20 text-yellow-300 ring-yellow-500/30',
    [ShipmentStatus.IN_TRANSIT]: 'bg-sky-500/20 text-sky-300 ring-sky-500/30',
    [ShipmentStatus.DELIVERED]: 'bg-green-500/20 text-green-300 ring-green-500/30',
  };

  const handleStartEdit = (shipment: Shipment) => {
    setEditingShipmentId(shipment.id);
    setEditedData({ ...shipment });
  };

  const handleCancelEdit = () => {
    setEditingShipmentId(null);
    setEditedData(null);
  };

  const handleSaveEdit = () => {
    if (editedData) {
        onUpdateShipment(editedData);
        handleCancelEdit();
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editedData) return;
    const { name, value } = e.target;
    setEditedData({
        ...editedData,
        [name]: name === 'quantityKg' ? parseInt(value, 10) || 0 : value,
    });
  };

  const handleClearFilters = () => {
    setFilterText('');
    setFilterDate('');
    setFilterStatus('');
  }

  const SortableHeader: React.FC<{ sortKey: SortableKeys, title: string, className?: string }> = ({ sortKey, title, className }) => (
    <th scope="col" className={`px-6 py-3 ${className}`}>
        <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 group whitespace-nowrap">
            {title}
            <span className={sortConfig.key === sortKey ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}>
                {sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
            </span>
        </button>
    </th>
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-900 h-full p-6 text-white overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
            <TruckIcon className="h-7 w-7 text-slate-400" />
            Günlük Sevkiyatlar
        </h1>
        {!isAdding && (
            <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors">
                <PlusIcon className="h-5 w-5"/>
                Yeni Sevkiyat
            </button>
        )}
      </div>

      {isAdding && (
          <form onSubmit={handleAddSubmit} className="bg-slate-800 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 border border-slate-700">
            {/* Form Fields */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Müşteri Adı</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="ABC Plastik A.Ş." className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Ürün Cinsi</label>
                <input type="text" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="PET Granül" className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Miktar (kg)</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="2500" className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Araç Plakası</label>
                <input type="text" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} placeholder="34 ABC 123" className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tarih</label>
                <input type="date" value={shipmentDate} onChange={(e) => setShipmentDate(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
            </div>
            {/* Action Buttons */}
            <div className="flex items-end gap-2">
                <button type="submit" className="w-full px-4 py-2 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors">Ekle</button>
                <button type="button" onClick={() => setIsAdding(false)} className="w-full px-4 py-2 rounded-md bg-slate-600 text-white font-medium hover:bg-slate-500 transition-colors">İptal</button>
            </div>
          </form>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-800 p-4 rounded-lg mb-6 flex items-end gap-4 border border-slate-700">
        <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-slate-300 mb-1">Müşteri / Ürün Ara</label>
            <input type="text" value={filterText} onChange={(e) => setFilterText(e.target.value)} placeholder="Arama..." className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tarih</label>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Durum</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Tümü</option>
                {Object.values(ShipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
        <div>
            <button onClick={handleClearFilters} className="px-4 py-2 rounded-md bg-slate-600 text-white font-medium hover:bg-slate-500 transition-colors">Temizle</button>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="flex-1 bg-slate-800/50 rounded-lg p-1 overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800">
                <tr>
                    <SortableHeader sortKey="customerName" title="Müşteri" />
                    <SortableHeader sortKey="product" title="Ürün" />
                    <SortableHeader sortKey="quantityKg" title="Miktar (kg)" className="text-right" />
                    <SortableHeader sortKey="vehiclePlate" title="Plaka" />
                    <SortableHeader sortKey="shipmentDate" title="Tarih" />
                    <SortableHeader sortKey="status" title="Durum" />
                    <th scope="col" className="px-6 py-3 text-center">Eylemler</th>
                </tr>
            </thead>
            <tbody>
                {processedShipments.map(shipment => (
                    <tr key={shipment.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        {editingShipmentId === shipment.id ? (
                          <>
                            <td className="px-6 py-2"><input type="text" name="customerName" value={editedData?.customerName} onChange={handleEditChange} className="w-full bg-slate-600 rounded-md p-1"/></td>
                            <td className="px-6 py-2"><input type="text" name="product" value={editedData?.product} onChange={handleEditChange} className="w-full bg-slate-600 rounded-md p-1"/></td>
                            <td className="px-6 py-2"><input type="number" name="quantityKg" value={editedData?.quantityKg} onChange={handleEditChange} className="w-full bg-slate-600 rounded-md p-1 text-right"/></td>
                            <td className="px-6 py-2"><input type="text" name="vehiclePlate" value={editedData?.vehiclePlate} onChange={handleEditChange} className="w-full bg-slate-600 rounded-md p-1"/></td>
                            <td className="px-6 py-2"><input type="date" name="shipmentDate" value={editedData?.shipmentDate} onChange={handleEditChange} className="w-full bg-slate-600 rounded-md p-1"/></td>
                            <td className="px-6 py-2">
                                <select 
                                    name="status"
                                    value={editedData?.status}
                                    onChange={handleEditChange}
                                    className={`w-full bg-slate-600 rounded-md p-1 text-xs font-semibold ${statusStyles[editedData!.status]}`}
                                >
                                    {Object.values(ShipmentStatus).map(status => (
                                        <option key={status} value={status} className="bg-slate-800 text-white">{status}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-4">
                                    <button onClick={handleSaveEdit} className="text-green-400 hover:text-green-300"><CheckIcon className="h-5 w-5"/></button>
                                    <button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300"><XMarkIcon className="h-5 w-5"/></button>
                                </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{shipment.customerName}</th>
                            <td className="px-6 py-4">{shipment.product}</td>
                            <td className="px-6 py-4 text-right font-mono">{shipment.quantityKg.toLocaleString('tr-TR')}</td>
                            <td className="px-6 py-4 font-mono">{shipment.vehiclePlate}</td>
                            <td className="px-6 py-4">{new Date(shipment.shipmentDate + 'T00:00:00').toLocaleDateString('tr-TR')}</td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 text-xs font-bold rounded-full ring-1 ${statusStyles[shipment.status]}`}>
                                    {shipment.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-4">
                                    <button onClick={() => handleStartEdit(shipment)} className="text-sky-400 hover:text-sky-300"><PencilIcon className="h-5 w-5"/></button>
                                    <button onClick={() => {
                                        if (window.confirm('Bu sevkiyatı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
                                            onDeleteShipment(shipment.id);
                                        }
                                    }} className="text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            </td>
                          </>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
        {processedShipments.length === 0 && (
            <div className="text-center py-10 text-slate-500">
                <p>Filtre kriterlerinize uygun sevkiyat bulunamadı.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentBoard;