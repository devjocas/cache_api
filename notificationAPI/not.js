// Função para solicitar permissão e enviar notificação
function sendNotification() {
  // Verifica suporte
  if (!('Notification' in window)) {
    console.log('Notificações não suportadas neste navegador');
    return;
  }

  // Verifica permissão
  if (Notification.permission === 'granted') {
    createNotification();
  } else if (Notification.permission !== 'denied') {
    // Solicita permissão
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        createNotification();
      }
    });
  } else {
    console.log('Permissão negada anteriormente');
  }
}

function createNotification() {
  const notification = new Notification('🔔 Nova Notificação', {
    body: 'Esta é uma mensagem de teste da Notifications API',
    icon: 'https://via.placeholder.com/192',
    badge: 'https://via.placeholder.com/96',
    image: 'https://via.placeholder.com/800x400',
    tag: 'teste-1',
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'abrir', title: 'Abrir Site' },
      { action: 'fechar', title: 'Fechar' }
    ],
    data: { url: 'https://exemplo.com' }
  });

  notification.onclick = (event) => {
    event.preventDefault();
    window.focus();
    
    if (event.action === 'abrir') {
      window.open(notification.data.url);
    }
    
    notification.close();
  };

  notification.onclose = () => {
    console.log('Notificação fechada pelo usuário');
  };
}

// Chama a função (deve ser em resposta a um clique)
document.getElementById('btnNotificacao').addEventListener('click', sendNotification);