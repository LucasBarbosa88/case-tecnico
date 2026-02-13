import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Environment {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  registration: string;
}

const accessSchema = z.object({
  studentId: z.string().min(1, 'Selecione um aluno'),
  environmentId: z.string().min(1, 'Selecione um ambiente'),
  action: z.enum(['check_in', 'check_out']),
});

type AccessFormData = z.infer<typeof accessSchema>;

const AccessControl: React.FC = () => {
  const { user } = useAuth();
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = useForm<AccessFormData>({
    resolver: zodResolver(accessSchema),
    defaultValues: {
      action: 'check_in',
      studentId: user?.role === 'student' ? user.id : ''
    }
  });

  const selectedAction = watch('action');

  useEffect(() => {
    api.get('environments').then(res => setEnvironments(res.data));
    if (user?.role === 'admin') {
      api.get('students').then(res => setStudents(res.data));
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'student') {
      setValue('studentId', user.id);
    }
  }, [user, setValue]);

  const onSubmit = async (data: AccessFormData) => {
    setMessage(null);
    try {
      await api.post('access-logs', data);
      setMessage({ type: 'success', text: `Registro de ${data.action === 'check_in' ? 'Entrada' : 'Saída'} realizado com sucesso!` });

      if (user?.role === 'student') {
        reset({ ...data, studentId: user.id });
      } else {
        reset({ ...data });
      }

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Erro ao registrar acesso';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="display-6 fw-bold text-dark mb-2">
          {user?.role === 'student' ? 'Registrar Minha Presença' : 'Controle de Acesso'}
        </h2>
        <p className="text-muted">
          {user?.role === 'student'
            ? 'Selecione o ambiente para registrar sua entrada ou saída.'
            : 'Registre a entrada e saída de alunos nos ambientes.'}
        </p>
      </div>

      <div className="card shadow border-0 p-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="btn-group w-100 mb-4 rounded-3 overflow-hidden shadow-sm" role="group">
            <input
              type="radio"
              className="btn-check"
              id="check_in"
              value="check_in"
              {...register('action')}
            />
            <label
              className={`btn py-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${selectedAction === 'check_in' ? 'btn-primary' : 'btn-light text-muted'}`}
              htmlFor="check_in"
            >
              <LogIn size={18} />
              Entrada
            </label>

            <input
              type="radio"
              className="btn-check"
              id="check_out"
              value="check_out"
              {...register('action')}
            />
            <label
              className={`btn py-3 fw-bold d-flex align-items-center justify-content-center gap-2 ${selectedAction === 'check_out' ? 'btn-danger' : 'btn-light text-muted'}`}
              htmlFor="check_out"
            >
              <LogOut size={18} />
              Saída
            </label>
          </div>

          <div className="mb-4">
            {user?.role === 'admin' && (
              <div className="mb-3">
                <label className="form-label fw-bold small text-muted">Aluno</label>
                <select {...register('studentId')} className="form-select form-select-lg border-light bg-light shadow-none">
                  <option value="">Selecione o aluno...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.registration})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-bold small text-muted">Ambiente</label>
              <select {...register('environmentId')} className="form-select form-select-lg border-light bg-light shadow-none">
                <option value="">Selecione o ambiente...</option>
                {environments.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          </div>

          {message && (
            <div className={`alert d-flex align-items-center gap-3 border-0 py-3 rounded-3 mb-4 ${message.type === 'success' ? 'alert-success' : 'alert-danger'
              }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="fw-bold small">{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-lg w-100 py-3 rounded-3 fw-bold shadow-sm transition-all ${selectedAction === 'check_in' ? 'btn-primary' : 'btn-danger'
              }`}
          >
            {isSubmitting ? 'Processando...' : (
              <div className="d-flex align-items-center justify-content-center gap-2">
                {selectedAction === 'check_in' ? <LogIn size={20} /> : <LogOut size={20} />}
                <span>Confirmar {selectedAction === 'check_in' ? 'Entrada' : 'Saída'}</span>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccessControl;
