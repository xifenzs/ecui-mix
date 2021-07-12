(function () {
    yiche.util = {
        /**
         * 获取当前 dom/control 所属路由。
         * @public
         *
         * @param {Element | Control} el 当前元素
         */
        getRoute: function (el) {
            var route,
                parent = ecui.dom.parent(el instanceof ecui.ui.Control ? el.getMain() : el);
            for (; parent; parent = ecui.dom.parent(parent)) {
                if (parent === document.body) {
                    break;
                }
                if (parent.route !== undefined) {
                    route = parent.route;
                    break;
                }
            }
            return route;
        },
        /**
         * 将带 <br/> 的字符串 通过<br/> 分割成数组。
         * @public
         *
         * @param {String} value 带 <br/> 的字符串
         */
        parseBR: function (value) {
            return value.split('<br/>');
        },
        /**
         * 获取 input file 上传的文件的名字
         * @public
         *
         * @param {DOM} input  
         */
        getFileName: function (input) {
            var str = /macintosh|mac os x/i.test(navigator.userAgent) ? '/' : '\\';
            var name = '';
            if (input.files && input.files[0]) {
                name = input.files[0].name;
            } else {
                name = (input.lastValue || input.value).split(str).pop();
            }
            return name;
        },
        /**
         * 移除并释放已打开的dialog控件，用于离开路由时调用
         * @public
         *
         */
        removeDialog: function () {
            var dialogContainer = ecui.$('dialogContainer'),
                dialogContainer_1 = ecui.$('dialogContainer_1'),
                dialogContainer_2 = ecui.$('dialogContainer_2');
            if (dialogContainer) {
                ecui.dispose(dialogContainer);
                dialogContainer.innerHTML = '';
            }
            if (dialogContainer_1) {
                ecui.dispose(dialogContainer_1);
                dialogContainer_1.innerHTML = '';
            }
            if (dialogContainer_2) {
                ecui.dispose(dialogContainer_2);
                dialogContainer_2.innerHTML = '';
            }
        },
        /**
         * 初始化dialog控件。
         * @public
         *
         * @param {string|Element} container dialog控件容器
         * @param {string} targetName 模板名称
         * @param {object} options 成功回调函数
         *
         * @return {Control} dialog 控件
         */
        initDialog: function (container, targetName, options) {
            if (typeof container === 'string') {
                container = ecui.$(container);
            }
            ecui.dispose(container);
            container.innerHTML = ecui.esr.getEngine().render(targetName, options);
            ecui.init(container);
            return container.children[0].getControl();
        },
        /**
         * 获取指定元素下的所有指定控件。
         * @public
         *
         * @param {string|Element} el 控件容器
         * @param {string} UIClass 控件名称
         *
         * @return {Array|Control} dialog 控件
         */
        findChildrenControl: function (el, UIClass) {
            if (!el || !UIClass) {
                return [];
            }
            var res = [];
            var queue = [el];
            var item;
            var children;
            while (queue.length !== 0) {
                item = queue.shift();
                if (item.getControl && item.getControl() instanceof UIClass) {
                    res.push(item.getControl());
                    continue;
                }
                children = ecui.dom.toArray(ecui.dom.children(item));
                if (children.length > 0) {
                    queue.push.apply(queue, children);
                }
            }
            return res;
        },
        /**
         * 获取指定元素是否为控件。
         * @public
         *
         * @param {string|Element} el 控件元素
         * @param {string} UIClass 控件名称
         *
         * @return {Control} dialog 控件
         */
        findControl: function (el, UIClass) {
            for (; el; el = ecui.dom.parent(el)) {
                if (el.getControl && el.getControl() instanceof UIClass) {
                    return el.getControl();
                }
            }
            return null;
        },
        /**
         * 刷新顶部导航的选中状态。
         * @public
         *
         * @param {string|Control} navId 控件id
         *
         */
        refreshTopMuneSelectedStatus: function (navId) {
            const nav = ecui.get(navId);
            nav && nav.refreshNavStatus();
        },
        /**
         * 给数字添加千分位符。
         * @public
         *
         * @param {string} value 所要处理的值
         *
         */
        getToThousands: function (value) {
            if (value) {
                if (value.indexOf('.') == -1) {
                    return value.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
                }
                var intSum = value
                    .substring(0, value.indexOf('.'))
                    .replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
                var dot = value.substring(value.length, value.indexOf('.'));
                if (dot.length > 3) {
                    dot = dot.substring(dot.indexOf('.'), 3);
                }
                var ret = intSum + dot;
                return ret;
            }
            return '';
        },
        /**
         * 刷新该控件对应的子路由。
         * @public
         *
         * @param {string|Control} control 控件
         *
         */
        findchildrenRouteAndCall: function (control) {
            const currentRoute = ecui.esr.findRoute(control);
            const children = currentRoute.children;
            if (!children) {
                // eslint-disable-next-line no-undef
                console.warn('该控件只适用在列表筛选数据的地方');
                return;
            }
            if (children.__proto__ === Array.prototype && children.length > 0) {
                children.forEach(item => {
                    ecui.esr.callRoute(item + '~pageNum=1~pageNo=1', true);
                });
            } else if (typeof(children) == 'string' && children.length > 0) {
                ecui.esr.callRoute(children + '~pageNum=1~pageNo=1', true);
            }
        },
        /**
         * 获取指定时间的相对时间。
         * @public
         *
         * @param {string|Control} now 指定的时间
         * @param {Number} dx 相差的天数  正数: 历史时间  负数:简历将来时间
         *
         * @return {string} 获取时间差内的时间
         *  
         */
        getCustomTime: function (now, dx) {
            let baseDay = 24 * 60 * 60 * 1000,
                value = new Date(now.getTime() - dx * baseDay);
            return value.getFullYear() +
                '-' +
                ('0' + (value.getMonth() + 1)).slice(-2) +
                '-' +
                ('0' + value.getDate()).slice(-2);
        },
        /**
         * 本地存储指定名称的内容。
         * @public
         *
         * @param {string} key 名称
         * @param {any} value 内容
         *
         *  
         */
        setSessionStorage: function (key, value) {
            const varHeader = yiche.info.STORAGE_HEADER + key;
            window.sessionStorage.setItem(varHeader, JSON.stringify(value));
        },
        /**
         * 本地获取指定名称的内容。
         * @public
         *
         * @param {string} key 名称
         *
         *  
         */
        getSessionStorage: function (key) {
            const varHeader = yiche.info.STORAGE_HEADER + key;
            return window.sessionStorage.getItem(varHeader);
        },
        /**
         * 本地清除指定名称的内容。
         * @public
         *
         * @param {string} key 名称
         *
         *  
         */
        removeSessionStorage: function (key) {
            const varHeader = yiche.info.STORAGE_HEADER + key;
            window.sessionStorage.removeItem(varHeader);
        },
        /**
         * 清除本地存储的内容。
         * @public
         *
         * @param {string} key 名称
         *
         *  
         */
        clearSessionStorage: function () {
            window.sessionStorage.clear();
        },
        /**
         * 导出Csv文件。
         * @public
         *
         * @param {string} url 接口地址
         * @param {string} params 请求参数
         * @param {string} name 文件名称
         *
         *  
         */
        exportCsvFile: function (url, params, name) {
            ecui.dom.addClass(document.body, 'ui-loading');
            ecui.io.ajax(url, {
                method: 'POST',
                headers: ecui.esr.headers,
                data: JSON.stringify(params),
                onsuccess: function (res) {
                    try {
                        let name0 = decodeURI(name),
                            BOM = '\uFEFF';
                        const blob = new window.Blob([BOM + res], { type: 'text/csv' });
                        const href = URL.createObjectURL(blob);
                        window.URL.createObjectURL(new window.Blob(['\uFEFF' + blob]));
                        let a = document.createElement('a');
                        a.href = href;
                        let newName = name0.replace(/%40/g, '@');
                        a.download = `${newName}.csv`;
                        a.click();
                        URL.revokeObjectURL(href);
                        a = null;
                        ecui.dom.removeClass(document.body, 'ui-loading');
                    } catch (error) {
                        // eslint-disable-next-line no-undef
                        console.warn(error);
                    }

                },
                onerror: function (xhr) {
                    // eslint-disable-next-line no-undef
                    if (onerror) {
                        ecui.dom.removeClass(document.body, 'ui-loading');
                        // eslint-disable-next-line no-undef
                        onerror(xhr);
                    }
                }
            });
        },
        /**
         * 导出非csv文件。
         * @public
         *
         * @param {string} url 接口地址
         * @param {string} params 请求参数
         *
         *  
         */
        exportFile: function (url, params) {
            ecui.io.ajax(url, {
                method: 'POST',
                headers: ecui.esr.headers,
                data: JSON.stringify(params),
                responseType: 'blob',
                onsuccess: function (res, xhr) {
                    let headers = xhr.getAllResponseHeaders().toLowerCase(),
                        arr = headers.trim().split(/[\r\n]+/), // 由于返回的是用\r\n来进行分割的字符串，需要做转换
                        headerMap = {};
                    arr.forEach(function (line) {
                        let parts = line.split(': ');
                        let header = parts.shift();
                        let value = parts.join(': ');
                        headerMap[header] = value;
                    });
                    try {
                        const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
                        const link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = decodeURI(headerMap['content-disposition'].split(';')[1].split('=')[1]);
                        link.click();
                        // eslint-disable-next-line no-const-assign
                        link = null;
                    } catch (error) {
                        // eslint-disable-next-line no-undef
                        console.warn(error);
                    }
                },
                onerror: function (xhr) {
                    // eslint-disable-next-line no-undef
                    if (onerror) {
                        // eslint-disable-next-line no-undef
                        onerror(xhr);
                    }
                }
            });
        },
        post: function (url, data, onsuccess, onerror) {
            ecui.io.ajax(url, {
                method: 'post',
                headers: ecui.esr.headers,
                data: JSON.stringify(data),
                onsuccess: function (text) {
                    try {
                        const data = JSON.parse(text);
                        if (data && data.code !== 0) {
                            ecui.tip('error', data.msg);
                            return;
                        } else {
                            onsuccess(data.data);
                        }
                    } catch (e) {
                        // eslint-disable-next-line no-undef
                        console.warn(e);
                    }
                },
                onerror: function (xhr) {
                    if (onerror) {
                        onerror(xhr);
                    }
                }
            });
        },
        get: function (url, onsuccess, onerror) {
            ecui.io.ajax(url, {
                method: 'get',
                headers: ecui.esr.headers,
                onsuccess: function (text) {
                    try {
                        const data = JSON.parse(text);
                        if (data && data.code !== 0) {
                            ecui.tip('error', data.msg);
                            return;
                        } else {
                            onsuccess(data.data);
                        }
                    } catch (e) {
                        // eslint-disable-next-line no-undef
                        console.warn(e);
                    }
                },
                onerror: function (xhr) {
                    if (onerror) {
                        onerror(xhr, url);
                    }
                }
            });
        },
        /**
         * 获取数据类型。
         * @public
         *
         * @param {string} data 接口地址
         * @return {string} 数据类型
         *
         *  
         */
        getDataType: function (obj) {
            let type = typeof obj;
            if (type !== 'object') {
                return type;
            }
            return Object.prototype.toString.call(obj).replace(/^\[object (\S+)\]$/, '$1');
        },

        // from 值回填
        resetFromsValue: function (name, obj) {
            var tmp = {};
            ecui.esr.parseObject(document.forms[name], tmp);
            ecui.esr.fillForm(
                document.forms[name],
                Object.assign({}, tmp, obj)
            );
        },

        // 检测颜色是否合法
        checkColor: function (value) {
            return !/^[a-fA-F0-9]{6,6}$/.test(value);
        },

        // 防抖(debounce)
        debounce: function (fn, delay) {
            let timer = null;
            return function () {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(fn, delay);
            };
        },

        // 节流(throttle)
        throttle: function (fn, wait) {
            let pre = Date.now();
            return function () {
                let context = this;
                let args = arguments;
                let now = Date.now();
                if (now - pre >= wait) {
                    fn.apply(context, args);
                    pre = Date.now();
                }
            };
        },
        // 刷新页面重置导航相关状态
        reloadPageSetNavOpenStatus: function (control){
            if (!control){
                return;
            }
            let parent = control.getParent();
            if (!parent.$ID && !parent._bIsOpened){
                ecui.dispatchEvent(parent, 'click');
                yiche.util.reloadPageSetNavOpenStatus(parent);
            }
        },
        refreshPageSetNavSelectedStatus: function (){
            const loc = ecui.esr.getLocation().split('~')[0];
            yiche.info.ALL_MENU_ITEMS.forEach(item => {
                if (item._oNavData.route === loc){
                    ecui.dispatchEvent(item, 'click');
                }
            });
        }
    };

    Date.prototype.pattern = function (fmt) {
        var o = {
            'M+': this.getMonth() + 1, //月份
            'd+': this.getDate(), //日
            'h+': this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
            'H+': this.getHours(), //小时
            'm+': this.getMinutes(), //分
            's+': this.getSeconds(), //秒
            'q+': Math.floor((this.getMonth() + 3) / 3), //季度
            'S': this.getMilliseconds() //毫秒
        };
        var week = ['日', '一', '二', '三', '四', '五', '六'];
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '星期' : '周') : '') + week[this.getDay()]);
        }
        for (var k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return fmt;
    };
}());