// // CALLBACK QUEUE(MACROTASK) E MICROTASK
console.log("Primeiro")
setTimeout(()=>{
    console.log("Segundo")
},0)
console.log("terceiro")
Promise.resolve().then(()=>{
    console.log("Quarto")
})

// queueMicrotask e Promise.reslove().then()
queueMicrotask(()=>console.log("A"))
Promise.resolve().then(()=>console.log("B"))
queueMicrotask(()=>console.log("C"))
Promise.resolve().then(()=>console.log('D'))

console.log('1');

setTimeout(() => {
  console.log('timeout');
}, 0);

Promise.resolve().then(() => console.log('promise'));

queueMicrotask(() => console.log('queueMicrotask'));

console.log('2');

//Promise Resolution Order

console.log('script start');

Promise.resolve()
  .then(() => console.log('promise 1'))
  .then(() => console.log('promise 1 chain'));

Promise.resolve()
  .then(() => console.log('promise 2'));

setTimeout(() => console.log('timeout'), 0);

console.log('script end');

Promise.resolve()
  .then(() => console.log('then 1'))
  .catch(() => console.log('catch'))
  .finally(() => console.log('finally'))
  .then(() => console.log('then 2'));


//   Exemplo completo: cadeia complexa com erro e fallback
  fetchUser(id)
  .then(user => {
    if (!user) throw new Error('User not found');
    return fetchPosts(user.id);
  })
  .then(posts => {
    if (posts.length === 0) throw new Error('No posts');
    return Promise.all(posts.map(fetchComments));
  })
  .catch(err => {
    // tenta recuperar: usa posts vazios se falhar
    console.warn('Recovered from error:', err.message);
    return [];
  })
  .then(commentsArrays => {
    const allComments = commentsArrays.flat();
    return saveComments(allComments);
  })
  .then(() => console.log('Done'))
  .catch(err => console.error('Fatal:', err));