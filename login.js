(function () {
    window.onload = function () {
        var intervalId = setInterval(function () {
            if (ecui.getNamedControls()['login-btn']) {
                clearInterval(intervalId);
                var sUuid = 0;
                //获取验证码
                // var getActive = ecui.get('send-captcha').getOuter();
                var getActiveClick = true;
                var error = ecui.$('error');
                var showError = function (msg) {
                    error.innerHTML = msg;
                    ecui.dom.removeClass(error, 'ui-hide');
                };
                var hideError = function () {
                    error.innerHTML = '';
                    ecui.dom.addClass(error, 'ui-hide');
                };
                var countDown = function () {
                    var time = 60;
                    getActive.style.color = '#cccccc';
                    var timer = setInterval(clock, 1000);
                    clock();
                    function clock() {
                        time--;
                        getActive.value = time + '秒后重发';
                        if (time === 0) {
                            clearInterval(timer);
                            getActive.value = '重获验证码';
                            getActive.style.color = '#368cda';
                            getActiveClick = true;
                        }
                    }
                };
                var login = function () {
                    var data = {
                        userName: encodeURIComponent(ecui.get('mobile').getValue()),
                        password: ecui.get('password').getValue()
                    };
                    // 'userName=' + encodeURIComponent(ecui.get('mobile').getValue()) + '&password=' + ecui.get('password').getBody().value
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
                                localStorage.setItem('token', data.data.id);
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
                // ecui.get('send-captcha').onclick = function () {
                //     if (getActiveClick) {
                //         getActiveClick = false;
                //         ecui.io.ajax('send-sms-captcha', {
                //             method: 'post',
                //             data: 'mobile=' + encodeURIComponent(ecui.get('mobile').getValue()),
                //             headers: {
                //                 'Content-Type': 'application/x-www-form-urlencoded'
                //             },
                //             onsuccess: function (data) {
                //                 data = JSON.parse(data);
                //                 if (data.code === 0) {
                //                     hideError();
                //                     sUuid = data.data.uuid;
                //                     // countDown();
                //                     yiche.showHint('success', '发送成功');
                //                 } else {
                //                     showError(data.msg);
                //                     yiche.showHint('warn', data.msg);
                //                     getActiveClick = true;
                //                 }
                //             },
                //             onerror: function (code, msg) {
                //                 showError(msg);
                //                 yiche.showHint('warn', msg);
                //             }
                //         });
                //     }
                // };
                ecui.get('login-btn').onclick = function () {
                    login();
                };
            }
        }, 10); //以10毫秒位单位重新调整setInterval函数的匿名函数。
    };
}());
