// console.log(a)
// var a = 6

// TDZ TEMPORAL DEAD ZONE

console.log(nome)
let nome = 'Joaquim' //ReferenceError: Cannot access 'nome' before initialization

// Em blocos (if, for, {})
if (true) {
  console.log(x); // ReferenceError
  let x = 1;
}

for (let i = 0; i < 3; i++) {
  // ok usar i aqui
}
console.log(i); // ReferenceError (i só existe no bloco do for)

//Em funções

function soma() {
  console.log(a); // ReferenceError
  let a = 2;
  return a + 3;
}

// Com const
console.log(cor); // ReferenceError
const cor = "vermelho";

//EVAL EXECUTION CONTEXT
const codigo = "const x = 3; console.log(x);"
eval(codigo)