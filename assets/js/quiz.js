// quiz.js

import {
  getElement,
  showElement,
  hideElement,
  setText,
  createAnswerButton,
  updateScoreDisplay,
  lockAnswers,
  markCorrectAnswer,
} from "./dom.js";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  startTimer,
} from "./utils.js";

console.log("Quiz JS loaded...");

const questions = [
  {
    text: "Quelle est la capitale de la France ?",
    answers: ["Marseille", "Paris", "Lyon", "Bordeaux"],
    correct: 1,
    timeLimit: 10,
  },
  {
    text: "Combien font 2 + 3 ?",
    answers: ["3", "4", "5", "1"],
    correct: 2,
    timeLimit: 5,
  },
];

let currentQuestionIndex = 0;
let score = 0;
let bestScore = loadFromLocalStorage("bestScore", 0);
let timerId = null;
let playerAnswers = [];

// DOM Elements
const introScreen = getElement("#intro-screen");
const questionScreen = getElement("#question-screen");
const questionScreen2 = getElement("#question-screen2");
const resultScreen = getElement("#result-screen");

const bestScoreValue = getElement("#best-score-value");
const bestScoreEnd = getElement("#best-score-end");

const questionText = getElement("#question-text");
const questionTextINF = getElement("#question-textINF");
const answersDiv = getElement("#answers");
const answersDivINF = getElement("#answersINF");
const nextBtn = getElement("#next-btn");
const startBtn = getElement("#start-btn");
const restartBtn = getElement("#restart-btn");

const nextBtnINF = getElement("#next-btnINF");

const scoreText = getElement("#score-text");
const timeLeftSpan = getElement("#time-left");

const currentQuestionIndexSpan = getElement("#current-question-index");
const totalQuestionsSpan = getElement("#total-questions");

const infiniteBTN = getElement("#infiniteBTN");

// Init
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);

infiniteBTN.addEventListener("click", infiniteMode);

setText(bestScoreValue, bestScore);

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startQuiz() {
  shuffleArray(questions);

  hideElement(introScreen);
  showElement(questionScreen);

  currentQuestionIndex = 0; // resets the question index
  score = 0; // resets the score

  setText(totalQuestionsSpan, questions.length); // Sets the max questions to solve like Question index / MAX

  showQuestion();
}

function showQuestion() {
  clearInterval(timerId); // Clear the timer  

  const q = questions[currentQuestionIndex]; // getting the right question to show
  setText(questionText, q.text); // prints the question on #question-text
  setText(currentQuestionIndexSpan, currentQuestionIndex + 1); // prints the actual index on #current-question-index

  answersDiv.innerHTML = ""; // setting up #answers
  q.answers.forEach((answer, index) => { 
    const btn = createAnswerButton(answer, () => selectAnswer(index, btn)); // dom.js fn to create a nice btn html code
    answersDiv.appendChild(btn); // appening the btn to the DOM in #answers 
  });

  nextBtn.classList.add("hidden"); // hide the button so the user has to answer

  timeLeftSpan.textContent = q.timeLimit; 
  timerId = startTimer(
    q.timeLimit,
    (timeLeft) => setText(timeLeftSpan, timeLeft), // replace the #time-left text with actual time
    () => {
      lockAnswers(answersDiv); // cannot answer after no timeleft 
      nextBtn.classList.remove("hidden"); // shows the next btn when time is over
    }
  );
}

function selectAnswer(index, btn) {
  clearInterval(timerId);

  const q = questions[currentQuestionIndex];
  const playerAnswer = {
    question: q.text,
    chosenAnswer: q.answers[index],
    correctAnswer: q.answers[q.correct],
  };
  playerAnswers.push(playerAnswer);

  if (index === q.correct) { // checking if the btn clicked got the correct flag
    score++;
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
  }

  markCorrectAnswer(answersDiv, q.correct);
  lockAnswers(answersDiv);
  nextBtn.classList.remove("hidden");
}

function nextQuestion() { // next index question, if index == lenght : no questions left

  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() { // score set
  hideElement(questionScreen);
  showElement(resultScreen);

  updateScoreDisplay(scoreText, score, questions.length);

  if (score > bestScore) {
    bestScore = score;
    saveToLocalStorage("bestScore", bestScore);
  }
  setText(bestScoreEnd, bestScore);

  const summaryTableBody = getElement("#summary-table tbody");
  summaryTableBody.innerHTML = "";

  playerAnswers.forEach((answer) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${answer.question}</td>
      <td>${answer.chosenAnswer}</td>
      <td>${answer.correctAnswer}</td>
    `;
    summaryTableBody.appendChild(row);
  });
}


function restartQuiz() {
  hideElement(resultScreen);
  showElement(introScreen);

  setText(bestScoreValue, bestScore);
  playerAnswers = [];
}

function infiniteMode() {
  showElement(questionScreen2); // Assume this is a separate screen for infinite mode

  currentQuestionIndex = 0; // Reset the index (not really needed for infinite, but for tracking)
  score = 0; // Reset the score for infinite mode (optional)

  showInfiniteQuestion();
}

function showInfiniteQuestion() { // Same as showQuestion() but with random and separated card display
  clearInterval(timerId);

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  setText(questionTextINF, randomQuestion.text);

  answersDivINF.innerHTML = "";
  randomQuestion.answers.forEach((answer, index) => {
    const btn = createAnswerButton(answer, () => selectInfiniteAnswer(index, btn, randomQuestion.correct));
    answersDivINF.appendChild(btn);
  });

  nextBtnINF.classList.add("hidden"); // Hide the next button until answered

  timeLeftSpan.textContent = randomQuestion.timeLimit;
  timerId = startTimer(
    randomQuestion.timeLimit,
    (timeLeft) => setText(timeLeftSpan, timeLeft),
    () => {
      lockAnswers(answersDivINF);
      nextBtnINF.classList.remove("hidden");
    }
  );

  nextBtnINF.addEventListener("click", showInfiniteQuestion); // Re-show a random question on click
}

function selectInfiniteAnswer(index, btn, correctIndex) {
  clearInterval(timerId);

  if (index === correctIndex) { // checks answer validity
    score++;
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
  }

  markCorrectAnswer(answersDivINF, correctIndex);
  lockAnswers(answersDivINF); // locks answer
  nextBtnINF.classList.remove("hidden"); // next button comes back
}

// Select the element with the class "daynight"
const dayNight = document.getElementById("daynight");

function toggleSiteTheme() {
  document.body.classList.toggle("dark-mode");
  console.log("Site theme toggled!");
}
// Ensure the element exists before adding the event listener
if (dayNight) {
  dayNight.addEventListener("click", function () {
    // Select the <path> element within the SVG
    const svgPath = dayNight.querySelector("path");

    if (svgPath) {
      // Define the two states for the `d` attribute
      const pathState1 =
        "M20.78 39.678c9.493 1.845 18.155-4.765 19.128-13.972-14.523 8.932-26.51-3.081-17.614-17.626-9.208.968-15.826 9.635-13.98 19.131.895 4.614 3.912 8.648 8.08 10.894a1 1 0 1 1-.948 1.76C10.754 37.338 7.36 32.8 6.35 27.593 4.19 16.477 12.376 6.352 23.422 6c.957-.028 1.64.896 1.384 1.797l-.135.29c-9.245 13.586 1.665 24.52 15.228 15.241l.284-.134c.904-.264 1.842.421 1.806 1.381-.351 11.044-10.475 19.226-21.59 17.066a1 1 0 1 1 .382-1.963m-8.548-13.267c.907 4.67 4.68 8.442 9.35 9.349a1 1 0 1 1-.382 1.963c-5.47-1.062-9.87-5.46-10.931-10.931a1 1 0 1 1 1.963-.381";

      const pathState2 =
        "M25 9V5a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0m-1 25a10 10 0 0 0 8.908-5.453 1 1 0 0 1 1.781.91A12 12 0 0 1 24.001 36c-6.628 0-12-5.373-12-12 0-2.953 1.067-5.658 2.836-7.748l-4.98-4.98a1 1 0 0 1 1.415-1.415l4.98 4.98A11.95 11.95 0 0 1 24 12c6.29 0 11.45 4.841 11.959 11H43a1 1 0 1 1 0 2H33a1 1 0 1 1 0-2h.951c-.502-5.052-4.766-9-9.95-9a9.96 9.96 0 0 0-6.33 2.258l1.037 1.035a1 1 0 0 1-1.415 1.415l-1.035-1.036A9.96 9.96 0 0 0 14 24c0 5.522 4.477 10 10 10m-6-10a6 6 0 0 0 6 6 1 1 0 1 1 0 2 8 8 0 0 1-8-8 1 1 0 1 1 2 0m7 15v4a1 1 0 1 1-2 0v-4a1 1 0 1 1 2 0M9 25H5a1 1 0 1 1 0-2h4a1 1 0 1 1 0 2m24.9 10.315 2.828 2.828a1 1 0 0 0 1.414-1.415L35.314 33.9a1 1 0 0 0-1.414 1.415M12.686 33.9l-2.829 2.828a1 1 0 1 0 1.415 1.414l2.828-2.828a1 1 0 0 0-1.415-1.414M33.9 12.685l2.827-2.828a1 1 0 1 1 1.415 1.415L35.315 14.1a1 1 0 0 1-1.414-1.415";

      // Check current path state and toggle
      const currentPath = svgPath.getAttribute("d");
      svgPath.setAttribute("d", currentPath === pathState1 ? pathState2 : pathState1);
      toggleSiteTheme();
    }
  });
}
