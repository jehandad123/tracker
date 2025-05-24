
function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    handleVoiceCommand(transcript);
  };
}

function handleVoiceCommand(transcript) {
  const categories = {
    "this week": "this-week",
    "next week": "next-week",
    "week after next": "week-after-next"
  };

  const match = transcript.match(/add (.*?) to (this week|next week|week after next)/);
  if (match) {
    const task = match[1];
    const sectionId = categories[match[2]];
    addTask(sectionId, task);
  } else {
    alert("Couldn't understand. Say something like: Add 'Buy milk' to this week.");
  }
}

function addTask(sectionId, text) {
  const taskList = document.querySelector(`#${sectionId} .task-list`);
  const div = document.createElement('div');
  div.className = "task";

  const span = document.createElement('span');
  span.className = "task-text";
  span.innerText = text;

  const editBtn = document.createElement('button');
  editBtn.innerText = "✏️";
  editBtn.onclick = () => editTask(span, editBtn);

  const delBtn = document.createElement('button');
  delBtn.innerText = "🗑️";
  delBtn.onclick = () => completeTask(div);

  div.appendChild(span);
  div.appendChild(editBtn);
  div.appendChild(delBtn);
  taskList.appendChild(div);
}

function completeTask(taskElement) {
  taskElement.classList.add("completed");
  document.getElementById("completed").appendChild(taskElement);
}

function editTask(span, button) {
  const input = document.createElement('input');
  input.value = span.innerText;
  input.onblur = () => {
    span.innerText = input.value;
    span.parentElement.replaceChild(span, input);
  };
  span.parentElement.replaceChild(input, span);
  input.focus();
}
