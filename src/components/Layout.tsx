import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/posts', label: 'Посты' },
  { to: '/users', label: 'Авторы' },
  { to: '/photos', label: 'Медиатека' },
];

export function Layout() {
  return (
    <div className="app">
      <header className="header">
        <span className="header__title">Панель модератора</span>
        <nav className="nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
