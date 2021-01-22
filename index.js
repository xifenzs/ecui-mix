(function() {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,
        clearHintTimer = util.blank;
    window.yiche = {
        info: {
            iosVersion: /(iPhone|iPad).*?OS (\d+(_\d+)?)/i.test(navigator.userAgent) ? +(RegExp.$2.replace('_', '.')) : undefined,
            ieVersion: /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
            chromeVersion: /Chrome\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
            firefoxVersion: /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
            safariVersion: !/(chrome|crios|ucbrowser)/i.test(navigator.userAgent) && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
            now: util.formatDate(new Date(), 'yyyy-MM-dd'),
            PROJECT_NAME: '左侧导航项目模板', // logo旁的项目名称
            STORAGE_HEADER: 'EFFECT_',
            routeLists: [], // 项目中的全部路由
            API_BASE: '/dsp-console/console/report/', // 接口前缀
        }
    };
    /* 阻止 ie 按删除键会回退页面 - begin */
    function onkeydown(event) {
        var tags = ['INPUT', 'TEXTAREA', 'BUTTON', 'SUBMIT'];
        var target = event.target || event.srcElement;
        if (event.keyCode === 8 && tags.indexOf(target.tagName) < 0) {
            event.keyCode = 0;
            event.returnValue = false;
            return false;
        }
    }
    if (yiche.info.ieVersion < 9) {
        document.attachEvent('onkeydown', onkeydown);
    } else {
        window.addEventListener('keydown', onkeydown);
    }
    /* 阻止 ie 按删除键会回退页面 - end */


    window.requestCount = 0;
    /**
     * request请求前处理函数。
     * @public
     *
     */
    ecui.esr.onbeforerequest = function() {
        window.requestCount++;
        ecui.dom.addClass(document.body, 'ui-loading');
    };

    /**
     * request请求后处理函数。
     * @public
     *
     */
    ecui.esr.onafterrequest = function() {
        window.requestCount = Math.max(0, --window.requestCount);
        if (window.requestCount <= 0) {
            ecui.dom.removeClass(document.body, 'ui-loading');
        }
    };

    /**
     * esr执行异常处理函数。
     * @public
     *
     * @param {object} e 异常对象
     *
     */
    ecui.esr.onexception = function(e) {
        console.warn(e);
    };

    /**
     * request请求结果统一处理函数
     * @public
     *
     * @param {string} url 请求地址
     * @param {object} data 请求参数
     *
     * @return {Object|numer} data.code为0时，返回 data.result ，否则返回 data.code
     */
    var noTipCodes = [300000, 500016];
    ecui.esr.onparsedata = function(url, data) {
        var code = data.code;
        if (0 === code) {
            return data.result;
        }
        if (code === 10302) {
            // 延迟 10ms 执行重定向，防止业务中有跳转登录页逻辑，导致页面跳转不正确
            util.timer(function() {
                location.href = data.result;
            }, 10);
            return;
        } else if (code === 12011) {
            ecui.esr.headers['x-access-token'] = '';
            window.location = './login.html';
        } else if (code === 12012) {
            ecui.tip('error', data.msg);
            if (ecui.esr.DEFAULT_PAGE) {
                ecui.esr.redirect(ecui.esr.DEFAULT_PAGE);
            } else {
                window.location = './login.html';
            }
        } else {
            if (noTipCodes.indexOf(code) < 0) {
                ecui.tip('error', data.message);
            }
        }
        return data.code;
    };
    ecui.esr.onrequesterror = function(err) {
        err.forEach(function(item) {
            if (item.url) {
                try {
                    var errInfo = JSON.parse(item.xhr.response);
                    ecui.globalTips(
                        errInfo.description,
                        'error'
                    );
                } catch (err) {
                    console.warn(err);
                }
            }
        });
    };


    /**
     * esr加载完毕后执行函数
     * @public
     *
     */
    ecui.esr.onready = function() {
        ecui.esr.headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json;charset=UTF-8',
            'customReferer': window.location.href
        };
        // 配合后端重定向，地址栏地址改变时，将 location.href 更新到请求头的 customReferer 字段
        ecui.dom.addEventListener(window, 'hashchange', function(e) {
            // 设置请求头
            ecui.esr.headers.customReferer = window.location.href;
            // 获取当前路由
            const toPath = e.newURL.split('#')[1].split('~')[0];
            if (yiche.info.routeLists.indexOf(toPath) === -1) {
                window.location.href = 'errorPage.html';
            } else {
                yiche.util.refreshTopMuneSelectedStatus('navMenu');
            }
        });

        // 设置 选项控件的文本在 options 中的名称
        ecui.ui.$AbstractSelect.prototype.TEXTNAME = 'code';
        // text输入框 禁用输入历史记录
        var textReady = ecui.ui.Text.prototype.$ready;
        ecui.ui.Text.prototype.$ready = function(event) {
            this.getInput().setAttribute('autocomplete', 'off');
            textReady.call(this, event);
        };
        // combox输入框 禁用输入历史记录
        var comboxReady = ecui.ui.Combox.prototype.$ready;
        ecui.ui.Combox.prototype.$ready = function(event) {
            this.getInput().setAttribute('autocomplete', 'off');
            this._eTextInput.setAttribute('autocomplete', 'off');
            comboxReady.call(this, event);
            ecui.util.timer(function() {
                ecui.setFocused();
                ecui.dispatchEvent(this, 'blur');
            }.bind(this), 100);
        };

        // 设置 默认路由
        ecui.esr.DEFAULT_PAGE = '/doc/index';
        return {
            model: [],
            main: 'base_layout', // 挂载容器
            view: 'contentTarget', // 渲染模板
            onbeforerender: function(context) {
                // 全局信息  菜单  用户信息  面包屑导航
                context.GLOBLE_USER_INFO = {
                    userName: '张三'
                };
                // 路由列表
                context.GLOBLE_ROUTE_LISTS = [{
                    name: '文档',
                    route: '/doc/index',
                    show: true,
                    icon: 'iconfont-yms-icon-07',
                    children: []
                }];
                // 汇总路由
                if (context.GLOBLE_ROUTE_LISTS.length > 0) {
                    let route = [];
                    context.GLOBLE_ROUTE_LISTS.forEach(pItem => {
                        if (pItem.route) {
                            route.push(pItem.route);
                        } else {
                            let itemChild = pItem.children;
                            if (itemChild && itemChild.length > 0) {
                                itemChild.forEach(cItem => {
                                    cItem.route && route.push(cItem.route);
                                })
                            }
                        }
                    })
                    yiche.info.routeLists = JSON.parse(JSON.stringify(route));
                }
                // 面包屑导航
                context.globleCrumbs = [];
                // 菜单折叠
                context.MENU_COLLAPES = true;

            },
            onafterrender: function(context) {

            }
        };
    };
    document.write('<script type="text/javascript" src="_include/util.js"></script>');
    document.write('<script type="text/javascript" src="_include/filter.js"></script>');
    document.write('<script type="text/javascript" src="_include/index.controls.js"></script>');
}());