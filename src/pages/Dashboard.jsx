import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Wallet, TrendingUp, AlertCircle, Activity, 
  CheckCircle, Clock, Zap, Package, ArrowRight, Printer
} from 'lucide-react';

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [operativo, setOperativo] = useState(null);
  const [analitica, setAnalitica] = useState(null);
  const [loading, setLoading] = useState({ kpis: true, op: true, ana: true });
  const [error, setError] = useState(null); // Nuevo estado para errores

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // CORRECCIÓN: Agregamos '/reportes' al inicio de las rutas
        
        // 1. Carga Inmediata: KPIs
        const kpiRes = await api.get('/reportes/dashboard/kpis/');
        setKpis(kpiRes.data);
        setLoading(prev => ({ ...prev, kpis: false }));

        // 2. Carga Secundaria: Operativo
        const opRes = await api.get('/reportes/dashboard/operativo/');
        setOperativo(opRes.data);
        setLoading(prev => ({ ...prev, op: false }));

        // 3. Carga Asíncrona: Analítica
        const anaRes = await api.get('/reportes/dashboard/analitica/');
        setAnalitica(anaRes.data);
        setLoading(prev => ({ ...prev, ana: false }));

      } catch (error) {
        console.error("Error cargando dashboard:", error);
        setError("Error de conexión. Verifica que el servidor esté corriendo.");
        setLoading({ kpis: false, op: false, ana: false });
      }
    };
    fetchData();
  }, []);

  // Función para imprimir/exportar visualmente
  const handlePrint = () => {
    window.print();
  };

  const KpiCard = ({ title, value, subtext, icon: Icon, color, alert }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${alert ? 'border-red-500' : 'border-transparent'} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
          {subtext && <p className="text-sm text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen print:bg-white print:p-0">
      
      {/* HEADER */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
          <p className="text-gray-500">Resumen operativo y financiero</p>
        </div>
        
        {/* BOTÓN EXPORTAR CORREGIDO */}
        <button 
          onClick={handlePrint}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm active:scale-95 transition-transform"
        >
          <Printer className="w-4 h-4" />
          Imprimir Reporte
        </button>
      </div>

      {/* NIVEL 1: SIGNOS VITALES (KPIs) */}
      {!loading.kpis && kpis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title="Caja Actual" 
            value={`S/ ${kpis.kpis.caja_actual.total.toFixed(2)}`} 
            subtext={`Efec: ${kpis.kpis.caja_actual.efectivo} | Dig: ${kpis.kpis.caja_actual.digital}`}
            icon={Wallet} 
            color="bg-emerald-500" 
          />
          <KpiCard 
            title="Ventas Hoy" 
            value={`S/ ${kpis.kpis.ventas_hoy.toFixed(2)}`}
            subtext="Ingresos registrados hoy"
            icon={TrendingUp} 
            color="bg-indigo-500" 
          />
          <KpiCard 
            title="Por Cobrar" 
            value={`S/ ${kpis.kpis.por_cobrar.toFixed(2)}`}
            subtext="Saldo pendiente en tickets"
            icon={AlertCircle} 
            color="bg-amber-500"
            alert={kpis.kpis.por_cobrar > 500} 
          />
          <KpiCard 
            title="En Planta" 
            value={kpis.kpis.carga_operativa}
            subtext="Tickets activos procesándose"
            icon={Activity} 
            color="bg-blue-500" 
          />
        </div>
      ) : (
        <div className="h-32 bg-gray-200 animate-pulse rounded-xl flex items-center justify-center text-gray-400">
           Cargando Signos Vitales...
        </div>
      )}

      {/* NIVEL 2: TABLERO OPERATIVO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline Visual */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm break-inside-avoid">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Flujo de Trabajo
          </h2>
          
          {!loading.op && operativo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recibidos */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-2 opacity-10">
                  <Package className="w-16 h-16 text-blue-600" />
                </div>
                <p className="text-blue-600 font-semibold mb-1">Recibidos</p>
                <p className="text-3xl font-bold text-gray-800">{operativo.pipeline.recibidos}</p>
                <p className="text-xs text-blue-500 mt-2">Por iniciar lavado</p>
              </div>

              {/* En Proceso */}
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-2 opacity-10">
                  <Activity className="w-16 h-16 text-indigo-600" />
                </div>
                <p className="text-indigo-600 font-semibold mb-1">En Proceso</p>
                <p className="text-3xl font-bold text-gray-800">{operativo.pipeline.en_proceso}</p>
                <p className="text-xs text-indigo-500 mt-2">Lavando / Secando</p>
              </div>

              {/* Listos */}
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-2 opacity-10">
                  <CheckCircle className="w-16 h-16 text-emerald-600" />
                </div>
                <p className="text-emerald-600 font-semibold mb-1">Listos</p>
                <p className="text-3xl font-bold text-gray-800">{operativo.pipeline.listos}</p>
                <p className="text-xs text-emerald-500 mt-2">Para entregar</p>
              </div>
            </div>
          ) : (
            <div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
          )}
        </div>

        {/* Panel de Alertas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-50 break-inside-avoid">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Atención Requerida
          </h2>
          {!loading.kpis && kpis ? (
            <div className="space-y-4">
              {kpis.alertas.vencidos > 0 && (
                <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                  <Clock className="w-5 h-5" />
                  <div>
                    <span className="font-bold">{kpis.alertas.vencidos} Tickets</span> Vencidos
                  </div>
                </div>
              )}
              {kpis.alertas.urgentes > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                  <Zap className="w-5 h-5" />
                  <div>
                    <span className="font-bold">{kpis.alertas.urgentes} Tickets</span> Urgentes hoy
                  </div>
                </div>
              )}
              {kpis.alertas.vencidos === 0 && kpis.alertas.urgentes === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Todo en orden</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
          )}
        </div>
      </div>

      {/* NIVEL 3: ANALÍTICA (GRÁFICOS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2">
        
        {/* Gráfico de Ventas */}
        <div className="bg-white p-6 rounded-xl shadow-sm break-inside-avoid">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Tendencia de Ventas (30 días)</h2>
          {!loading.ana && analitica ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analitica.ventas_tendencia}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="fecha" 
                    tickFormatter={(str) => str.slice(8)} 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Venta (S/)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
          )}
        </div>

        {/* Gráfico de Servicios */}
        <div className="bg-white p-6 rounded-xl shadow-sm break-inside-avoid">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Top Servicios</h2>
          {!loading.ana && analitica ? (
            <div className="h-64 flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analitica.top_servicios}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                  >
                    {analitica.top_servicios.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;