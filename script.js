
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

  let categoryFound = null;
  for (const phrase in categories) {
    if (transcript.includes(phrase)) {
      categoryFound = categories[phrase];
      const task = transcript.replace("add", "").replace("to " + phrase, "").trim();
      if (task) {
        addTask(categoryFound, task);
        return;
      }
    }
  }
  alert("Couldn't understand. Try something like: Add 'Call AC guy' to this week.");
}

function addTask(sectionId, text, save = true) {
  const taskList = document.querySelector(`#${sectionId} .task-list`);
  const div = document.createElement('div');
  div.className = "task";

  const span = document.createElement('span');
  span.className = "task-text";
  span.innerText = text;

  const editBtn = document.createElement('button');
  editBtn.innerText = "✏️";
  editBtn.onclick = () => editTask(span, editBtn, sectionId);

  const delBtn = document.createElement('button');
  delBtn.innerText = "🗑️";
  delBtn.onclick = () => completeTask(div, sectionId);

  div.appendChild(span);
  div.appendChild(editBtn);
  div.appendChild(delBtn);
  taskList.appendChild(div);

  if (save) saveTasks();
}

function completeTask(taskElement, fromSectionId) {
  taskElement.classList.add("completed");
  document.getElementById("completed").appendChild(taskElement);
  saveTasks();
}

function editTask(span, button, sectionId) {
  const input = document.createElement('input');
  input.value = span.innerText;
  input.onblur = () => {
    span.innerText = input.value;
    span.parentElement.replaceChild(span, input);
    saveTasks();
  };
  span.parentElement.replaceChild(input, span);
  input.focus();
}

function saveTasks() {
  const data = {
    "this-week": [],
    "next-week": [],
    "week-after-next": [],
    "completed": []
  };

  for (const section of Object.keys(data)) {
    const tasks = document.querySelectorAll(`#${section} .task`);
    tasks.forEach(task => {
      const text = task.querySelector('.task-text')?.innerText || task.innerText;
      data[section].push(text);
    });
  }

  localStorage.setItem("jd_tasks", JSON.stringify(data));
}

function loadTasks() {
  const data = JSON.parse(localStorage.getItem("jd_tasks"));
  if (!data) return;

  for (const [sectionId, tasks] of Object.entries(data)) {
    tasks.forEach(task => addTask(sectionId, task, false));
  }
}

window.onload = loadTasks;
