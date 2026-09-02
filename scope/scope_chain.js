let globalVar = 'global';

function outer() {
  let outerVar = 'outer';

  function inner() {
    let innerVar = 'inner';
    console.log(innerVar); // 'inner' (escopo atual)
    console.log(outerVar); // 'outer' (escopo externo)
    console.log(globalVar); // 'global' (escopo global)
  }

  inner();
}

outer();

// Closure

function createCounter() {
  let count = 0; // variável do escopo externo

  return function () {
    count++;     // acessa 'count' mesmo depois de createCounter ter terminado
    return count;
  };
}

const counter = createCounter();

console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

//  callback
function saudacao(nome) {
  return function () {
    console.log(`Olá, ${nome}!`);
  };
}

const dizerOla = saudacao('João');

setTimeout(dizerOla, 1000); // depois de 1s: "Olá, João!"