import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post('auth/login', data);
      const { access_token, user } = response.data;
      login(access_token, user);

      if (user.role === 'student') {
        navigate('/access');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      setError('root', { message: 'Email ou senha inválidos' });
    }
  };

  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center py-5"
      style={{
        backgroundColor: 'var(--primary-dark)',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(79, 70, 229, 0.1) 0%, transparent 40%)'
      }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5 col-xl-4">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden fade-in">
              <div className="card-body p-5">
                <div className="text-center mb-5">
                  <div className="bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center rounded-4 mb-4"
                    style={{ width: 64, height: 64 }}>
                    <div className="bg-primary text-white rounded-3 shadow-sm d-flex align-items-center justify-content-center fw-black"
                      style={{ width: 44, height: 44, fontSize: '1.25rem' }}>
                      SM
                    </div>
                  </div>
                  <h2 className="fw-black text-dark mb-2">Seja bem-vindo</h2>
                  <p className="text-muted">Acesse o portal do SpaceManager</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '0.05em' }}>Email</label>
                    <input
                      {...register('email')}
                      type="email"
                      className={`form-control form-control-lg ${errors.email ? 'is-invalid' : 'border-light bg-light'} px-4 py-3 rounded-3 shadow-none`}
                      placeholder="seu@email.com"
                      style={{ fontSize: '0.95rem' }}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '0.05em' }}>Senha</label>
                    <input
                      {...register('password')}
                      type="password"
                      className={`form-control form-control-lg ${errors.password ? 'is-invalid' : 'border-light bg-light'} px-4 py-3 rounded-3 shadow-none`}
                      placeholder="••••••"
                      style={{ fontSize: '0.95rem' }}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                  </div>

                  {errors.root && (
                    <div className="alert alert-danger border-0 rounded-3 mb-4 d-flex align-items-center gap-2 small fw-bold">
                      <LogIn size={16} />
                      {errors.root.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary btn-lg w-100 py-3 rounded-3 fw-black shadow-sm transition-all mt-2"
                  >
                    {isSubmitting ? (
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Processando...</span>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <LogIn size={20} />
                        <span>Entrar na conta</span>
                      </div>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="text-center mt-5">
              <p className="text-white-50 small mb-0">© 2026 SpaceManager. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
