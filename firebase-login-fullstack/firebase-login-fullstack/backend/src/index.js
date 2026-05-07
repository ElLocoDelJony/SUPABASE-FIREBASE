// index.js
require("dotenv").config(); // carga las variables de entorno desde backend/.env
const express = require("express");
const cors = require("cors");
const { db } = require("./firebaseAdmin"); // exporta Firestore desde firebaseAdmin.js
const verificarFirebaseToken = require("./authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "API Firebase funcionando" });
});

// Perfil del usuario autenticado
app.get("/api/perfil", verificarFirebaseToken, (req, res) => {
  res.json({ uid: req.usuario.uid, email: req.usuario.email });
});

// Listar productos del usuario
app.get("/api/productos", verificarFirebaseToken, async (req, res) => {
  try {
    const snapshot = await db
      .collection("productos")
      .where("uid", "==", req.usuario.uid)
      .get();

    const productos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(productos);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al listar productos", detalle: error.message });
  }
});

// Crear producto
app.post("/api/productos", verificarFirebaseToken, async (req, res) => {
  try {
    const { nombre, categoria, precio, stock } = req.body;

    if (!nombre || !categoria || precio === undefined || stock === undefined) {
      return res
        .status(400)
        .json({
          mensaje: "Nombre, categoría, precio y stock son obligatorios",
        });
    }

    const nuevo = {
      nombre,
      categoria,
      precio: Number(precio),
      stock: Number(stock),
      uid: req.usuario.uid,
      emailUsuario: req.usuario.email || null,
      creadoEn: new Date().toISOString(),
    };

    const ref = await db.collection("productos").add(nuevo);
    res.status(201).json({ id: ref.id, ...nuevo });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al crear producto", detalle: error.message });
  }
});

// Actualizar producto
app.put("/api/productos/:id", verificarFirebaseToken, async (req, res) => {
  try {
    const ref = db.collection("productos").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    if (doc.data().uid !== req.usuario.uid) {
      return res
        .status(403)
        .json({ mensaje: "No puedes editar este producto" });
    }

    const cambios = { ...req.body, actualizadoEn: new Date().toISOString() };
    if (cambios.precio !== undefined) cambios.precio = Number(cambios.precio);
    if (cambios.stock !== undefined) cambios.stock = Number(cambios.stock);
    delete cambios.uid;
    delete cambios.emailUsuario;

    await ref.update(cambios);
    const actualizado = await ref.get();
    res.json({ id: actualizado.id, ...actualizado.data() });
  } catch (error) {
    res
      .status(500)
      .json({
        mensaje: "Error al actualizar producto",
        detalle: error.message,
      });
  }
});

// Eliminar producto
app.delete("/api/productos/:id", verificarFirebaseToken, async (req, res) => {
  try {
    const ref = db.collection("productos").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    if (doc.data().uid !== req.usuario.uid) {
      return res
        .status(403)
        .json({ mensaje: "No puedes eliminar este producto" });
    }

    await ref.delete();
    res.json({ mensaje: "Producto eliminado" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al eliminar producto", detalle: error.message });
  }
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`API Firebase en http://localhost:${PORT}`);
});
