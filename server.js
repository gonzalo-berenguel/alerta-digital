const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Puerto dinámico para la nube (Render, Railway, etc.) o 3000 local
const PORT = process.env.PORT || 3000;
const QUESTION_TIME = 5000;

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static("public"));

// Cargar preguntas
let QUESTIONS = [];
try {
  QUESTIONS = JSON.parse(fs.readFileSync("questions.json", "utf8"));
} catch (e) {
  console.error("No se pudo cargar questions.json");
}

let players = {};
let currentQuestionIndex = -1;
let questionTimeout = null;

// =====================================
// INICIAR JUEGO
// =====================================
app.get("/start", (req, res) => {
  currentQuestionIndex = -1;
  nextQuestion();
  res.send("Juego iniciado");
});

// =====================================
// SOCKET.IO
// =====================================
io.on("connection", (socket) => {
  console.log("Nuevo cliente:", socket.id);

  socket.on("join", (name) => {
    players[socket.id] = {
      name: name || "Anon",
      score: 0
    };
    io.emit("playersUpdate", Object.values(players));
  });

  socket.on("answer", (answerIndex) => {
    const question = QUESTIONS[currentQuestionIndex];
    if (!question) return;

    if (answerIndex === question.correct) {
      players[socket.id].score += 100;
      io.emit("playersUpdate", Object.values(players));
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playersUpdate", Object.values(players));
  });
});

// =====================================
// SIGUIENTE PREGUNTA
// =====================================
function nextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex < QUESTIONS.length) {
    const question = QUESTIONS[currentQuestionIndex];
    io.emit("newQuestion", question);
    questionTimeout = setTimeout(nextQuestion, QUESTION_TIME);
  } else {
    io.emit("gameOver", Object.values(players));
    clearTimeout(questionTimeout);
  }
}

// =====================================
// SERVIDOR
// =====================================
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});