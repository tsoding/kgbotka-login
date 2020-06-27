// TODO: link to GitHub repo
// TODO: customizable client_id
var CLIENT_ID = "war5yuqeql96esijz8kt07gahg2rro";

function id(x) { return x; }

function notify(html, className) {
    var notifyBox = document.querySelector("#notify-box");
    notifyBox.className = className || "info";
    notifyBox.innerHTML = html;
}

function validate(token, success, fail) {
    success = success || id;
    fail = fail || id;

    var req = new XMLHttpRequest();

    req.addEventListener("load", function() {
        var res = JSON.parse(this.response);
        if (res.login) {
            success(res.login);
        } else {
            fail({
                'type': 'twitch',
                'payload': res
            });
        }
    });

    req.addEventListener("error", function(res) {
        fail({
            'type': 'error',
            'payload': res
        });
    });

    req.addEventListener("abort", function(res) {
        fail({ 'type': 'aborted' });
    });

    req.open("GET", "https://id.twitch.tv/oauth2/validate");
    req.setRequestHeader("Authorization", "OAuth " + token);
    req.send();
}

function login() {
    document.location = "https://id.twitch.tv/oauth2/authorize?" +
        "client_id=" + CLIENT_ID +
        "&redirect_uri=https://tsoding.org/kgbotka-login" +
        "&response_type=token" +
        "&scope=chat:read+chat:edit+channel:moderate+whispers:read+whispers:edit+channel_editor";
}

function access_token(success, fail) {
    success = success || id;
    fail = fail || id;

    var args = document.location.hash.substr(1).split('&');
    for (var i = 0; i < args.length; ++i) {
        var arg = args[i].split('=');
        if (arg[0] === 'access_token') {
            success(arg[1]);
            return;
        }
    }
    fail();
}

access_token(function (token) {
    notify("Validating credentials...");
    validate(token,
        function(user) {
            notify("Here are your credentials. Copy paste them to your " +
                "<a href='https://github.com/tsoding/kgbotka#secretjson' target='_blank'>" +
                "secret.json</a> file.");
            document.querySelector("#credentials-section").style.display = "block";
            document.querySelector("#credentials").value =
                "\"twitch\": {\n" +
                "    \"account\" : \"" + user + "\",\n" +
                "    \"clientId\" : \"" + CLIENT_ID + "\",\n" +
                "    \"token\" : \"" + token + "\"\n" +
                "}";
        },
        function(err) {
            notify("Error validating the credentials. Refresh and try again.", "error");
            console.error(err);
        });
});
