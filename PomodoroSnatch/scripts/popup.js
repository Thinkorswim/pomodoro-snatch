$(function(){

  $("#controllButton").click(function(){

    if($("#controllButton").hasClass("startPomodoro")){
      $("#controllButton").removeClass("startPomodoro").addClass( "voidPomodoro" );
    }else{
      // TODO reset everything
      $("#controllButton").removeClass("voidPomodoro").addClass( "startPomodoro" );
    }

    chrome.runtime.sendMessage({
      type: "startPomodoro",
    });
  });

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

      if(request.time != request.timeTotal){
        $("#controllButton").removeClass("startPomodoro").addClass( "voidPomodoro" );
      }
    }else if(request.type == "endPomodoro"){
      $("#controllButton").removeClass("voidPomodoro").addClass( "startPomodoro" );
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
