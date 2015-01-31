//function makeUIPopup() {
//    var flags = {
//        url: window.chrome.extension.getURL("main_ui.html"),
//        type: "popup",
//        left: 1,
//        top: 1,
//        width: 400,
//        height: window.screen.availHeight - 1 - 1,
//        focused: true
//    };
//    window.chrome.windows.create(flags);
//}
//
//
//// 여기서는 왜 DOMContentLoaded가 감지 되는가?
//document.addEventListener('DOMContentLoaded', function() {
//    makeUIPopup();
//});


function copyToClipboard( text ){
    var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerText = text;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    document.body.removeChild(copyDiv);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.data)
        {
            copyToClipboard(request.data);
            sendResponse({message: "I've finished to receive your data."});
        }
    });
