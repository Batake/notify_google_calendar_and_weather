function tomorrow2line() {
  // LINE Notifyのアクセストークン
  var key = Line_Notify_Key;
  var url = "https://notify-api.line.me/api/notify";
  
  // 天気予報
  var weatherMsg = weatherForecast()
  var weatherJson = {message: weatherMsg}
  
  var options =
  {
    "method" : "post",
    "contentType" : "application/x-www-form-urlencoded",
    "payload" : weatherJson,
    "headers": {"Authorization": "Bearer " + key},
    "muteHttpExceptions": true
  };
  
  UrlFetchApp.fetch(url, options);
  
  // カレンダーID
  var calIds = new Array(CalId1, CalId2, CalId3);
  calIds.forEach(function( calId ) {  
    // googleカレンダーより明日の予定を配列で取得。
    var cal = CalendarApp.getCalendarById(calId);
  
    var now = new Date();
    var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    var tomorrowEvent = cal.getEventsForDay(tomorrow);
    // LINE Notifyに送るメッセージ
    var msg = "";
    
    // 予定がない時
    if(tomorrowEvent.length === 0){
      return;
    }
    // 予定がある時
    else{
      msg += allPlanToMsg(tomorrowEvent); //googlecalendar
    }
    
    var jsonData = {
      message: msg
    };
    
    var options =
        {
          "method" : "post",
          "contentType" : "application/x-www-form-urlencoded",
          "payload" : jsonData,
          "headers": {"Authorization": "Bearer " + key},
          "muteHttpExceptions": true
        };
    
    var res = UrlFetchApp.fetch(url, options);
  });
}

function weatherForecast() {
  var response = UrlFetchApp.fetch("http://weather.livedoor.com/forecast/webservice/json/v1?city=130010"); //URL+cityID(今回は東京のID)
  var json=JSON.parse(response.getContentText()); //受け取ったJSONデータを解析して配列jsonに格納
  var weatherInfo = "\n明日の天気： " + json["forecasts"][1]["telop"];
  return weatherInfo
}

// イベントの配列をテキストにして返す
function allPlanToMsg(events/* array */){
  var msg = "";
  events.forEach( function(event, index){
    var title = event.getTitle();
    var start = event.getStartTime().getHours() + ":" + ("0" + event.getStartTime().getMinutes()).slice(-2);
    var end = event.getEndTime().getHours() + ":" + ("0" + event.getEndTime().getMinutes()).slice(-2);
    // 予定が終日の時
    if( event.isAllDayEvent() ){
      msg += "\n" + title;
      return;
    }
    msg += "\n" + title + " " + start + "~" + end;
  });
  return msg;
}