// 🔐 CONFIG
const SUPABASE_URL = "https://idituulscdgtphubybmo.supabase.co";
const SUPABASE_KEY = "SUA_ANON_KEY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🧠 CARRINHO (PROFISSIONAL)
let carrinho = {};

// 👤 CADASTRO
async function cadastrar() {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const { error } = await supabaseClient.auth.signUp({ email, password: senha });

  if (error) return alert(error.message);

  alert("Verifique seu email 📩");
}

// 🔑 LOGIN
async function login() {
  const email = document.getElementById('loginEmail').value;
  const senha = document.getElementById('loginSenha').value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });

  if (error) return alert(error.message);

  window.location.href = "cardapio.html";
}

// 🔐 GOOGLE LOGIN
async function loginGoogle() {
  await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://foodexp.github.io/Pedidos/cardapio.html'
    }
  });
}

// 👤 MOSTRAR USUÁRIO (SEM DUPLICAR)
async function mostrarUsuario() {
  const { data } = await supabaseClient.auth.getUser();

  if (data.user) {
    const el = document.getElementById("user");

    if (el && !el.innerHTML) {
      el.innerHTML = `👤 ${data.user.email}`;
    }
  }
}

// 🔒 PROTEGER PÁGINA
async function protegerPagina() {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = "index.html";
  }
}

// 🛒 ADICIONAR (COM QUANTIDADE)
function adicionar(nome, preco) {
  if (!carrinho[nome]) {
    carrinho[nome] = { qtd: 0, preco };
  }

  carrinho[nome].qtd++;
  atualizarCarrinho();
}

// ➖ REMOVER
function remover(nome) {
  if (!carrinho[nome]) return;

  carrinho[nome].qtd--;

  if (carrinho[nome].qtd <= 0) {
    delete carrinho[nome];
  }

  atualizarCarrinho();
}

// 🔄 ATUALIZAR UI
function atualizarCarrinho() {
  const lista = document.getElementById("carrinho");
  const totalEl = document.getElementById("total");

  if (!lista) return;

  lista.innerHTML = "";
  let total = 0;

  for (let item in carrinho) {
    const { qtd, preco } = carrinho[item];
    total += qtd * preco;

    const li = document.createElement("li");
    li.textContent = `${item} x${qtd} - R$ ${qtd * preco}`;
    lista.appendChild(li);
  }

  totalEl.textContent = "Total: R$ " + total.toFixed(2);
}

// 💾 FINALIZAR PEDIDO
async function finalizarPedido() {
  const { data } = await supabaseClient.auth.getUser();

  if (!data.user) {
    alert("Faça login primeiro!");
    return;
  }

  const itens = [];
  let total = 0;

  for (let item in carrinho) {
    const { qtd, preco } = carrinho[item];

    itens.push({ nome: item, qtd, preco });
    total += qtd * preco;
  }

  const { error } = await supabaseClient
    .from("pedidos")
    .insert([{ user_id: data.user.id, itens, total }]);

  if (error) {
    alert("Erro ao salvar pedido");
    console.log(error);
  } else {
    alert("Pedido enviado 🚀");
    carrinho = {};
    atualizarCarrinho();
  }
}

// 🚪 LOGOUT
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}
