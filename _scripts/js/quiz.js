const { codeProcess } = require("./copycode");

var questions = [];

// handler for quizzes
function submitQuiz(form){
  // get form data
  var fdata = new FormData(form);

  var formid = form.getAttribute("id");

  var uniqueKeys = new Set();

  // get only unique keys
  // avoid duplicate submissions on multiple choice questions
  for (const key of fdata.keys()) {
    if (!(uniqueKeys.has(key))) {
      let thisquestionid = formid + "-" + key;
      quizSuccess(thisquestionid, key, fdata);
      uniqueKeys.add(key);
    }
  }

  //return false;
  
}

// handler for single question forms
function submitQuestion(form){
  // get form data
  var fdata = new FormData(form);
  var dataqid = form.getAttribute("data-qid");
  var formid = form.getAttribute("id");

  quizSuccess(formid, dataqid, fdata); 
  //return false;
  
}

function processCodeBlocks (solutionhtml){
  let copyingcode = solutionhtml.find( "code.copy" );
  solutionhtml.find( "code.no-copy" ).wrap("<div class='language-plaintext highlighter-rouge'><div class='highlight'><pre class='highlight'></pre></div></div>");
  
  if (copyingcode.length > 0) {
    copyingcode.wrap("<div class='language-plaintext copy-code highlighter-rouge'><div class='highlight'><pre class='highlight'></pre></div></div>");
    // add the copycode section here.
    solutionhtml.find( "div.copy-code" ).each(function(){
      codeProcess(this);
    });
  }
}

// Get answers and responses from json

function quizSuccess(formid, idval, myResponses, fullform=false) {
  var displayDivId = formid + "-result";
  var displayDiv = $('#' + displayDivId);

  // Find the question by qid (ensure idval is number if needed)
  var mySolutions = questions ? questions.find(q => String(q.qid) === String(idval)) : null;
  var myAnswer = mySolutions ? mySolutions.answer : null;
  var mySolution =  mySolutions ? mySolutions.solution : null;
  var myCorrections = mySolutions ? mySolutions.responses : null;

  let resultMsg = "";
  let solutionMsg = "";
  let alertClass = "";

  let solutionArr = Array.isArray(myAnswer) ? myAnswer.map(String) : (myAnswer !== undefined ? [ String(myAnswer) ] : [ ]);
  let correctionArr = Array.isArray(myCorrections) ? myCorrections.map(String) : (myCorrections !== undefined ? [ String(myCorrections) ] : [ ]);
  
  if (myResponses === "Show Answer"){
      // User clicked "Show Answer"
      if (solutionArr){
        fullform.reset();
        solutionArr.forEach((item) => {
          let thiskey = "check-" + formid + "-" + item;
          document.getElementById(thiskey).checked = true;
        });
      } 

      resultMsg = "Answer:";
      solutionMsg = myCorrections ? correctionArr[ myAnswer-1 ] : (mySolution ? mySolution : (solutionArr ? (solutionArr.length > 1 ? "Answers " + solutionArr.join(' and ') : "Answer " + myAnswer)  :"No answer available."));
      alertClass = "info";

  } else { 
    // Get the user's response(s) as array or value
    var userResponse = myResponses.getAll(idval);
    
    // If multiple checkboxes, FormData returns array, else string
    // Normalize for comparison
    let responseArr = Array.isArray(userResponse) ? userResponse.map(String) : (userResponse !== undefined ? [ String(userResponse) ] : [ ]);

    if (myAnswer === undefined || myAnswer === null) {
      // No solution, just show the answer
      resultMsg = "Answer:";
      solutionMsg = mySolution ? mySolution : "No answer available.";
      alertClass = "info";
    } else if (responseArr.length > 1 && solutionArr.length === 1) {
      // User selected multiple answers but only one is correct
      resultMsg = "Error";
      solutionMsg = "Please only select one answer";
      alertClass = "error";
    } else if (responseArr.length > 1 && solutionArr.length > 1) {
      // Compare arrays (order-insensitive)
      const sortedResp = [ ...responseArr ].sort();
      const sortedSol = [ ...solutionArr ].sort();
      const isMatch = sortedResp.length === sortedSol.length && sortedResp.every((v, i) => v === sortedSol[ i ]);
      if (isMatch) {
        resultMsg = "Success!";
        solutionMsg = mySolution ? mySolution : "";
        alertClass = "success";
      } else {
        resultMsg = "Incorrect";
        solutionMsg = "Please try again";
        alertClass = "error";
      }
    } else if (responseArr.length === 1 && solutionArr.length === 1) {
      // Compare single values
      if (String(responseArr[ 0 ]) === String(solutionArr[ 0 ])) {
        resultMsg = "Success!";
        solutionMsg = myCorrections ? correctionArr[ userResponse-1 ] : (mySolution ? mySolution : "");
        alertClass = "success";
      } else {
        resultMsg = "Incorrect";
        solutionMsg = myCorrections ? correctionArr[ userResponse-1 ] : "Please try again";
        alertClass = "error";
      }
    } else {
      resultMsg = "Incorrect";
      solutionMsg = "<p>Please try again</p>";
      alertClass = "error";
    }
}

  var htmlSolution = solutionMsg ? $.parseHTML( solutionMsg ) : null;
  var solPrint = solutionMsg ? htmlSolution[ 0 ].data : " ";

  // Wrap the result in a USWDS Alert
  const alertHtml = $("<div/>", {
      "class": "usa-alert usa-alert--" + alertClass + " margin-2 shadow-3",
    }).append($('<div/>',{
      "class": "usa-alert__body",
    }).append($("<h4/>", {
      "class":"usa-alert__heading",
      text:resultMsg,
    })).append($("<div/>", {
      "class":"usa-alert__text",
    }).html(solPrint))); 

    processCodeBlocks(alertHtml);     

    displayDiv.html(alertHtml);

  }

// Returns the "questions" array from quizdata
function getQuizQuestions() {  
  const baseURL = window.location.origin;
  var path = window.location.pathname;
  $.ajax({
      type: 'GET',
      url: baseURL + '/assets/js/quiz/quiz.json',
      data: { get_param: 'value' },
      dataType: 'json',
      success: function (data) {
        
        var entry = data.find(q => q.ref === path);
        var questionsarray = entry ? entry.questions : null;
        questions = questionsarray;
      },
      error: function () {
        console.log("Failed to fetch quiz questions");
      },
  });
}

function quizload(){

  getQuizQuestions();
  
  $( "code.no-copy" ).wrap("<div class='language-plaintext highlighter-rouge'><div class='highlight'><pre class='highlight'></pre></div></div>");
  $( "code.copy" ).wrap("<div class='language-plaintext quiz-copy-code highlighter-rouge'><div class='highlight'><pre class='highlight'></pre></div></div>");
  /* $("div.quiz-copy-code").each(function(){
    codeProcess(this);
  }); */

  document.querySelectorAll('.sn-quiz').forEach(quiz => {
    //quiz.addEventListener("submit", () => submitQuiz(quiz));
    quiz.addEventListener("submit", function (e) {
      e.preventDefault();
      submitQuiz(this); 
    });
  });
  document.querySelectorAll('.sn-question').forEach(question => {
    //question.addEventListener("submit", () => submitQuestion(question));
    question.addEventListener("submit", function (e) {
      e.preventDefault();
      submitQuestion(this); 
    });
  });
    document.querySelectorAll('.show-answer').forEach(showbutton => {
      showbutton.addEventListener("click", function () {
        var formid = this.getAttribute("data-parent");
        var form = document.getElementById(formid);
        var dataqid = this.getAttribute("data-qid");
        quizSuccess(formid, dataqid, "Show Answer", form); 
    });
  });
}

module.exports = quizload;