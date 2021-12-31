$(function(){

  $("#controllButton").click(function(){

    if($("#controllButton").hasClass("startPomodoro")){

      const task = $( "#task-select" ).val();

      $("#controllButton").removeClass("startPomodoro").addClass( "pausePomodoro" );
      $(".btn-close").toggle()
      chrome.runtime.sendMessage({
        type: "startPomodoro",
        task: task
      }); 
    }else if ($("#controllButton").hasClass("pausePomodoro")) {
      $("#controllButton").removeClass("pausePomodoro").addClass( "resumePomodoro" );
      chrome.runtime.sendMessage({
        type: "pausePomodoro",
      }); 
    }else if ($("#controllButton").hasClass("resumePomodoro")) {
      $("#controllButton").removeClass("resumePomodoro").addClass( "pausePomodoro" );
      chrome.runtime.sendMessage({
        type: "pausePomodoro",
      }); 
    }

  });


  $(".btn-close").click(function(){
    chrome.runtime.sendMessage({
      type: "stopPomodoro",
    });
  });

  $(".btn-close").toggle()
  chrome.runtime.sendMessage({
    type: "getPomodoroTime",
  });

  let wholeTime = 0;
  let progressBar = document.querySelector('.e-c-progress');
  let indicator = document.getElementById('e-indicator');
  let pointer = document.getElementById('e-pointer');
  let length = Math.PI * 2 * 100;
  const displayOutput = document.querySelector('.display-remain-time')
  const pauseBtn = document.getElementById('pause');
  const setterBtns = document.querySelectorAll('button[data-setter]');

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.type == "updateTime"){
      wholeTime = request.timeTotal;
      displayTimeLeft(request.time);

      if (request.stage == "break"){
        $("#controllButton").addClass("greeny");
        $(".display-remain-time").css("color", "#1abc9c");
        $(".popup-title").css("color", "#1abc9c");
        $(".e-c-pointer").css("stroke", "#1abc9c");
        $(".e-c-progress").css("stroke", "#1abc9c");
      }
      
      if (request.isPaused) {
        $("#controllButton").removeClass("startPomodoro").addClass( "resumePomodoro" );
      } else {
        if(request.time != request.timeTotal || request.stage == "break"){
          $("#controllButton").removeClass("startPomodoro").addClass( "pausePomodoro" );
        }
      }


    }else if(request.type == "breakStage"){
      $("#controllButton").addClass("greeny");
      $(".display-remain-time").css("color", "#1abc9c");
      $(".popup-title").css("color", "#1abc9c");
      $(".e-c-pointer").css("stroke", "#1abc9c");
      $(".e-c-progress").css("stroke", "#1abc9c");
    }
    else if(request.type == "endPomodoro"){
      $("#controllButton").removeClass("pausePomodoro").addClass( "startPomodoro" );
      $(".display-remain-time").css("color", "#ff3b30");
      $(".popup-title").css("color", "#ff3b30");
      $(".e-c-pointer").css("stroke", "#ff3b30");
      $(".e-c-progress").css("stroke", "#ff3b30");
      $("#controllButton").removeClass("greeny");
      $(".btn-close").toggle();
    }
  });

  progressBar.style.strokeDasharray = length;

  function update(value, timePercent) {
    var offset = - length - length * value / (timePercent);
    progressBar.style.strokeDashoffset = offset;
    pointer.style.transform = `rotate(${360 * value / (timePercent)}deg)`;
  };


  function displayTimeLeft (timeLeft){
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    let displayString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    displayOutput.textContent = displayString;
    update(timeLeft, wholeTime);
  }

});
