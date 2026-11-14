const socket = io();

const startBtn = document.getElementById("startBtn");

// BOTÓN PARA INICIAR JUEGO (Solo arranca al hacer clic)
startBtn.onclick = () => {
  fetch("/start")
    .then(() => {
      // Ocultar el botón para evitar dobles clics durante la partida
      startBtn.style.display = "none";
    })
    .catch(err => console.error("Error al iniciar:", err));
};

// TEMPORIZADOR
let countdownInterval;

function startCountdown(seconds) {
  clearInterval(countdownInterval);

  const timerNumber = document.getElementById("timer-number");
  const timerBar = document.getElementById("timer-bar");

  let remaining = seconds;
  timerNumber.textContent = remaining;
  timerBar.style.width = "100%";
  timerBar.style.background = "linear-gradient(90deg, #f44336, #ff9800)";

  countdownInterval = setInterval(() => {
    remaining--;
    timerNumber.textContent = remaining;

    // Actualizar ancho de la barra proporcional al tiempo restante
    const percent = (remaining / seconds) * 100;
    timerBar.style.width = percent + "%";

    // Cambiar color si quedan menos de 5 segundos
    if (remaining <= 5) {
      timerBar.style.background = "linear-gradient(90deg, #ff1744, #f50057)";
    }

    if (remaining <= 0) clearInterval(countdownInterval);
  }, 1000);
}

// NUEVA PREGUNTA
socket.on("newQuestion", (q) => {
  // Mostrar pregunta
  document.getElementById("question").innerHTML = `<h2>${q.question}</h2>`;

  // Mostrar respuestas (solo lectura en la pantalla principal)
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  
  let optionsList = [];
  if (Array.isArray(q.choices)) {
    optionsList = q.choices;
  } else if (Array.isArray(q.options)) {
    optionsList = q.options;
  } else if (Array.isArray(q.answers)) {
    optionsList = q.answers;
  }

  optionsList.forEach((choice) => {
    const btn = document.createElement("button");
    btn.innerText = choice;
    btn.disabled = true; // El host solo muestra las opciones
    answersDiv.appendChild(btn);
  });

  // Iniciar temporizador de 20 segundos sincronizado
  startCountdown(20);
});

// ACTUALIZAR RANKING
socket.on("playersUpdate", (players) => {
  const ranking = players
    .sort((a, b) => b.score - a.score)
    .map((p) => `${p.name}: ${p.score} pts`)
    .join("<br>");
  document.getElementById("ranking").innerHTML = `<h3>Ranking</h3>${ranking}`;
});

// JUEGO TERMINADO
socket.on("gameOver", (players) => {
  // Mostrar mensaje de fin y volver a mostrar el botón por si quieren reiniciar
  document.getElementById("question").innerHTML = "<h2>¡Juego terminado 🎉 Revisa los resultados!</h2>";
  document.getElementById("answers").innerHTML = "";
  startBtn.style.display = "block"; 

  // Ranking final
  const ranking = players
    .sort((a, b) => b.score - a.score)
    .map((p, i) => `${i + 1}. ${p.name}: ${p.score} pts`)
    .join("<br>");
  document.getElementById("ranking").innerHTML = `<h3>Resultados Finales</h3>${ranking}`;

  // Detener temporizador
  clearInterval(countdownInterval);
  document.getElementById("timer-number").textContent = "0";
  document.getElementById("timer-bar").style.width = "0%";
});
