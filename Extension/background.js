function makeUIPopup() {
    var flags = {
        url: window.chrome.extension.getURL("main_ui.html"),
        type: "popup",
        left: 1,
        top: 1,
        width: 500,
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
    //makeTestUIPopup();
});



chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.windows.getAll({'populate': true}, function (windows) {
        var i, j;
        for (i = 0; i < windows.length; i++) {
            if (windows[i]) {
                for (j = 0; j < windows[i].tabs.length; j++){
                    if (windows[i].tabs[j].title == "Breadcrumb") {
                        chrome.windows.update(windows[i].id, {'focused': true});
                        break;
                    }
                }

                if(j != windows[i].tabs.length)
                    break;
            }
        }

        if (i == windows.length && j == windows[i-1].tabs.length)
            makeUIPopup();
    });
});