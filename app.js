'use strict';
/* global $ */

const TOP_LEVEL_COMPONENTS = [ //array js classes in order to hide all
  'js-intro', 'js-question', 'js-question-feedback', 'js-outro', 'js-quiz-status', 'js-query-options',
];

const QUESTIONS = [ //array-object with local questions to display
  {
    text: 'Capital of England?',
    answers: ['London', 'Paris', 'Rome', 'Washington DC'],
    correctAnswer: 'London'
  },
  {
    text: 'How many kilometers in one mile?',
    answers: ['0.6', '1.2', '1.6', '1.8'],
    correctAnswer: '1.6'
  }
];

const getInitialStore = function() { //initial STORE/DOM view
  return {
    page: 'intro', //view intro
    currentQuestionIndex: null, //no current question
    userAnswers: [], //empty array user answer
    feedback: null, //no current feedback
    questionsObtained: [],
    tokenObtained: '',
  };
};

let store = getInitialStore(); //variable initialize function

// API source data functions
// ===============

const BASE_URL = 'https://opentdb.com/';
const MAIN_PATH = 'api.php';
const TOKEN_PATH = 'api_token.php';

// Build the endpoint URL

function buildTokenUrl() {
  const url = new URL(BASE_URL);
  url.pathname = TOKEN_PATH;
  
  url.searchParams.set('command', 'request');

  url.toString();

  $.getJSON(url, fetchToken);

  console.log('the buildTokenUrl is', url);
}

function buildBaseUrl(amountTerm, categoryTerm, typeTerm) {
  const url = new URL(BASE_URL);
  url.pathname = MAIN_PATH;

  url.searchParams.set('amount', amountTerm); //request number of questions (number)
  url.searchParams.set('category', categoryTerm); //request category (number)
  url.searchParams.set('type', typeTerm); //request type of questions
  if (store.tokenObtained !== '') {
    url.searchParams.set('command', 'reset');
    url.searchParams.set('token', store.tokenObtained);
  }
  url.toString(); 

  $.getJSON(url, fetchQuestions);

  console.log('the buildBaseUrl is', url);
}

// Fetch data
function fetchToken(data) {
  let tokenValue = data.token;
  store.tokenObtained = tokenValue;
  console.log('the tokenValue is', tokenValue);

  //buildBaseUrl(10, 9, 'boolean'); //DO AT END - NEED TO OBTAIN USER INPUT
  
}
function fetchQuestions(data) {
  store.questionsObtained = data.results;
  console.log('the fetchQuestions is', data);
  console.log('the store questions value is now', store.questionsObtained);
}

// function watchSubmit() {
//   $('.number-of-questions').submit(event => {
//     event.preventDefault();
//     const queryTarget = $(event.currentTarget).find('.js-input-box');
//     const query = queryTarget.val();
//     buildTokenUrl();
//     buildBaseUrl(query, 9, 'boolean');
//   });
// }

// function buildSessionTokenUrl(tokenData) {
//   tokenObtained = tokenData.token;
//   if (!tokenObtained === ''){
//     $('.js-start').toggle();
//   }
// }


//added api questions to STORE; 
//decorate questions?
//add question to screen?


// Decorate responses
const createQuestion = function(question) { //for one question - remember to call for each object in the array
  // Copy incorrect_answers array into new all answers array
  const answers = [ ...question.incorrect_answers ];

  // Pick random index from total answers length (incorrect_answers length + 1 correct_answer)
  const randomIndex = Math.floor(Math.random() * (question.incorrect_answers.length + 1));

  // Insert correct answer at random place
  answers.splice(randomIndex, 0, question.correct_answer);

  return {
    text: question.question,
    correctAnswer: question.correct_answer,
    answers
  };
};

// Add question to store
function addQuestion() {}

// Helper functions
// ===============
const hideAll = function() {
  TOP_LEVEL_COMPONENTS.forEach(component => $(`.${component}`).hide());
};

const getScore = function() {
  return store.userAnswers.reduce((accumulator, userAnswer, index) => {
    const question = getQuestion(index);

    if (question.correctAnswer === userAnswer) {
      return accumulator + 1;
    } else {
      return accumulator;
    }
  }, 0);
};

const getProgress = function() {
  return {
    current: store.currentQuestionIndex + 1,
    total: QUESTIONS.length
  };
};

const getCurrentQuestion = function() {
  return QUESTIONS[store.currentQuestionIndex];
};

const getQuestion = function(index) {
  return QUESTIONS[index]; //return QUESTIONS[index];
};

// HTML generator functions
// ========================
const generateAnswerItemHtml = function(answer) {
  return `
    <li class="answer-item">
      <input type="radio" name="answers" value="${answer}" />
      <span class="answer-text">${answer}</span>
    </li>
  `;
};

const generateQuestionHtml = function(question) {
  const answers = question.answers
    .map((answer, index) => generateAnswerItemHtml(answer, index))
    .join('');

  return `
    <form>
      <fieldset>
        <legend class="question-text">${question.text}</legend>
          ${answers}
          <button type="submit">Submit</button>
      </fieldset>
    </form>
  `;
};

const generateFeedbackHtml = function(feedback) {
  return `
    <p>${feedback}</p>
    <button class="continue js-continue">Continue</button>
  `;
};

// Render function - uses `store` object to construct entire page every time it's run
// ===============
const render = function() {
  let html;
  hideAll();

  const question = getCurrentQuestion();
  const { feedback } = store;
  const { current, total } = getProgress();

  $('.js-score').html(`<span>Score: ${getScore()}</span>`);
  $('.js-progress').html(`<span>Question ${current} of ${total}`);

  switch (store.page) {
  case 'intro':
    $('.js-intro').show();
    $('.js-query-options').show();
    buildTokenUrl();
    break;

  case 'question':
    html = generateQuestionHtml(question);
    $('.js-question').html(html);
    $('.js-question').show();
    $('.quiz-status').show();
    break;

  case 'answer':
    html = generateFeedbackHtml(feedback);
    $('.js-question-feedback').html(html);
    $('.js-question-feedback').show();
    $('.quiz-status').show();
    break;

  case 'outro':
    $('.js-outro').show();
    $('.quiz-status').show();
    break;

  default:
    return;
  }
};

// Event handler functions
// =======================
const handleStartQuiz = function() {
  store = getInitialStore();
  store.page = 'question';
  store.currentQuestionIndex = 0;
  render();
};

const handleSubmitAnswer = function(e) {
  e.preventDefault();
  const question = getCurrentQuestion();
  const selected = $('input:checked').val();
  store.userAnswers.push(selected);

  if (selected === question.correctAnswer) {
    store.feedback = 'You got it!';
  } else {
    store.feedback = `Too bad! The correct answer was: ${question.correctAnswer}`;
  }

  store.page = 'answer';
  render();
};

const handleNextQuestion = function() {
  if (store.currentQuestionIndex === QUESTIONS.length - 1) {
    store.page = 'outro';
    render();
    return;
  }

  store.currentQuestionIndex++;
  store.page = 'question';
  render();
};

//NEED TO RESTART WITH START PAGE RATHER THAN LOOP BACK TO QUESTIONS - ADD LATER
const handleRestartQuiz = function() {
  
};

// On DOM Ready, run render() and add event listeners
$(() => {
  render();

  $('.js-intro, .js-outro').on('click', '.js-start', handleStartQuiz);
  $('.js-question').on('submit', handleSubmitAnswer);
  $('.js-question-feedback').on('click', '.js-continue', handleNextQuestion);
  
});