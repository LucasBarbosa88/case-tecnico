import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, MapPin, LogOut, Clock, History } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { path: '/students', label: 'Alunos', icon: Users, roles: ['admin'] },
    { path: '/environments', label: 'Ambientes', icon: MapPin, roles: ['admin'] },
    { path: '/access', label: 'Registro de Acesso', icon: Clock, roles: ['admin', 'student'] },
    { path: '/history', label: 'Histórico', icon: History, roles: ['admin', 'student'] },
  ].filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="d-flex">
      <aside className="sidebar shadow-lg">
        <div className="sidebar-brand">
          <div className="bg-primary p-2 rounded-3 shadow-sm">
            <LayoutDashboard size={24} color="white" />
          </div>
          <span>SpaceManager</span>
        </div>

        <div className="px-4 py-2 mt-2">
          <small className="text-uppercase fw-bold text-white-50" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            Menu Principal
          </small>
        </div>

        <nav className="nav flex-column flex-grow-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-top border-white-10">
          <div className="d-flex align-items-center gap-3 mb-4 px-2">
            <div className="bg-primary rounded-3 p-1 d-flex align-items-center justify-center fw-bold" style={{ width: 40, height: 40 }}>
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="mb-0 small fw-bold text-truncate">{user?.name}</p>
              <p className="mb-0 text-white-50 text-uppercase fw-bold text-truncate" style={{ fontSize: '0.6rem' }}>{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm w-100 border-0 rounded-3 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
            style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      <main className="main-content flex-grow-1">
        <div className="fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
