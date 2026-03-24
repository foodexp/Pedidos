// 🔐 CONFIG SUPABASE
const SUPABASE_URL = "https://idituulscdgtphubybmo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaXR1dWxzY2RndHBodWJ5Ym1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjcxODUsImV4cCI6MjA4OTg0MzE4NX0.Yaew-PQ1alm7tsXNdwTb65tWomKkrHat8bgzt7qHlEU";

// Por isso:
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
if (!supabaseClient) {
  console.error("❌ Supabase SDK não carregou. Verifique o script no HTML.");
}

// --- 👤 AUTH FUNCTIONS ---
async function cadastrar() {
    const email = document.getElementById('email')?.value;
    const senha = document.getElementById('senha')?.value;
    if (!email || !senha) return alert("Preencha todos os campos");

    const { error } = await supabaseClient.auth.signUp({ email, password: senha });
    if (error) return alert(error.message);
    alert("Verifique seu email 📩");
}

async function login() {
    const email = document.getElementById('loginEmail')?.value;
    const senha = document.getElementById('loginSenha')?.value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });
    if (error) return alert(error.message);
    window.location.href = "cardapio.html";
}

async function loginGoogle() {
    await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'https://foodexp.github.io/Pedidos/cardapio.html' }
    });
}

// --- 🛒 LÓGICA DO CARRINHO ---
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || {};
let isOpen = false;
let toastTimer;

function adicionar(key, label, preco, emoji) {
    if (!carrinho[key]) carrinho[key] = { qtd: 0, preco, emoji, label };
    carrinho[key].qtd++;
    showToast(emoji + ' ' + label + ' adicionado!');
    atualizar();
}

function remover(key) {
    if (!carrinho[key]) return;
    carrinho[key].qtd--;
    if (carrinho[key].qtd <= 0) {
        const qtdEl = document.getElementById('qtd-' + key);
        if (qtdEl) qtdEl.textContent = '0';
        delete carrinho[key];
    }
    atualizar();
}

function atualizar() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    let total = 0;
    let itens = 0;
    let listaHTML = '';

    const lista = document.getElementById('lista');
    const resumo = document.getElementById('resumo');
    const badge = document.getElementById('badge');
    const btn = document.getElementById('finalizarBtn');

    if (!lista || !resumo || !badge) return;

    document.querySelectorAll('.counter-val').forEach(el => el.textContent = '0');
    document.querySelectorAll('.counter-btn.minus').forEach(el => el.classList.remove('has-items'));

    for (let key in carrinho) {
        let item = carrinho[key];
        total += item.qtd * item.preco;
        itens += item.qtd;

        const displayQtd = document.getElementById('qtd-' + key);
        if (displayQtd) displayQtd.textContent = item.qtd;

        const minusEl = document.getElementById('minus-' + key);
        if (minusEl) minusEl.classList.add('has-items');

        listaHTML += `
            <div class="cart-item">
                <div class="cart-item-emoji">${item.emoji}</div>
                <div class="cart-item-info">
                    <div class="cart-item-nome">${item.label}</div>
                    <div class="cart-item-sub">${item.qtd}x • R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="cart-item-preco">R$ ${(item.qtd * item.preco).toFixed(2).replace('.', ',')}</div>
            </div>`;
    }

    badge.textContent = itens;
    lista.innerHTML = itens === 0 ? 'Carrinho vazio 🛒' : listaHTML;
    resumo.innerHTML = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
    if (btn) btn.disabled = itens === 0;
}

function toggleCarrinho() {
    isOpen = !isOpen;
    const cart = document.getElementById('carrinho');
    const over = document.getElementById('overlay');
    if (cart) cart.classList.toggle('active', isOpen);
    if (over) over.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// --- 🚀 INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    atualizar();

    document.querySelectorAll('.cat').forEach(c => {
        c.addEventListener('click', () => {
            document.querySelectorAll('.cat').forEach(x => x.classList.remove('active'));
            c.classList.add('active');
        });
    });
});
