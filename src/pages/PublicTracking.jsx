import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  QrCode,
  Calendar,
  Building2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const PublicTracking = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tickets/public_tracking/`, {
          params: { id: ticketId }
        });
        setTicket(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudo encontrar la orden.');
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) fetchTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto shadow-sm"></div>
          <p className="mt-4 text-gray-500 font-medium animate-pulse">Buscando tu orden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
          <div className="bg-red-50 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-8 border border-red-100">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">¡Ups!</h1>
          <p className="text-gray-600 mb-10 text-lg leading-relaxed">{error}</p>
          <div className="pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium">
              Si crees que esto es un error, por favor contacta al negocio directamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 'RECIBIDO', label: 'Recibido', icon: Package, color: 'indigo' },
    { id: 'EN_PROCESO', label: 'En Proceso', icon: Clock, color: 'blue' },
    { id: 'LISTO', label: 'Listo', icon: CheckCircle, color: 'green' },
    { id: 'ENTREGADO', label: 'Entregado', icon: Truck, color: 'gray' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === ticket.estado);
  const isCancelled = ticket.estado === 'CANCELADO';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-12">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden border border-white/20 backdrop-blur-sm mt-8">
        {/* Header Section */}
        <div className="bg-[#0F172A] p-10 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <QrCode size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
              <p className="text-indigo-300/80 text-[10px] font-black uppercase tracking-[0.2em]">Estado del Servicio</p>
            </div>
            
            <h1 className="text-5xl font-black font-mono leading-none tracking-tighter mb-6 flex items-baseline">
              <span className="text-indigo-400/40 text-2xl mr-1">#</span>
              {ticket.numero_ticket}
            </h1>

            <div className="flex flex-wrap gap-3">
              {isCancelled ? (
                <span className="bg-red-500 text-white px-4 py-1.5 rounded-xl text-xs font-black tracking-wider uppercase shadow-lg shadow-red-500/20 border border-red-400/30">
                  ORDEN CANCELADA
                </span>
              ) : (
                <span className={`
                  px-4 py-1.5 rounded-xl text-xs font-black tracking-wider shadow-lg uppercase border
                  ${ticket.estado === 'LISTO' ? 'bg-emerald-500 text-white border-emerald-400/30 shadow-emerald-500/20' : 
                    ticket.estado === 'ENTREGADO' ? 'bg-slate-700 text-white border-slate-600 shadow-slate-900/20' : 
                    'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20'}
                `}>
                  {steps[currentStepIndex]?.label || ticket.estado}
                </span>
              )}
              
              <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2">
                <Calendar size={14} className="text-indigo-300" />
                <span className="text-indigo-50">Estimado: {new Date(ticket.fecha_prometida).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Tracker Layer */}
        {!isCancelled && (
          <div className="px-10 py-16 bg-white border-b border-slate-50">
             <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-5 left-0 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.4)]" 
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                  ></div>
                </div>

                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center group">
                      <div className={`
                        w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500
                        ${isActive ? 'bg-indigo-600 text-white shadow-xl rotate-0' : 'bg-white text-slate-300 border-2 border-slate-100 rotate-12'}
                        ${isCurrent ? 'ring-8 ring-indigo-50 scale-110 rotate-0' : ''}
                      `}>
                        <Icon size={20} className={isCurrent ? 'animate-bounce-slow' : ''} />
                      </div>
                      <div className="absolute -bottom-8 whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                          {step.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        <div className="p-10 pt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Details Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <div className="h-4 w-1 bg-indigo-600 rounded-full"></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Información</h3>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-slate-50 p-3 rounded-2xl text-slate-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-1">Recibido el</p>
                <p className="text-base font-bold text-slate-900">
                  {new Date(ticket.fecha_recepcion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className={`p-3 rounded-2xl ${ticket.estado === 'LISTO' ? 'bg-emerald-50 text-emerald-600' : ticket.estado === 'ENTREGADO' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {ticket.estado === 'ENTREGADO' ? <CheckCircle size={20} /> : <Clock size={20} />}
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-tighter mb-1 ${ticket.estado === 'LISTO' ? 'text-emerald-400' : ticket.estado === 'ENTREGADO' ? 'text-slate-400' : 'text-indigo-400'}`}>
                  {ticket.estado === 'LISTO' ? 'Listo desde' : 
                   ticket.estado === 'ENTREGADO' ? 'Entregado el' : 
                   'Listo para el'}
                </p>
                <p className={`text-lg font-black ${ticket.estado === 'LISTO' ? 'text-emerald-600' : ticket.estado === 'ENTREGADO' ? 'text-slate-700' : 'text-indigo-600'}`}>
                  {ticket.estado === 'ENTREGADO' && ticket.fecha_entrega ? 
                    new Date(ticket.fecha_entrega).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) :
                    new Date(ticket.fecha_prometida).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                  }
                </p>
                {ticket.estado === 'LISTO' && (
                  <p className="text-xs text-emerald-600/80 font-bold mt-1">
                    Ya puedes acercarte a recoger tus prendas
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <div className="h-4 w-1 bg-indigo-600 rounded-full"></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Servicios</h3>
            </div>
            
            <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
              {ticket.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 transition-all hover:bg-white hover:shadow-md hover:border-indigo-100 group">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 group-hover:text-indigo-900 transition-colors">{item.servicio_nombre}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{item.prenda_nombre}</p>
                      {item.descripcion && (
                        <p className="text-[11px] text-slate-400 mt-1 italic font-medium leading-tight border-l-2 border-slate-100 pl-2">
                          "{item.descripcion}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-lg shadow-slate-900/10">
                    x{item.cantidad}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 p-10 border-t border-slate-100 mt-4">
           <div className="flex flex-col md:flex-row items-center justify-start gap-10">
             {ticket.empresa_logo && (
               <img src={ticket.empresa_logo} alt={ticket.empresa_nombre} className="h-24 object-contain opacity-90 transition-transform hover:scale-105 duration-300" />
             )}
             <p className="text-[14px] text-slate-500 leading-relaxed font-medium text-center md:text-left flex-1">
               Gracias por confiar en <span className="font-extrabold text-slate-900 border-b-2 border-indigo-200">{ticket.empresa_nombre}</span>.<br/>
               <span className="text-xs mt-2 block opacity-70">Si tienes alguna duda escríbenos a nuestro canal oficial.</span>
             </p>
           </div>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all duration-500 cursor-default group">
        <Package className="h-4 w-4 group-hover:text-indigo-600" />
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">
          Washly<span className="text-indigo-600">ERP</span> Professional
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default PublicTracking;
