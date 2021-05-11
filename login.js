(function () {
    window.onload = function () {
        var intervalId = setInterval(function () {
            if (ecui.getNamedControls()['login-btn']) {
                clearInterval(intervalId);
                var error = ecui.$('error');
                var showError = function (msg) {
                    error.innerHTML = msg;
                    ecui.dom.removeClass(error, 'ui-hide');
                };
                var hideError = function () {
                    error.innerHTML = '';
                    ecui.dom.addClass(error, 'ui-hide');
                };
                var login = function () {
                    var data = {
                        userName: encodeURIComponent(ecui.get('mobile').getValue()),
                        password: ecui.get('password').getValue()
                    };
                    ecui.io.ajax('/serve-user/login', {
                        method: 'post',
                        data: JSON.stringify(data),
                        headers: {
                            'Content-Type': 'application/json;charset=UTF-8'
                        },
                        onsuccess: function (data) {
                            ecui.dom.addClass('ui-hide');
                            data = JSON.parse(data);
                            if (data.code === 0) {
                                hideError();
                                sessionStorage.setItem('token', data.data.id);
                                window.location.href = 'index.html';
                            } else {
                                showError(data.msg);
                                yiche.showHint('warn', data.msg);
                            }
                        },
                        onerror: function (code, msg) {
                            showError(msg);
                            yiche.showHint('warn', msg);
                        }
                    });
                };
                ecui.get('mobile').onkeydown = ecui.get('password').onkeydown = function (event) {
                    if (event.which === 13) {
                        login();
                    }
                };
                ecui.get('login-btn').onclick = function () {
                    login();
                };
            }
        }, 10); //以10毫秒位单位重新调整setInterval函数的匿名函数。
    };
}());