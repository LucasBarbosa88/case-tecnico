import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Search } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

interface Student {
  id: string;
  name: string;
  email: string;
  registration: string;
  isActive: boolean;
}

const studentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  registration: z.string().min(1, 'Matrícula é obrigatória'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
});

type StudentFormData = z.infer<typeof studentSchema>;

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const fetchStudents = async () => {
    try {
      const response = await api.get('students');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (editingStudent) {
        const updateData = { ...data };
        if (!updateData.password) delete updateData.password;

        await api.patch(`students/${editingStudent.id}`, updateData);
      } else {
        await api.post('students', data);
      }
      handleModalClose();
      fetchStudents();
    } catch (error) {
      console.error('Failed to save student', error);
    }
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setValue('name', student.name);
    setValue('email', student.email);
    setValue('registration', student.registration);
    setValue('password', '');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    reset({
      name: '',
      email: '',
      registration: '',
      password: ''
    });
  };

  const handleDeleteClick = (id: string) => {
    setStudentToDelete(id);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        await api.delete(`students/${studentToDelete}`);
        setStudentToDelete(null);
        fetchStudents();
      } catch (error) {
        console.error('Failed to delete student', error);
      }
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration.includes(searchTerm)
  );

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <h2 className="display-6 fw-bold text-dark mb-0">Gerenciar Alunos</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm fw-bold"
        >
          <Plus size={20} />
          <span>Novo Aluno</span>
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-lg-6">
          <div className="input-group input-group-lg shadow-sm border rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-0 text-muted">
              <Search size={20} />
            </span>
            <input
              type="text"
              placeholder="Buscar por nome ou matrícula..."
              className="form-control border-0 shadow-none ps-0"
              style={{ fontSize: '1rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th className="px-4">Nome</th>
                <th>Email</th>
                <th>Matrícula</th>
                <th className="text-end px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-5 text-center text-muted fw-medium">
                    Nenhum aluno encontrado
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-4 fw-bold text-dark">{student.name}</td>
                    <td className="text-muted">{student.email}</td>
                    <td>
                      <span className="badge-pill bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '0.7rem' }}>
                        {student.registration}
                      </span>
                    </td>
                    <td className="text-end px-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => handleEditClick(student)}
                          className="btn btn-light btn-sm text-primary rounded-3"
                          style={{ padding: '0.6rem' }}
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student.id)}
                          className="btn btn-light btn-sm text-danger rounded-3"
                          style={{ padding: '0.6rem' }}
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleModalClose} title={editingStudent ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-muted">Nome Completo</label>
            <input {...register('name')} className={`form-control ${errors.name ? 'is-invalid' : 'border-light bg-light'} p-3 rounded-3`} placeholder="Ex: João da Silva" />
            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-muted">Email</label>
            <input {...register('email')} type="email" className={`form-control ${errors.email ? 'is-invalid' : 'border-light bg-light'} p-3 rounded-3`} placeholder="Ex: joao@email.com" />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6">
              <label className="form-label small fw-bold text-muted">Matrícula</label>
              <input {...register('registration')} className={`form-control ${errors.registration ? 'is-invalid' : 'border-light bg-light'} p-3 rounded-3`} placeholder="Ex: 20240001" />
              {errors.registration && <div className="invalid-feedback">{errors.registration.message}</div>}
            </div>
            <div className="col-6">
              <label className="form-label small fw-bold text-muted">Senha {editingStudent && '(opcional)'}</label>
              <input {...register('password')} type="password" className={`form-control ${errors.password ? 'is-invalid' : 'border-light bg-light'} p-3 rounded-3`} placeholder={editingStudent ? "Deixe em branco para manter" : "••••••"} />
              {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-4 border-top">
            <button type="button" onClick={handleModalClose} className="btn btn-light px-4 py-2 rounded-3 fw-bold">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary px-4 py-2 rounded-3 shadow-sm fw-bold">
              {isSubmitting ? 'Salvando...' : (editingStudent ? 'Atualizar Aluno' : 'Salvar Aluno')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        title="Confirmar Exclusão"
      >
        <div className="text-center py-3">
          <div className="mb-4 text-warning">
            <Trash2 size={48} className="mx-auto text-danger opacity-50" />
          </div>
          <p className="text-secondary mb-4">
            Tem certeza que deseja excluir este aluno? <br />
            <span className="small text-muted">Esta ação não pode ser desfeita.</span>
          </p>
          <div className="d-flex justify-content-center gap-2">
            <button
              onClick={() => setStudentToDelete(null)}
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

export default Students;
