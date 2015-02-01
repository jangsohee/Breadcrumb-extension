function makeUIPopup() {
    var flags = {
        url: window.chrome.extension.getURL("main_ui.html"),
        type: "popup",
        left: 1,
        top: 1,
        width: 400,
        height: window.screen.availHeight - 1 - 1,
        focused: true
    };

    window.chrome.windows.create(flags);
}

function makeTestUIPopup() {
    var flags = {
        url: window.chrome.extension.getURL("test.html"),
        type: "popup",
        left: 401,
        top: 1,
        width: 800,
        height: window.screen.availHeight - 1 - 1,
        focused: true
    };

    window.chrome.windows.create(flags);
}


// 여기서는 왜 DOMContentLoaded가 감지 되는가?
document.addEventListener('DOMContentLoaded', function() {
    makeUIPopup();
    makeTestUIPopup();
});



