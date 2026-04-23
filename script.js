let allData = [];
let selectedQuestions = [];
let answers = {};
let timer = 0;
let interval;
let isDataLoaded = false;

// ✅ LOAD ALL JSON FILES
async function loadAllData() {
  const years = [2026, 2025, 2022, 2020, 2018];

  for (let year of years) {
    try {
      const res = await fetch(`data/${year}.json`);
      if (!res.ok) {
        console.warn(`Missing ${year}.json`);
        continue;
      }

      const data = await res.json();

      // Ensure consistent types
      data.forEach(q => {
        q.year = Number(q.year);
        q.assignment_no = Number(q.assignment_no);
      });

      allData = allData.concat(data);

    } catch (err) {
      console.error(`Error loading ${year}.json`, err);
    }
  }

  isDataLoaded = true;
  console.log("✅ All Data Loaded:", allData.length);

  // Enable start button
  const btn = document.getElementById("startBtn");
  if (btn) {
    btn.disabled = false;
    btn.innerText = "Start Quiz";
  }
}

loadAllData();

// ✅ POPULATE ASSIGNMENTS
document.getElementById("yearSelect").addEventListener("change", () => {
  if (!isDataLoaded) {
    alert("⏳ Data still loading...");
    return;
  }

  const year = Number(document.getElementById("yearSelect").value);
  const select = document.getElementById("assignmentSelect");

  select.innerHTML = `<option value="">Select Assignment</option>`;

  if (!year) return;

  const assignments = new Set();

  allData.forEach(q => {
    if (q.year === year) {
      assignments.add(q.assignment_no);
    }
  });

  [...assignments].sort((a, b) => a - b).forEach(a => {
    select.innerHTML += `<option value="${a}">Assignment ${a}</option>`;
  });
});

// ✅ START QUIZ
function startQuiz() {
  if (!isDataLoaded) {
    alert("⏳ Please wait, data loading...");
    return;
  }

  answers = {};
  const year = Number(document.getElementById("yearSelect").value);
  const assignment = Number(document.getElementById("assignmentSelect").value);

  selectedQuestions = [...allData];

  if (year) {
    selectedQuestions = selectedQuestions.filter(q => q.year === year);
  }

 if (!isNaN(assignment)) {
    selectedQuestions = selectedQuestions.filter(q => q.assignment_no === assignment);
  }

  if (selectedQuestions.length === 0) {
    alert("⚠ No questions found!");
    return;
  }

  // Shuffle
  selectedQuestions.sort(() => Math.random() - 0.5);

  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("quizScreen").classList.remove("hidden");

  renderQuiz();
  startTimer();
}

// ✅ RENDER QUIZ
function renderQuiz() {
  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = "";

  selectedQuestions.forEach((q, index) => {

    const optionsHTML = q.options.map(opt => `
      <div class="option" onclick="selectOption(${index}, '${opt.replace(/'/g, "\\'")}', this)">
        ${opt}
      </div>
    `).join("");

    quizDiv.innerHTML += `
      <div class="question" id="q${index}">
        <p><b>Q${index + 1}:</b> ${q.question}</p>
        ${optionsHTML}
        <div class="explanation hidden" id="exp${index}">
          📘 ${q.explanation || "No explanation available"}
        </div>
      </div>
    `;
  });
}

// ✅ OPTION CLICK (INSTANT FEEDBACK)
function selectOption(index, selected, element) {
  const q = selectedQuestions[index];

  // Prevent reattempt
  if (answers[index] !== undefined) return;

  answers[index] = selected;

  const parent = element.parentElement;
  const options = parent.querySelectorAll(".option");

  options.forEach(opt => {
    if (opt.innerText === q.correct_answer) {
      opt.classList.add("correct");
    }
  });

  if (selected !== q.correct_answer) {
    element.classList.add("wrong");
  }

  // Show explanation
  document.getElementById("exp" + index).classList.remove("hidden");
}

// ✅ TIMER
function startTimer() {
  timer = 0;
  clearInterval(interval);

  interval = setInterval(() => {
    timer++;
    document.getElementById("timer").innerText = `⏱ ${timer}s`;
  }, 1000);
}

// ✅ SUBMIT QUIZ
function submitQuiz() {
  clearInterval(interval);

  let correct = 0;
  let wrong = 0;

  selectedQuestions.forEach((q, index) => {
    if (answers[index] === q.correct_answer) correct++;
    else wrong++;
  });

  document.getElementById("quizScreen").classList.add("hidden");
  document.getElementById("resultScreen").classList.remove("hidden");

  document.getElementById("resultScreen").innerHTML = `
    <h2>Result</h2>
    <p>✅ Correct: ${correct}</p>
    <p>❌ Wrong: ${wrong}</p>
    <p>📊 Score: ${correct}/${selectedQuestions.length}</p>
    <p>⏱ Time: ${timer}s</p>
  `;
}
