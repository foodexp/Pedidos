// 🔐 CONFIGURE AQUI
const SUPABASE_URL = "https://idituulscdgtphubybmo.supabase.co";
const SUPABASE_KEY = "sb_publishable_6jTusFY9OF8WqIVbnV4Nag_fkreJbaD";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🧠 CARRINHO
let carrinho = [];

// 👤 CADASTRO
async function cadastrar() {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const { error } = await supabaseClient.auth.signUp({
    email: email,
    password: senha
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Cadastro realizado! Verifique seu email.");
  }
}

// 🔑 LOGIN
async function login() {
  const email = document.getElementById('loginEmail').value;
  const senha = document.getElementById('loginSenha').value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: senha
  });

  if (error) {
    alert(error.message);
  } else {
    window.location.href = "cardapio.html";
  }
}

// 🛒 ADICIONAR AO CARRINHO
function adicionar(nome, preco) {
  carrinho.push({ nome, preco });
  atualizarCarrinho();
}

// 🔄 ATUALIZAR TELA
function atualizarCarrinho() {
  const lista = document.getElementById("carrinho");
  const totalEl = document.getElementById("total");

  if (!lista) return;

  lista.innerHTML = "";
  let total = 0;

  carrinho.forEach(item => {
    total += item.preco;

    const li = document.createElement("li");
    li.textContent = `${item.nome} - R$ ${item.preco}`;
    lista.appendChild(li);
  });

  totalEl.textContent = "Total: R$ " + total;
}

// 💾 FINALIZAR PEDIDO
async function finalizarPedido() {
  const { data: userData } = await supabaseClient.auth.getUser();

  if (!userData.user) {
    alert("Faça login primeiro!");
    return;
  }

  const total = carrinho.reduce((soma, item) => soma + item.preco, 0);

  const { error } = await supabaseClient
    .from('pedidos')
    .insert([
      {
        user_id: userData.user.id,
        itens: carrinho,
        total: total
      }
    ]);

  if (error) {
    alert("Erro ao salvar pedido");
    console.log(error);
  } else {
    alert("Pedido realizado!");
    carrinho = [];
    atualizarCarrinho();
  }
}