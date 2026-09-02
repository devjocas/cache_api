// Exemplo típico de memory leak com closure
function createHandler() {
  const largeData = new Array(1_000_000).fill('x'); // ~alguns MB

  return function handler() {
    console.log('clicou');
    // largeData NÃO é usado aqui,
    // mas a closure ainda o mantém vivo
  };
}

const handler = createHandler();
document.body.addEventListener('click', handler);


// Como evitar / mitigar
// Algumas práticas comuns:

// Não capturar dados grandes sem necessidade
// Se só precisa de um valor pequeno, extraia-o antes de criar a closure:

function createHandler() {
  const largeData = new Array(1_000_000).fill('x');
  const summary = largeData.length; // só o que importa

  return function handler() {
    console.log('tamanho:', summary);
    // largeData não é referenciado → pode ser coletado
  };
}

// Remover event listeners e limpar timers
// Se a closure está em um listener ou setInterval, remova quando não for mais necessário:
// const handler = createHandler();
document.body.addEventListener('click', handler);

// depois, quando não precisar mais:
document.body.removeEventListener('click', handler);

// 2. Closure em loops (o problema clássico)
const funcs = [];

for (var i = 0; i < 3; i++) {
  funcs[i] = function () {
    console.log(i);
  };
}

funcs[0](); // 3
funcs[1](); // 3
funcs[2](); // 3

// Solução moderna: usar let
// const funcs = [];

for (let i = 0; i < 3; i++) {
  funcs[i] = function () {
    console.log(i);
  };
}

funcs[0](); // 0
funcs[1](); // 1
funcs[2](); // 2