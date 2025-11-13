import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getMyPendingReceipts } from '@/services/receipts.service';
import type { RequisitionWithReceipts, FilterReceiptsParams } from '@/services/receipts.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Menu, Edit, AlertCircle, ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateShort } from '@/utils/dateUtils';

// Mapeo de estados a colores
const STATUS_COLORS: Record<string, string> = {
  pendiente_recepcion: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  en_recepcion: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  recepcion_completa: 'bg-green-500/10 text-green-700 border-green-500/20',
};

export default function RecepcionesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requisitions, setRequisitions] = useState<RequisitionWithReceipts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadPendingReceipts();
  }, [page]);

  const loadPendingReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: FilterReceiptsParams = {
        page,
        limit,
      };
      const response = await getMyPendingReceipts(filters);
      setRequisitions(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error loading pending receipts:', err);
      setError('Error al cargar las recepciones pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterReceipt = (requisition: RequisitionWithReceipts) => {
    navigate(`/dashboard/compras/recepciones/${requisition.requisitionId}/registrar`);
  };

  const getStatusLabel = (code: string) => {
    const labels: Record<string, string> = {
      pendiente_recepcion: 'Pendiente de Recepción',
      en_recepcion: 'En Recepción',
      recepcion_completa: 'Recepción Completa',
    };
    return labels[code] || code;
  };

  // Calculate progress for a requisition
  const calculateProgress = (requisition: RequisitionWithReceipts) => {
    if (!requisition.purchaseOrders || requisition.purchaseOrders.length === 0) {
      return { totalItems: 0, receivedItems: 0 };
    }

    let totalItems = 0;
    let receivedItems = 0;

    requisition.purchaseOrders.forEach(po => {
      if (po.items) {
        po.items.forEach(item => {
          totalItems++;
          const quantityOrdered = item.quantityOrdered || item.quantity || 0;
          const quantityReceived = item.quantityReceived || 0;

          // If this item is fully received, count it
          if (quantityReceived >= quantityOrdered) {
            receivedItems++;
          }
        });
      }
    });

    return { totalItems, receivedItems };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--canalco-neutral-100))] to-white">
      {/* Header */}
      <header className="bg-white border-b border-[hsl(var(--canalco-neutral-300))] shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Logo + Navigation */}
            <div className="flex items-center gap-3">
              {/* Logo 1 */}
              <div className="bg-white rounded-xl shadow-md p-3 w-16 h-16 flex items-center justify-center border-2 border-[hsl(var(--canalco-primary))] flex-shrink-0">
                <img
                  src="/assets/images/logo-canalco.png"
                  alt="Canales Contactos"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Home Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="hover:bg-[hsl(var(--canalco-neutral-200))]"
                title="Ir al inicio"
              >
                <Home className="w-5 h-5" />
              </Button>

              {/* Sidebar Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-[hsl(var(--canalco-neutral-200))]"
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Back Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/compras')}
                className="hover:bg-[hsl(var(--canalco-neutral-200))]"
                title="Volver a Compras"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            {/* Center: Title */}
            <div className="flex-grow text-center">
              <h1 className="text-xl md:text-2xl font-bold text-[hsl(var(--canalco-neutral-900))]">
                Gestión de Compras
              </h1>
              <p className="text-xs md:text-sm text-[hsl(var(--canalco-neutral-600))]">
                Recepciones de Materiales
              </p>
            </div>

            {/* Right: Logo 2 */}
            <div className="bg-white rounded-xl shadow-md p-3 w-16 h-16 flex items-center justify-center border-2 border-[hsl(var(--canalco-primary))] flex-shrink-0">
              <img
                src="/assets/images/logo-alumbrado.png"
                alt="Alumbrado Público"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar (Mobile drawer / Desktop sidebar) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[hsl(var(--canalco-neutral-900))] mb-4">
              Módulo de Compras
            </h3>
            <nav className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate('/dashboard/compras/requisiciones');
                  setSidebarOpen(false);
                }}
              >
                Requisiciones
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate('/dashboard/compras/requisiciones/revisar');
                  setSidebarOpen(false);
                }}
              >
                Revisión
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate('/dashboard/compras/cotizaciones');
                  setSidebarOpen(false);
                }}
              >
                Cotizaciones
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate('/dashboard/compras/ordenes');
                  setSidebarOpen(false);
                }}
              >
                Órdenes de Compra
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start bg-[hsl(var(--canalco-primary))]/10"
                onClick={() => {
                  setSidebarOpen(false);
                }}
              >
                Recepciones
              </Button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Message */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Aquí puedes ver y registrar las recepciones de materiales de tus requisiciones con órdenes de compra generadas.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-[hsl(var(--canalco-primary))] border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md border border-[hsl(var(--canalco-neutral-300))] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[hsl(var(--canalco-neutral-100))]">
                    <TableHead className="font-semibold w-[120px]">N° Requisición</TableHead>
                    <TableHead className="font-semibold">Empresa</TableHead>
                    <TableHead className="font-semibold">Proyecto/Obra</TableHead>
                    <TableHead className="font-semibold w-[80px]">Ítems</TableHead>
                    <TableHead className="font-semibold">Creado por</TableHead>
                    <TableHead className="font-semibold">Última Actualización</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Plazo</TableHead>
                    <TableHead className="font-semibold">Progreso</TableHead>
                    <TableHead className="font-semibold text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requisitions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-[hsl(var(--canalco-neutral-600))]">
                        No tienes requisiciones pendientes de recepción.
                      </TableCell>
                    </TableRow>
                  ) : (
                    requisitions.map((req) => {
                      const { totalItems, receivedItems } = calculateProgress(req);

                      // Determinar última actualización según estado
                      const getLastAction = () => {
                        switch (req.status?.code) {
                          case 'pendiente_recepcion':
                            return { label: 'Orden Generada', date: req.purchaseOrderDate || req.updatedAt };
                          case 'en_recepcion':
                            return { label: 'En Recepción', date: req.updatedAt };
                          case 'recepcion_completa':
                            return { label: 'Recepción Completa', date: req.updatedAt };
                          default:
                            return { label: 'Actualizada', date: req.updatedAt };
                        }
                      };

                      const lastAction = getLastAction();

                      return (
                        <TableRow key={req.requisitionId} className="hover:bg-[hsl(var(--canalco-neutral-100))] transition-colors">
                          <TableCell className="font-mono font-semibold text-[hsl(var(--canalco-primary))]">
                            {req.requisitionNumber}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium text-[hsl(var(--canalco-neutral-900))]">
                              {req.company?.name || '-'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-[hsl(var(--canalco-neutral-700))]">
                              {req.obra || req.project?.name || '-'}
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(var(--canalco-primary))]/10 text-[hsl(var(--canalco-primary))] font-semibold text-sm">
                              {totalItems || 0}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-[hsl(var(--canalco-neutral-900))]">
                                {req.creator?.nombre || 'N/A'}
                              </p>
                              <p className="text-xs text-[hsl(var(--canalco-neutral-500))]">
                                {req.creator?.role?.nombreRol || '-'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-xs text-[hsl(var(--canalco-neutral-500))]">
                                {lastAction.label}
                              </p>
                              <p className="text-sm text-[hsl(var(--canalco-neutral-700))]">
                                {formatDateShort(lastAction.date)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${STATUS_COLORS[req.status.code] || 'bg-gray-100'} border`}
                            >
                              {getStatusLabel(req.status.code)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {req.slaDeadline ? (
                              <div className="text-sm flex flex-col gap-0.5">
                                {req.isOverdue ? (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <span className="text-red-600">❌</span>
                                      <span className="text-red-600 font-medium">Vencida</span>
                                    </div>
                                    {req.daysOverdue > 0 && (
                                      <span className="text-xs text-red-500">
                                        Hace {req.daysOverdue} día{req.daysOverdue !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <span className="text-green-600">✅</span>
                                    <span className="text-green-600 font-medium">A tiempo</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-[hsl(var(--canalco-neutral-400))]">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {receivedItems} / {totalItems} ítems
                              </span>
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 transition-all"
                                  style={{
                                    width: `${totalItems > 0 ? (receivedItems / totalItems) * 100 : 0}%`
                                  }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRegisterReceipt(req)}
                                className="hover:bg-orange-50"
                                title="Registrar recepción"
                              >
                                <Edit className="w-4 h-4 text-orange-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-[hsl(var(--canalco-neutral-300))] p-4 flex items-center justify-between">
                <p className="text-sm text-[hsl(var(--canalco-neutral-600))]">
                  Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total} requisiciones
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-[hsl(var(--canalco-neutral-700))]">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
