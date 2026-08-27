import { createContext, useContext, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('vetcare_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  // usuario tiene la forma: { id, nombre, correo, rol }
  // rol puede ser: 'Administrador', 'Veterinario', 'Recepcionista',
  // 'Encargado del Refugio', u otro segun RolEmpleado, o 'Cliente'.

  async function login(correo, contrasena) {
    const { data } = await axiosClient.post('/auth/login', { correo, contrasena });
    localStorage.setItem('vetcare_token', data.token);
    localStorage.setItem('vetcare_usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data.usuario;
  }

  function logout() {
    localStorage.removeItem('vetcare_token');
    localStorage.removeItem('vetcare_usuario');
    setUsuario(null);
  }

  const value = {
    usuario,
    estaLogueado: !!usuario,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para usar la sesion desde cualquier componente:
// const { usuario, login, logout, estaLogueado } = useAuth();
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
