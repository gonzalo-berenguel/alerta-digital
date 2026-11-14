const socket = io();

// BOTÓN PARA INICIAR JUEGO
document.getElementById("startBtn").onclick = () => {
  fetch("/start");
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

  // Mostrar respuestas (solo lectura)
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  q.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.innerText = choice;
    btn.disabled = true; // host solo muestra
    answersDiv.appendChild(btn);
  });

  // Iniciar temporizador de 20 segundos
  startCountdown(5);
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
  // Mostrar mensaje de fin
  document.getElementById("question").innerHTML = "<h2>Juego terminado 🎉</h2>";
  document.getElementById("answers").innerHTML = "";

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
