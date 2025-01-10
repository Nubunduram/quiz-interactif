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