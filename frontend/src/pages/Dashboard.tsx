import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Building, Activity } from 'lucide-react';

interface OccupationData {
  environmentId: string;
  name: string;
  type: string;
  capacity: number;
  currentOccupancy: number;
  occupationRate: number;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<OccupationData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOccupation = async () => {
    try {
      const response = await api.get('dashboard/occupation');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch occupation data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupation();
    const interval = setInterval(fetchOccupation, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const totalStudents = data.reduce((acc, curr) => acc + curr.currentOccupancy, 0);
  const totalCapacity = data.reduce((acc, curr) => acc + curr.capacity, 0);
  const overallRate = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;

  if (loading && data.length === 0) {
    return <div className="flex h-full items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="display-6 fw-bold mb-0 text-dark">Dashboard de Ocupação</h2>
        <button onClick={fetchOccupation} className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-bold">
          <Activity size={16} />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card h-100 p-4 border-0 shadow-sm border-start border-primary border-5">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                <Users size={24} />
              </div>
              <div>
                <p className="text-muted small fw-bold text-uppercase mb-0" style={{ letterSpacing: '0.05em' }}>Alunos Presentes</p>
                <h3 className="mb-0 fw-bold">{totalStudents}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 p-4 border-0 shadow-sm border-start border-success border-5">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                <Building size={24} />
              </div>
              <div>
                <p className="text-muted small fw-bold text-uppercase mb-0" style={{ letterSpacing: '0.05em' }}>Capacidade Total</p>
                <h3 className="mb-0 fw-bold">{totalCapacity}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 p-4 border-0 shadow-sm border-start border-info border-5">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-muted small fw-bold text-uppercase mb-0" style={{ letterSpacing: '0.05em' }}>Taxa de Ocupação</p>
                <h3 className="mb-0 fw-bold">{overallRate.toFixed(1)}%</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 h-100">
        <div className="d-flex align-items-center gap-2 mb-4">
          <Building size={20} className="text-primary" />
          <h5 className="fw-bold mb-0">Detalhes por Ambiente</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Ambiente</th>
                <th>Capacidade</th>
                <th>Ocupação Atual</th>
                <th className="text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                let badgeClass = 'bg-success';
                if (item.occupationRate > 90) badgeClass = 'bg-danger';
                else if (item.occupationRate > 70) badgeClass = 'bg-warning text-dark';

                return (
                  <tr key={item.environmentId}>
                    <td>
                      <div className="fw-bold text-dark">{item.name}</div>
                      <div className="text-muted small">{item.type}</div>
                    </td>
                    <td className="text-muted">{item.capacity} pessoas</td>
                    <td className="text-muted">{item.currentOccupancy} pessoas</td>
                    <td className="text-end">
                      <span className={`badge rounded-pill ${badgeClass}`} style={{ fontSize: '0.75rem', padding: '0.5rem 0.8rem' }}>
                        {item.occupationRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
