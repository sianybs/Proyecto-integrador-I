/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useState,
} from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem(
      'vetcare_usuario'
    );

    return guardado
      ? JSON.parse(guardado)
      : null;
  });

  async function login(correo, contrasena) {
    const { data } = await axiosClient.post(
      '/auth/login',
      {
        correo,
        contrasena,
      }
    );

    localStorage.setItem(
      'vetcare_token',
      data.token
    );

    localStorage.setItem(
      'vetcare_usuario',
      JSON.stringify(data.usuario)
    );

    setUsuario(data.usuario);

    return data.usuario;
  }

  function logout() {
    localStorage.removeItem('vetcare_token');
    localStorage.removeItem('vetcare_usuario');
    setUsuario(null);
  }

  function actualizarUsuario(nuevosDatos) {
    const usuarioActualizado = {
      ...usuario,
      ...nuevosDatos,
    };

    localStorage.setItem(
      'vetcare_usuario',
      JSON.stringify(usuarioActualizado)
    );

    setUsuario(usuarioActualizado);
  }

  const value = {
    usuario,
    estaLogueado: Boolean(usuario),
    login,
    logout,
    actualizarUsuario,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe usarse dentro de <AuthProvider>'
    );
  }

  return context;
}