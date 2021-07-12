(function () {
    window.yiche = {
        info: {
            iosVersion: /(iPhone|iPad).*?OS (\d+(_\d+)?)/i.test(navigator.userAgent) ? +(RegExp.$2.replace('_', '.')) : undefined,
            ieVersion: /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
            chromeVersion: /Chrome\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
            firefoxVersion: /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
            safariVersion: !/(chrome|crios|ucbrowser)/i.test(navigator.userAgent) && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
            now: ecui.util.formatDate(new Date(), 'yyyy-MM-dd'),
            PROJECT_NAME: '左侧导航模板', // logo旁的项目名称
            STORAGE_HEADER: 'EFFECT_',
            routeLists: [], // 项目中的全部路由
            ALL_MENU_ITEMS: [], // 所有菜单链接
            API_BASE: '/serve-idea/api/', // 接口前缀
            UPLOAD_FILES_HEADER: {}
        }
    };

    window.requestCount = 0;
    // 统计请求,设置loading
    ecui.esr.getBodyData = function (data, headers, url) {
        if (url && url.length > 0) {
            window.requestCount++;
            ecui.dom.addClass(document.body, 'ui-loading');
        }
    };
    /**
     * esr执行异常处理函数。
     * @public
     *
     * @param {object} e 异常对象
     *
     */
    ecui.esr.onexception = function (e) {
        // eslint-disable-next-line no-undef
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
    ecui.esr.onparsedata = function (url, data) {
        window.requestCount = Math.max(0, --window.requestCount);
        if (window.requestCount <= 0) {
            ecui.dom.removeClass(document.body, 'ui-loading');
        }
        var code = data.code;
        if (0 === code) {
            return data.result;
        } else {
            if (code === 12011){
                window.location.href = window.location.origin.match(new RegExp('test', 'g')) ? 'http://test.yiche.slp.com/slp-manage/login.html' : 'https://ad.yiche.com/manager/login';
            }
            ecui.globalTips(
                data.msg,
                'error'
            );
            return data.code;
        }
    };
    ecui.esr.onrequesterror = function (err) {
        window.requestCount = Math.max(0, --window.requestCount);
        if (window.requestCount <= 0) {
            ecui.dom.removeClass(document.body, 'ui-loading');
        }
        err && err.forEach(function (item) {
            if (item.url) {
                try {
                    let errInfo = JSON.parse(item.xhr.response);
                    ecui.globalTips(
                        errInfo.error,
                        'error'
                    );
                } catch (err) {
                    // eslint-disable-next-line no-undef
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
    ecui.esr.onready = function () {
        ecui.esr.headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json;charset=UTF-8',
            'customReferer': window.location.href
        };
        // 配合后端重定向，地址栏地址改变时，将 location.href 更新到请求头的 customReferer 字段
        ecui.dom.addEventListener(window, 'hashchange', function () {
            // 设置请求头
            ecui.esr.headers.customReferer = window.location.href;
            // 获取当前路由
            // const toPath = e.newURL.split('#')[1].split('~')[0];
            // if (yiche.info.routeLists.indexOf(toPath) === -1) {
            // window.location.href = 'errorPage.html';
            // } else {
            // }
            yiche.util.refreshPageSetNavSelectedStatus(); // 同步导航选中状态
        });

        // 设置 选项控件的文本在 options 中的名称
        ecui.ui.$AbstractSelect.prototype.TEXTNAME = 'code';
        // text输入框 禁用输入历史记录
        var textReady = ecui.ui.Text.prototype.$ready;
        ecui.ui.Text.prototype.$ready = function (event) {
            this.getInput().setAttribute('autocomplete', 'off');
            textReady.call(this, event);
        };
        // combox输入框 禁用输入历史记录
        var comboxReady = ecui.ui.Combox.prototype.$ready;
        ecui.ui.Combox.prototype.$ready = function (event) {
            this.getInput().setAttribute('autocomplete', 'off');
            this._eTextInput.setAttribute('autocomplete', 'off');
            comboxReady.call(this, event);
            ecui.util.timer(function () {
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
            onbeforerender: function (context) {
                // 全局信息  菜单  用户信息  面包屑导航
                context.GLOBLE_USER_INFO = {
                    userName: '张三'
                };
                // 路由列表
                context.GLOBLE_ROUTE_LISTS = [{
                    name: '文档',
                    route: '',
                    show: true,
                    level: '1',
                    icon: '',
                    children: [{
                        name: '文档1',
                        route: '',
                        show: true,
                        level: '2',
                        icon: '',
                        children: [
                            {
                                name: '文档2',
                                route: '/doc/index',
                                show: true,
                                level: '3',
                                icon: '',
                                children: []
                            }
                        ]
                    }]
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
                                });
                            }
                        }
                    });
                    yiche.info.routeLists = JSON.parse(JSON.stringify(route));
                }
                // 面包屑导航
                context.globleCrumbs = [];
                // 菜单折叠
                context.MENU_COLLAPES = true;

                // 设置文件上传的请求头
                yiche.info.UPLOAD_FILES_HEADER = {
                    'x-model-name': 'idea',
                    'customReferer': window.location.href,
                    'x-access-token': sessionStorage.getItem('token')
                };

            }
        };
    };
    document.write('<script type="text/javascript" src="_include/util.js"></script>');
    document.write('<script type="text/javascript" src="_include/filter.js"></script>');
    document.write('<script type="text/javascript" src="_include/index.controls.js"></script>');
}());