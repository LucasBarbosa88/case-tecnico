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
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="card w-full max-w-md bg-[var(--surface)] fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white mx-auto mb-4 text-2xl font-bold">
            SM
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Bem-vindo de volta</h1>
          <p className="text-[var(--text-secondary)] mt-2">Faça login para acessar o sistema</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full p-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="seu@email.com"
            />
            {errors.email && <span className="text-xs text-[var(--error)] mt-1">{errors.email.message}</span>}
          </div>

          <div>
            <label className="label">Senha</label>
            <input
              {...register('password')}
              type="password"
              className="w-full p-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="••••••"
            />
            {errors.password && <span className="text-xs text-[var(--error)] mt-1">{errors.password.message}</span>}
          </div>

          {errors.root && (
            <div className="bg-red-50 text-[var(--error)] text-sm p-3 rounded-lg text-center">
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn size={18} />
                Entrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
