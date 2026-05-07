const { admin } = require("./firebaseAdmin");

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.usuario = decoded; // usa el mismo nombre que en index.js
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
}



module.exports = verifyToken;
