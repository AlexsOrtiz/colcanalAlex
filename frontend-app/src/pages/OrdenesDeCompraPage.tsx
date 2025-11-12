import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRequisitionsForPurchaseOrders } from '@/services/purchase-orders.service';
import type { Requisition } from '@/services/requisitions.service';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Edit, AlertCircle, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/utils/dateUtils';

// Mapeo de colores de estados
const getStatusColor = (statusCode: string) => {
  const colors: Record<string, string> = {
    cotizada: 'bg-yellow-100 text-yellow-800',
    pendiente_recepcion: 'bg-purple-100 text-purple-800',
    en_orden_compra: 'bg-indigo-100 text-indigo-800',
  };
  return colors[statusCode] || 'bg-gray-100 text-gray-800';
};

export default function OrdenesDeCompraPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Check if user is Compras
  const isCompras = user?.nombreRol === 'Compras';

  useEffect(() => {
    if (!isCompras) {
      navigate('/dashboard');
      return;
    }
    loadRequisitions();
  }, [page, isCompras]);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRequisitionsForPurchaseOrders({ page, limit });
      setRequisitions(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error loading requisitions:', err);
      setError('Error al cargar las requisiciones');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (requisition: Requisition) => {
    navigate(`/dashboard/compras/ordenes/${requisition.requisitionId}/ver`);
  };

  const handleEdit = (requisition: Requisition) => {
    navigate(`/dashboard/compras/ordenes/${requisition.requisitionId}/asignar-precios`);
  };

  if (!isCompras) {
    return null;
  }

  if (loading && requisitions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--canalco-primary))]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--canalco-neutral-100))] to-white">
      {/* Header */}
      <header className="bg-white border-b border-[hsl(var(--canalco-neutral-300))] shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Logo 1 + Back Button */}
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl shadow-md p-3 w-16 h-16 flex items-center justify-center border-2 border-[hsl(var(--canalco-primary))] flex-shrink-0">
                <span className="text-xs font-bold text-[hsl(var(--canalco-neutral-600))]">
                  Logo 1
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/compras')}
                className="hover:bg-[hsl(var(--canalco-neutral-200))]"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            {/* Center: Title */}
            <div className="flex-grow text-center">
              <h1 className="text-xl md:text-2xl font-bold text-[hsl(var(--canalco-neutral-900))]">
                Órdenes de Compra
              </h1>
              <p className="text-xs md:text-sm text-[hsl(var(--canalco-neutral-600))]">
                Asigna precios y genera órdenes de compra para requisiciones cotizadas
              </p>
            </div>

            {/* Right: Logo 2 */}
            <div className="bg-white rounded-xl shadow-md p-3 w-16 h-16 flex items-center justify-center border-2 border-[hsl(var(--canalco-primary))] flex-shrink-0">
              <span className="text-xs font-bold text-[hsl(var(--canalco-neutral-600))]">
                Logo 2
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 p-4 bg-[hsl(var(--canalco-neutral-100))] rounded-lg">
          <p className="text-sm text-[hsl(var(--canalco-neutral-700))]">
            <span className="font-semibold text-[hsl(var(--canalco-primary))]">
              {total}
            </span>{' '}
            requisición(es) cotizada(s) lista(s) para generar órdenes de compra
          </p>
        </div>

        {requisitions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-[hsl(var(--canalco-neutral-200))]">
            <p className="text-lg font-medium text-[hsl(var(--canalco-neutral-700))]">
              No hay requisiciones cotizadas disponibles
            </p>
            <p className="text-sm text-[hsl(var(--canalco-neutral-500))] mt-2">
              Las requisiciones aparecerán aquí cuando estén completamente cotizadas
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[hsl(var(--canalco-neutral-200))] overflow-hidden">
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
                  <TableHead className="font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisitions.map((req) => {
                  // Determinar última actualización según estado
                  const getLastAction = () => {
                    switch (req.status?.code) {
                      case 'cotizada':
                        return { label: 'Cotizada', date: req.quotedAt || req.updatedAt };
                      case 'en_orden_compra':
                        return { label: 'En Orden de Compra', date: req.purchaseOrderDate || req.updatedAt };
                      case 'pendiente_recepcion':
                        return { label: 'Pendiente Recepción', date: req.updatedAt };
                      default:
                        return { label: 'Actualizada', date: req.updatedAt };
                    }
                  };

                  const lastAction = getLastAction();

                  return (
                    <TableRow key={req.requisitionId}>
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
                          {req.project?.name || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(var(--canalco-primary))]/10 text-[hsl(var(--canalco-primary))] text-xs font-semibold">
                            {req.items?.length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-[hsl(var(--canalco-neutral-900))]">
                            {req.user?.name || req.creator?.nombre || 'N/A'}
                          </p>
                          {req.creator?.role && (
                            <p className="text-xs text-[hsl(var(--canalco-neutral-500))]">
                              {req.creator.role?.nombreRol || 'Sin rol'}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs text-[hsl(var(--canalco-neutral-500))]">
                            {lastAction.label}
                          </p>
                          <p className="text-sm text-[hsl(var(--canalco-neutral-700))]">
                            {formatDate(lastAction.date)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            req.status?.code || 'cotizada'
                          )}`}
                        >
                          {req.status?.name || 'Cotizada'}
                        </span>
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
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(req)}
                            className="hover:bg-blue-50"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(req)}
                            className="hover:bg-orange-50"
                            title="Asignar precios"
                          >
                            <Edit className="w-4 h-4 text-orange-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {requisitions.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-[hsl(var(--canalco-neutral-600))]"
            >
              Anterior
            </Button>
            <span className="text-sm text-[hsl(var(--canalco-neutral-600))]">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-[hsl(var(--canalco-neutral-600))]"
            >
              Siguiente
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
