/**
 * Created by SangBong on 2015-01-29.
 */


/*
    a 태그 카운터 부분
    TODO: a 태그 document 오브젝트에서 받아서 카운팅 해보기
 */
var start_anchors = document.getElementsByTagName('a').length;

var end_anchors = document.anchors;
console.log(start_anchors + " vs " + end_anchors);


/*
    HTML 소스 가져오는 부분

    TODO: 현재 outerText로 텍스트만 가져올 때 전부 다 제대로 못가져오는 현상이 있다.
 */
function getHTML(){
    return document.documentElement.getElementsByTagName('body')[0].innerHTML;
    // return document.documentElement.outerText;
}

$( document ).ready(function() {
    // 소스 전달부
    chrome.runtime.sendMessage({data: getHTML()}, function(response) {
        console.log(response.message);
    });
    console.log("getHTML() is fired");
});


/*
    a 태그 추적 부분
 */

//var alertOnClick = function() {
//    alert("Clicked!");
//};
//
//$("a").on("click", alertOnClick);

/*
왜 DOMContentLoaded 이벤트는 감지가 안될까??
document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({data: getHTML()}, function(response) {
        console.log(response.message + Date.getTime());
    });
    console.log("getHTML() is fired at " + Date.getTime());
}, false);
 */

/*
나중을 위해 남겨둠
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if(request.method == "getText"){
            sendResponse({data: getHTML(), method: "getText"}); //same as innerText
        }
        else if(request.method == "setAutoOn"){
            copyToClipboard(getHTML());
            sendResponse({data: "Auto copy mode is on.", method: "setAutoOn"});
        }
        else if(request.method == "setAutoOff"){
            copyToClipboard(getHTML());
            sendResponse({data: "Auto copy mode is off.", method: "setAutoOff"});
        }
    }
);
 */
