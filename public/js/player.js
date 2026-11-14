const socket = io();

document.getElementById("joinBtn").onclick = () => {
  const name = document.getElementById("name").value || "Anon";
  socket.emit("join", name);
  document.getElementById("join").style.display = "none";
  document.getElementById("game").style.display = "block";
};

socket.on("newQuestion", (q) => {
  document.getElementById("question").innerHTML = `<h2>${q.question}</h2>`;
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  q.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.innerText = choice;
    btn.onclick = () => {
      socket.emit("answer", i);
      Array.from(answersDiv.children).forEach(b => b.disabled = true);
    };
    answersDiv.appendChild(btn);
  });
});
