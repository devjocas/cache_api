const canvas = document.getElementById('meuCanvas');
const contexto = canvas.getContext('2d')
// contexto.fillStyle = 'blue'
// contexto.fillRect (50,50,150,50)

//Retangulo com contorno
 contexto.strokeStyle = 'red';
 contexto.lineWidth = 4;
contexto.strokeRect(250,50,150,100)
// CRIANDO LINHAS E CAMINHOS
contexto.beginPath()
contexto.moveTo(50,200)
contexto.lineTo(200,250)
contexto.lineTo(50,300)
contexto.closePath()
// //desenhar contornos
contexto.strokeStyle = 'blue'
contexto.strokeStyle()

// //Preencher
contexto.fillStyle = 'green'
contexto.fill()

//DESENHANDO TEXTO
contexto.font = '24px Verdana';
contexto.fillStyle = 'green'
contexto.fillText('olá canvas!', 50,50)
contexto.strokeStyle = 'orange'
contexto.lineWidth = 2
contexto.strokeText('Texto contornado', 40,100)

//Desenhando imagens

const img = new Image()
img.src = 'joaquim.png'
img.onload =()=>{
    contexto.drawImage(img, 100,50)
}

// TRANSFORMACAO E ESTILOS
Estilos
contexto.fillStyle = "rgba(0, 150, 255, 0.5)";
contexto.strokeStyle = "#333";
contexto.lineWidth = 5;
// //Transformações
contexto.save();               // salva estado atual
contexto.translate(100, 100);  // move sistema de coordenadas
contexto.rotate(Math.PI / 5);  // gira 45°
contexto.scale(1.5, 1.5);      // aumenta 50%
contexto.fillRect(0, 0, 50, 50);
contexto.restore();            // volta ao estado anterior

let x = 0;

function desenhar() {
  // Limpa o canvas
  contexto.clearRect(0, 0, canvas.width, canvas.height);

  // Desenha um círculo em movimento
  contexto.beginPath();
  contexto.arc(x, 150, 20, 0, Math.PI * 2);
  contexto.fillStyle = "red";
  contexto.fill();

  // Atualiza posição
  x += 2;
  if (x > canvas.width) x = 0;

  // Próximo frame
  requestAnimationFrame(desenhar);
}

desenhar();