import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { History as HistoryIcon, User, MapPin, Clock } from 'lucide-react';

interface AccessLog {
  id: string;
  checkIn: string;
  checkOut: string | null;
  user: {
    name: string;
    registration: string;
  };
  environment: {
    name: string;
  };
}

const History: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await api.get('access-logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch access logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="display-6 fw-bold text-dark mb-0 d-flex align-items-center gap-3">
          <HistoryIcon size={32} className="text-primary" />
          <span>{user?.role === 'student' ? 'Meu Histórico' : 'Histórico de Acessos'}</span>
        </h2>
      </div>

      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                {user?.role === 'admin' && <th className="px-4">Aluno</th>}
                <th className={user?.role === 'admin' ? '' : 'px-4'}>Ambiente</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th className="text-end px-4">Duração</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 5 : 4} className="p-5 text-center text-muted fw-medium">
                    Nenhum registro de acesso encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const checkIn = new Date(log.checkIn);
                  const checkOut = log.checkOut ? new Date(log.checkOut) : null;
                  let duration = '-';

                  if (checkOut) {
                    const diffMs = checkOut.getTime() - checkIn.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const hours = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;
                    duration = `${hours}h ${mins}m`;
                  }

                  return (
                    <tr key={log.id}>
                      {user?.role === 'admin' && (
                        <td className="px-4">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-light rounded-3 p-2 text-muted">
                              <User size={18} />
                            </div>
                            <div>
                              <div className="fw-bold text-dark mb-0">{log.user?.name || 'Usuário Removido'}</div>
                              <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>{log.user?.registration || '-'}</div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className={user?.role === 'admin' ? '' : 'px-4'}>
                        <div className="d-flex align-items-center gap-2 fw-medium text-dark">
                          <MapPin size={16} className="text-primary opacity-50" />
                          {log.environment?.name || 'Ambiente Removido'}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2 text-muted small fw-bold">
                          <Clock size={16} className="text-success opacity-50" />
                          {formatDate(log.checkIn)}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {log.checkOut ? (
                            <>
                              <Clock size={16} className="text-danger opacity-50" />
                              <span className="text-muted small fw-bold">{formatDate(log.checkOut)}</span>
                            </>
                          ) : (
                            <span className="badge rounded-pill bg-warning text-dark py-1 px-3 shadow-sm" style={{ fontSize: '0.7rem' }}>
                              Em andamento
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-end px-4">
                        <span className={`fw-bold ${duration === '-' ? 'text-light' : 'text-dark'}`} style={{ fontSize: '0.85rem' }}>
                          {duration}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
