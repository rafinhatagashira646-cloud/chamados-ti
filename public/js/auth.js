// Proteção das páginas do sistema (carregado no header de todas as telas).
// O <html> começa com a classe "auth-pending" (body invisível) para não "piscar" conteúdo
// antes de saber se há usuário logado.
import firebaseConfig from '/firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

const auth = getAuth(initializeApp(firebaseConfig));

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Caminho ABSOLUTO: com caminho relativo quebraria em páginas como /tickets/11.
    window.location.href = '/login.html';
    return;
  }

  // Nome (ou e-mail) e botão Sair na barra lateral
  const nome = document.getElementById('auth-name');
  const email = document.getElementById('auth-email');
  if (nome) nome.textContent = user.displayName || user.email;
  if (email) email.textContent = user.displayName ? user.email : '';

  const sair = document.getElementById('auth-logout');
  if (sair) {
    sair.onclick = async () => {
      await signOut(auth);
      window.location.href = '/login.html';
    };
  }

  // Pré-preenche o solicitante do formulário de novo chamado
  const solicitante = document.getElementById('solicitante');
  if (solicitante && !solicitante.value) solicitante.value = user.displayName || user.email.split('@')[0];

  document.documentElement.classList.remove('auth-pending');
});

// Formulários com data-auth-form: antes de enviar, pega um ID token novo e manda em um campo
// hidden. O servidor valida o token e descobre sozinho quem é o usuário (não dá para forjar).
document.addEventListener('submit', async (e) => {
  const form = e.target;
  if (!form.matches('[data-auth-form]') || form.dataset.tokenReady) return;
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) {
    window.location.href = '/login.html';
    return;
  }
  const token = await user.getIdToken();
  const campo = form.querySelector('input[name="idToken"]');
  campo.value = token;
  form.dataset.tokenReady = '1';
  form.submit();
});
