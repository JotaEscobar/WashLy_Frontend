import React from 'react';
import {
    Plus, Search, Eye, Clock, X, AlertTriangle, CheckCircle, Trash2, Wallet, ArrowRight, DollarSign, MapPin, Printer, ChevronLeft, ChevronRight, User, AlertCircle, Lock, Ban, Truck, MessageSquare
} from 'lucide-react';



export const TicketFilters = ({ searchTerm, setSearchTerm, dateFrom, setDateFrom, dateTo, setDateTo, statusFilter, setStatusFilter }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
        </div>
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent text-sm outline-none dark:text-gray-300 p-1" />
            <ArrowRight size={14} className="text-gray-400" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent text-sm outline-none dark:text-gray-300 p-1" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium dark:text-white">
            <option value="">Todos los Estados</option>
            <option value="RECIBIDO">Recibido</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="LISTO">Listo</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
        </select>
    </div>

);
