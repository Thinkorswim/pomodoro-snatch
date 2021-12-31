chrome.runtime.onInstalled.addListener(function (object) {
    if(object.reason === 'install'){
      chrome.storage.sync.set({'pomodoroCount': 0});
      // chrome.runtime.openOptionsPage();
    }
});

chrome.browserAction.setBadgeBackgroundColor({ color: "#ff3b30"});

concentrationTime = 3;
breakTime = 3;

pomodoroInterval = null;
pomodoroCount = 0;
pomodoroCounter = concentrationTime;
pomodoroStage = "concentration";
pomodoroTask = null;
isPaused = false;

chrome.storage.sync.get('pomodoroCount', function(data){
  pomodoroCount = data.pomodoroCount;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.type == "startPomodoro"){
    startPomodoro();
    pomodoroTask = request.task;
    setBadge(getMinutesAndSeconds(pomodoroCounter));
  }else if(request.type == "getPomodoroTime"){
    sendPomodoroTime();
  }else if(request.type == "pausePomodoro"){
    pausePomodoro();
  }else if(request.type == "stopPomodoro"){
    stopPomodoro();
  }
});


function sendPomodoroTime(){
  timeTotal = 0;

  if(pomodoroStage == "concentration"){
    timeTotal = concentrationTime;
  }else if(pomodoroStage == "break"){
    timeTotal = breakTime;
  }

  chrome.runtime.sendMessage({
    type: "updateTime",
    time: pomodoroCounter,
    timeTotal: timeTotal,
    stage: pomodoroStage,
    isPaused: isPaused
  });
}


function startPomodoro(){
  pomodoroInterval = setInterval( updateTime, 1000 );
}

function pausePomodoro(){
  isPaused = !isPaused;
}

function stopPomodoro(){
  clearInterval(pomodoroInterval);
  pomodoroInterval = null;
  setBadge('');
  chrome.browserAction.setBadgeBackgroundColor({ color: "#ff3b30"});
  pomodoroStage = "concentration";
  pomodoroCounter = concentrationTime;
  chrome.runtime.sendMessage({
    type: "endPomodoro"
  });
  sendPomodoroTime();
}

function updateTime(){
    if (!isPaused) {
      pomodoroCounter -= 1;
    
      setBadge(getMinutesAndSeconds(pomodoroCounter));

      if(pomodoroCounter <= 0){
        if(pomodoroStage == "concentration"){
          createNotification("Take a break ! (Pomodoro Snatch)", "The time for concentration is over! Its vital to respeact the break and stop all activity. ");

          // TODO check the count I guesS?
          pomodoroCounter = breakTime;
          pomodoroStage = "break";

          chrome.browserAction.setBadgeBackgroundColor({ color: "#1abc9c"});
          setBadge(getMinutesAndSeconds(pomodoroCounter));

          chrome.runtime.sendMessage({
            type: "breakStage"
          });

          sendPomodoroTime();
        }else if(pomodoroStage == "break"){
          // TODO Notify
          stopPomodoro();
          


        }
      } else {
        sendPomodoroTime();
      }
    }
}

function setBadge(text){
  chrome.browserAction.setBadgeText({"text": text});
}

function getMinutesAndSeconds(time){
  var minutes = (Math.floor(time / 60)).toString();
  var seconds = (time % 60);
  if(seconds < 10){
    seconds = '0' + seconds.toString();
  }
  return minutes + ":" + seconds;
}

function createNotification(title, message){
  notificationOptions = {
    type: 'basic',
    iconUrl: '../images/logo128-full.png',
    title: title,
    message: message
  };

  chrome.notifications.create('reminder', notificationOptions);
}
