chrome.runtime.onInstalled.addListener(function (object) {
    if(object.reason === 'install'){
      chrome.storage.sync.set({'pomodoroCount': 0});
      // chrome.runtime.openOptionsPage();
    }
});

chrome.browserAction.setBadgeBackgroundColor({ color: "#3498db"});

concentrationTime = 3;
breakTime = 3;

pomodoroInterval = null;
pomodoroCount = 0;
pomodoroCounter = concentrationTime;
pomodoroStage = "concentration";

chrome.storage.sync.get('pomodoroCount', function(data){
  pomodoroCount = data.pomodoroCount;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.type == "startPomodoro"){
    startPomodoro();
    setBadge(getMinutesAndSeconds(pomodoroCounter));
  }else if(request.type == "getPomodoroTime"){
      sendPomodoroTime();
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
    timeTotal: timeTotal
  });
}


function startPomodoro(){
  pomodoroInterval = setInterval( updateTime, 1000 );
}

function stopPomodoro(){
  clearInterval(pomodoroInterval);
  pomodoroInterval = null;
  setBadge('');
  chrome.browserAction.setBadgeBackgroundColor({ color: "#3498db"});
  pomodoroStage = "concentration";
  pomodoroCounter = concentrationTime;
  chrome.runtime.sendMessage({
    type: "endPomodoro"
  });
}

function updateTime(){
    pomodoroCounter -= 1;
    setBadge(getMinutesAndSeconds(pomodoroCounter));

    if(pomodoroCounter == 300){
      createNotification("K");
    }else if(pomodoroCounter == 60){
      createNotification("OK");
    }else if(pomodoroCounter == 10){
      createNotification("Okay");
    }

    if(pomodoroCounter <= 0){
      if(pomodoroStage == "concentration"){
        createNotification("Take a break ! (Pomodoro Snatch)", "The time for concentration is over! Its vital to respeact the break and stop all activity. ");

        // TODO check the count I guesS?
        pomodoroCounter = breakTime;
        pomodoroStage = "break";

        chrome.browserAction.setBadgeBackgroundColor({ color: "#1abc9c"});
        setBadge(getMinutesAndSeconds(pomodoroCounter));
      }else if(pomodoroStage == "break"){
        // TODO Notify
        stopPomodoro();
        // TODO Update total count pomodoros and stuff :|

      }
    }

    sendPomodoroTime();
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
