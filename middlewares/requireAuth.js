const { createRemoteJWKSet, jwtVerify } = require('jose');
const { projectId } = require('../config/firebase');

// Chaves públicas que o Google usa para assinar os ID tokens do Firebase.
// A lib `jose` baixa e guarda em cache; verificamos a assinatura SEM precisar de chave secreta.
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

// Garante que a requisição veio de um usuário realmente logado no Firebase.
// O navegador manda o ID token (campo `idToken` do formulário ou header Authorization: Bearer).
// Se o token for válido, preenche req.user = { uid, email, nome }. Assim ninguém consegue
// "forjar" o autor de um chamado mandando uid/e-mail falsos no formulário.
module.exports = async function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const token = (req.body && req.body.idToken) || (header.startsWith('Bearer ') ? header.slice(7) : '');

  if (!token) return res.status(401).send('Não autorizado: faça login para continuar.');

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    const email = payload.email || '';
    req.user = {
      uid: payload.user_id || payload.sub,
      email,
      nome: payload.name || (email ? email.split('@')[0] : 'Usuário'),
    };
    next();
  } catch (err) {
    console.warn('Token inválido:', err.code || err.message);
    res.status(401).send('Não autorizado: sessão inválida ou expirada. Entre novamente.');
  }
};
