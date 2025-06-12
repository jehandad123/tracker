
const taskLists = {
    "Product": document.getElementById("Product-tasks"),
    "Process": document.getElementById("Process-tasks"),
    "Analytics": document.getElementById("Analytics-tasks"),
    "People": document.getElementById("People-tasks"),
    "Urgent": document.getElementById("Urgent-tasks")
};

let recognition;
let currentTranscript = "";
let allTasks = [];

function toggleVoiceInput() {
    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = true;

        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                transcript += event.results[i][0].transcript;
            }
            document.getElementById("live-transcript").innerText = transcript;
            if (event.results[0].isFinal) {
                handleVoiceCommand(transcript);
            }
        };
    }

    recognition.start();
    document.getElementById("live-transcript").innerText = "Listening...";
}

function handleVoiceCommand(transcript) {
    document.getElementById("live-transcript").innerText = "";
    const lower = transcript.toLowerCase().trim();

    if (lower.startsWith("show me tasks")) {
        applyDateFilter(lower);
    } else if (lower.includes("clear filters")) {
        renderAllTasks();
    } else {
        const category = inferCategory(lower);
        const date = extractDate(lower);
        addTask(lower, category, date);
    }
}

function addManualTask() {
    const taskText = document.getElementById("manual-task-input").value;
    const category = document.getElementById("manual-category").value;
    const date = extractDate(taskText);
    if (taskText) {
        addTask(taskText, category, date);
        document.getElementById("manual-task-input").value = "";
    }
}

function addTask(text, category, date) {
    const task = { text, category, date };
    allTasks.push(task);
    renderAllTasks();
}

function renderAllTasks(filtered = null) {
    for (let cat in taskLists) {
        taskLists[cat].innerHTML = "";
    }

    (filtered || allTasks).forEach(task => {
        const div = document.createElement("div");
        div.className = "task";
        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;
        div.appendChild(span);
        taskLists[task.category].appendChild(div);
    });
}

function inferCategory(text) {
    const keywords = {
        "product": "Product",
        "process": "Process",
        "analysis": "Analytics",
        "analytics": "Analytics",
        "people": "People",
        "urgent": "Urgent"
    };
    for (let key in keywords) {
        if (text.includes(key)) return keywords[key];
    }
    return "Product";
}

function extractDate(text) {
    const dateMatch = text.match(/\b(june|jun|july|jul)\s?\d{1,2}\b/i);
    if (dateMatch) return new Date(dateMatch[0] + " 2025");
    if (text.includes("today")) return new Date();
    if (text.includes("tomorrow")) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d;
    }
    return null;
}

function applyDateFilter(command) {
    const now = new Date();
    let targetTasks = [];

    if (command.includes("today")) {
        targetTasks = allTasks.filter(t => sameDay(t.date, now));
    } else if (command.includes("tomorrow")) {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        targetTasks = allTasks.filter(x => sameDay(x.date, t));
    } else if (command.includes("this week")) {
        const end = new Date();
        end.setDate(end.getDate() + (7 - end.getDay()));
        targetTasks = allTasks.filter(t => t.date && t.date <= end && t.date >= now);
    } else if (command.includes("next two weeks")) {
        const end = new Date();
        end.setDate(end.getDate() + 14);
        targetTasks = allTasks.filter(t => t.date && t.date <= end && t.date >= now);
    } else if (command.includes("this month")) {
        targetTasks = allTasks.filter(t => t.date && t.date.getMonth() === now.getMonth());
    } else {
        const dateMatch = command.match(/\b(june|jun|july|jul)\s?\d{1,2}\b/i);
        if (dateMatch) {
            const refDate = new Date(dateMatch[0] + " 2025");
            targetTasks = allTasks.filter(x => sameDay(x.date, refDate));
        }
    }

    renderAllTasks(targetTasks);
}

function sameDay(d1, d2) {
    return d1 && d2 && d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
}
