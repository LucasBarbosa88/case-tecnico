import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, MapPin } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

interface Environment {
  id: string;
  name: string;
  type: string;
  capacity: number;
}

const environmentSchema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  type: z.enum(['classroom', 'laboratory', 'study_room']),
  capacity: z.number().min(1, 'Capacidade deve ser maior que 0'),
  description: z.string().optional(),
});

type EnvironmentFormData = z.infer<typeof environmentSchema>;

const Environments: React.FC = () => {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [environmentToDelete, setEnvironmentToDelete] = useState<string | null>(null);
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<EnvironmentFormData>({
    resolver: zodResolver(environmentSchema),
  });

  const fetchEnvironments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('environments');
      setEnvironments(response.data);
    } catch (error) {
      console.error('Failed to fetch environments', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvironments();
  }, []);

  const onSubmit = async (data: EnvironmentFormData) => {
    try {
      if (editingEnvironment) {
        await api.patch(`environments/${editingEnvironment.id}`, data);
      } else {
        await api.post('environments', data);
      }
      handleModalClose();
      fetchEnvironments();
    } catch (error) {
      console.error('Failed to save environment', error);
    }
  };

  const handleEditClick = (env: any) => {
    setEditingEnvironment(env);
    setValue('name', env.name);
    setValue('type', env.type as any);
    setValue('capacity', env.capacity);
    setValue('description', env.description || '');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEnvironment(null);
    reset({
      name: '',
      type: 'classroom',
      capacity: 1,
      description: ''
    });
  };

  const handleDeleteClick = (id: string) => {
    setEnvironmentToDelete(id);
  };

  const confirmDelete = async () => {
    if (environmentToDelete) {
      try {
        await api.delete(`environments/${environmentToDelete}`);
        setEnvironmentToDelete(null);
        fetchEnvironments();
      } catch (error) {
        console.error('Failed to delete environment', error);
      }
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      classroom: 'Sala de Aula',
      laboratory: 'Laboratório',
      study_room: 'Sala de Estudos',
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <h2 className="display-6 fw-bold text-dark mb-0">Ambientes de Ensino</h2>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm fw-bold">
          <Plus size={20} /> Novo Ambiente
        </button>
      </div>

      <div className="row g-4">
        {environments.map((env) => (
          <div key={env.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 hover-shadow transition-all">
              <div className="card-body">
                <div className="d-flex justify-content-between items-start mb-3">
                  <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                    <MapPin size={24} />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleEditClick(env)}
                      className="btn btn-light btn-sm text-primary rounded-3"
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(env.id)}
                      className="btn btn-light btn-sm text-danger rounded-3"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="h5 fw-bold mb-1 text-dark">{env.name}</h3>
                <p className="text-muted small mb-3">{getTypeLabel(env.type)}</p>

                <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top">
                  <span className="text-muted small">Capacidade:</span>
                  <span className="badge bg-light text-dark border fw-semibold px-3 py-2 rounded-pill">
                    {env.capacity} Pessoas
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {environments.length === 0 && (
          <div className="col-12 text-center py-5 text-muted border border-2 border-dashed rounded-3">
            Nenhum ambiente cadastrado.
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleModalClose} title={editingEnvironment ? 'Editar Ambiente' : 'Novo Ambiente'}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-muted">Nome do Ambiente</label>
            <input
              {...register('name')}
              className={`form-control ${errors.name ? 'is-invalid' : 'border-light bg-light'} p-3 rounded-3`}
              placeholder="Ex: Laboratório de Informática 1"
            />
            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label small fw-bold text-muted">Tipo</label>
              <select
                {...register('type')}
                className={`form-select ${errors.type ? 'is-invalid' : 'border-light bg-light'} p-3 rounded-3`}
              >
                <option value="classroom">Sala de Aula</option>
                <option value="laboratory">Laboratório</option>
                <option value="study_room">Sala de Estudos</option>
              </select>
              {errors.type && <div className="invalid-feedback">{errors.type.message}</div>}
            </div>
            <div className="col-6">
              <label className="form-label small fw-bold text-muted">Capacidade</label>
              <input
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                className={`form-control ${errors.capacity ? 'is-invalid' : 'border-light bg-light'} p-3 rounded-3`}
                placeholder="Ex: 40"
              />
              {errors.capacity && <div className="invalid-feedback">{errors.capacity.message}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-muted">Descrição (Opcional)</label>
            <textarea
              {...register('description')}
              className="form-control border-light bg-light p-3 rounded-3"
              rows={3}
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-4 border-top">
            <button type="button" onClick={handleModalClose} className="btn btn-light px-4 py-2 rounded-3 fw-bold">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary px-4 py-2 rounded-3 shadow-sm fw-bold">
              {isSubmitting ? 'Salvando...' : (editingEnvironment ? 'Atualizar' : 'Salvar')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!environmentToDelete}
        onClose={() => setEnvironmentToDelete(null)}
        title="Confirmar Exclusão"
      >
        <div className="text-center py-3">
          <div className="mb-4 text-warning">
            <Trash2 size={48} className="mx-auto text-danger opacity-50" />
          </div>
          <p className="text-secondary mb-4">
            Tem certeza que deseja excluir este ambiente? <br />
            <span className="small text-muted">Esta ação não pode ser desfeita.</span>
          </p>
          <div className="d-flex justify-content-center gap-2">
            <button
              onClick={() => setEnvironmentToDelete(null)}
              className="btn btn-light px-4 py-2 rounded-3 fw-bold"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="btn btn-danger px-4 py-2 rounded-3 shadow-sm fw-bold"
            >
              Sim, Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Environments;
