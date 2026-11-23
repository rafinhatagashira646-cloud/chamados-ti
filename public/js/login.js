// Tela de login: e-mail/senha, criar conta e Google (Firebase Authentication).
import firebaseConfig from '/firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

const auth = getAuth(initializeApp(firebaseConfig));

const $ = (id) => document.getElementById(id);
const erroBox = $('login-error');
const botoes = [$('btn-login'), $('btn-signup'), $('btn-google')];

// Traduz os códigos de erro do Firebase para mensagens amigáveis.
const MENSAGENS = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/missing-password': 'Informe a senha.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail. Use "Entrar".',
  'auth/weak-password': 'A senha é fraca: use pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
  'auth/popup-closed-by-user': 'A janela do Google foi fechada antes de concluir o login.',
  'auth/cancelled-popup-request': 'A janela do Google foi fechada antes de concluir o login.',
  'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Libere pop-ups para este site.',
  'auth/unauthorized-domain': 'Este domínio não está autorizado no Firebase (Authentication > Settings > Authorized domains).',
  'auth/operation-not-allowed': 'Este método de login não está ativado no Firebase.',
};

function mostrarErro(err) {
  erroBox.textContent = MENSAGENS[err.code] || `Não foi possível entrar (${err.code || err.message}).`;
  erroBox.hidden = false;
}

function ocupado(sim) {
  botoes.forEach((b) => (b.disabled = sim));
}

async function executar(acao) {
  erroBox.hidden = true;
  ocupado(true);
  try {
    await acao();
    window.location.href = '/';
  } catch (err) {
    mostrarErro(err);
    ocupado(false);
  }
}

const credenciais = () => [$('email').value.trim(), $('password').value];

$('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  executar(() => signInWithEmailAndPassword(auth, ...credenciais()));
});
$('btn-signup').addEventListener('click', () => {
  executar(() => createUserWithEmailAndPassword(auth, ...credenciais()));
});
$('btn-google').addEventListener('click', () => {
  executar(() => signInWithPopup(auth, new GoogleAuthProvider()));
});

// Se já estiver logado, vai direto para o sistema.
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = '/';
});
