import { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import ProductoForm from './components/ProductoForm';
import ProductoList from './components/ProductoList';
import { escucharSesion, logout, obtenerToken } from './services/authService';
import { actualizarProducto, crearProducto, eliminarProducto, obtenerProductos } from './services/productosService';
import './styles.css';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cancelar = escucharSesion((user) => setUsuario(user));
    return () => cancelar();
  }, []);

  const cargarProductos = async () => {
    try {
      setMensaje('Cargando productos...');
      const token = await obtenerToken();
      if (!token) {
        setMensaje('Debes iniciar sesión');
        return;
      }
      const data = await obtenerProductos();
      setProductos(data);
      setMensaje('');
    } catch (error) {
      setMensaje(error.message);
    }
  };

  useEffect(() => {
    const cargarSiHayToken = async () => {
      if (usuario) {
        const token = await obtenerToken();
        if (token) {
          await cargarProductos();
        }
      } else {
        setProductos([]);
      }
    };
    cargarSiHayToken();
  }, [usuario]);

  const manejarCrear = async (producto) => {
    try {
      await crearProducto(producto);
      await cargarProductos();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const manejarEliminar = async (id) => {
    if (!confirm('¿Eliminar producto?')) return;
    await eliminarProducto(id);
    await cargarProductos();
  };

  const manejarActualizar = async (id, cambios) => {
    await actualizarProducto(id, cambios);
    await cargarProductos();
  };

  return (
    <main>
      <header className="hero">
        <h1>Firebase Auth + Firestore</h1>
        <p>Ejercicio fullstack con formulario de usuario y clave.</p>
      </header>

      {!usuario ? (
        <LoginForm />
      ) : (
        <>
          <section className="card session-card">
            <p><strong>Usuario:</strong> {usuario.email}</p>
            <div className="row">
              <button onClick={cargarProductos}>Recargar</button>
              <button className="danger" onClick={logout}>Cerrar sesión</button>
            </div>
          </section>
          {mensaje && <p className="message">{mensaje}</p>}
          <ProductoForm onCrear={manejarCrear} />
          <ProductoList
            productos={productos}
            onEliminar={manejarEliminar}
            onActualizar={manejarActualizar}
          />
        </>
      )}
    </main>
  );
}
