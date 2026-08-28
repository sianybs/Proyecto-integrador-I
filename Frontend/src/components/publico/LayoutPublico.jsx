import { Outlet } from 'react-router-dom';
import NavbarPublico from './NavbarPublico';
import FooterPublico from './FooterPublico';
import '../../pages/publico/publico.css';

export default function LayoutPublico() {
  return (
    <div className="sitio-publico">
      <NavbarPublico />
      <main className="contenido-publico">
        <Outlet />
      </main>
      <FooterPublico />
    </div>
  );
}
