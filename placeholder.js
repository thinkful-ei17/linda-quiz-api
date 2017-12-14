'use strict';
/* global $*/

const TOP_LEVEL_COMPONENTS = [ //array stores js classes in order to hide all
  'js-intro', 'js-question', 'js-question-feedback', 'js-outro', 'js-quiz-status'
];

const QUESTIONS = [ //array-object stores local questions to display
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
  };
};

let store = getInitialStore(); //retrieve initial STORE function

// Set-up API
//=============

const BASE_URL = 'https://opentdb.com';
const TOKEN_PATH = '/api_token.php';
let sessionToken;

const fetchSessionToken = function(callback) {
  $.getJSON(BASE_URL + TOKEN_PATH, { command: 'request'}, function(response) {
    if (response.response_code !== 0) {
      throw new Error('Something went wrong');
    } 
    sessionToken = response.token;
    callback();
  }
  
  );
};

fetchSessionToken(() => {
  $('.js-start-button').attr('disabled', false);
});



// Helper functions
// ===============
const hideAll = function() { //variable function hides all js components
  TOP_LEVEL_COMPONENTS.forEach(component => $(`.${component}`).hide());
};

const getScore = function() { //variable function keeps track of user score
  return store.userAnswers.reduce((accumulator, userAnswer, index) => { //what is reduce????
    const question = getQuestion(index);

    if (question.correctAnswer === userAnswer) {
      return accumulator + 1;
    } else {
      return accumulator;
    }
  }, 0);
};

const getProgress = function() { // variable function that tracks question progress
  return {
    current: store.currentQuestionIndex + 1,
    total: QUESTIONS.length
  };
};

const getCurrentQuestion = function() { //variable function that obtains the current question from store
  return QUESTIONS[store.currentQuestionIndex];
};

const getQuestion = function(index) { //variable function that gets the question from the array
  return QUESTIONS[index];
};

  // HTML generator functions
  // ========================
const generateAnswerItemHtml = function(answer) { //template generates answer options
  return `
    <li class="answer-item">
      <input type="radio" name="answers" value="${answer}" />
      <span class="answer-text">${answer}</span>
    </li>
  `;
};

const generateQuestionHtml = function(question) {//template generates answer question for each array item????
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

const generateFeedbackHtml = function(feedback) { //add continue button
  return `
    <p>${feedback}</p>
    <button class="continue js-continue">Continue</button>
  `;
};

  // Render function - uses `store` object to construct entire page every time it's run
  // ===============
const render = function() { //add continue button
  let html;
  hideAll();

  const question = getCurrentQuestion();
  const { feedback } = store;
  const { current, total } = getProgress();

  $('.js-score').html(`<span>Score: ${getScore()}</span>`);
  $('.js-progress').html(`<span>Question ${current} of ${total}`);

  if (sessionToken) {
    $('.js-start-button').attr('disabled', false);
  }

  switch (store.page) {
  case 'intro':
    $('.js-intro').show();
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

  // On DOM Ready, run render() and add event listeners
$(function() { 
  fetchSessionToken(() => {
    render();
  });
  $('.js-intro, .js-outro').on('click', '.js-start', handleStartQuiz);
  $('.js-question').on('submit', handleSubmitAnswer);
  $('.js-question-feedback').on('click', '.js-continue', handleNextQuestion);
});
