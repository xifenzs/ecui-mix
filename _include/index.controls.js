yiche.ui = {
    // 导航菜单
    CustomNavs: ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
        }, {
            CustomNavItem: ecui.inherits(ecui.ui.Control,
                function (el, options) {
                    ecui.ui.Control.call(this, el, options);
                    this._oNavData = options.navItem;
                    this._bIsOpened = false;
                    this._bSelectedStatus = false;
                }, {
                    onclick: function (e) {
                        e.stopPropagation();
                        let child = this._oNavData.children;
                        this.handleOpen(child);
                        this.handleSelectedItem(child);
                    },
                    handleOpen: function (child){
                        if (child.length > 0) {
                            this._bIsOpened = !this._bIsOpened;
                            if (this._bIsOpened){
                                this.alterStatus('+opened');
                            } else {
                                this.alterStatus('-opened');
                            }
                        }
                    },
                    handleChangeParentOpenStatus: function (){
                        yiche.util.reloadPageSetNavOpenStatus(this);
                    },
                    handleSelectedItem: function (child){
                        if (child.length === 0 && yiche.info.ALL_MENU_ITEMS && yiche.info.ALL_MENU_ITEMS.length > 0){
                            yiche.info.ALL_MENU_ITEMS.forEach(item => {
                                item.alterStatus('-selected');
                            });
                            this.alterStatus('+selected');
                            this.handleChangeParentOpenStatus();
                        }
                    },
                    init: function (){
                        let child = this._oNavData.children;
                        child.length === 0 && yiche.info.ALL_MENU_ITEMS.push(this);
                    }
                }
            ),
            onready: function (){
                yiche.util.refreshPageSetNavSelectedStatus();
            }
        }
    ),
    // 导航折叠
    CustomNavsCollapse: ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this._sNavId = options.navId;
        }, {
            onclick: function () {
                if (this._sNavId) {
                    let menuControl = ecui.get(this._sNavId);
                    if (!menuControl) {
                        return;
                    }
                    let collapseStatus = menuControl._bCollapse;
                    menuControl.handleCollapse();
                    if (!collapseStatus) {
                        this.alterStatus('+collapsed');
                        yiche.util.setSessionStorage('MENU_COLLAPSE', '1');
                    } else {
                        this.alterStatus('-collapsed');
                        yiche.util.setSessionStorage('MENU_COLLAPSE', '0');
                    }
                }
            },
            onready: function () {
                if (yiche.util.getSessionStorage('MENU_COLLAPSE') === '1') {
                    ecui.dispatchEvent(this, 'click');
                }
            }
        }
    ),
    // 退出登录
    CustomLogout: ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
        }, {
            onclick: function () {
                // ecui.esr.request(
                //     'data@POST /api-v2/user/logout',
                //     function() {
                //         sessionStorage.clear();
                //         window.location.href = 'login.html';
                //     },
                //     function() {
                //         /* 任一请求失败处理逻辑 */
                //     }
                // );
            }
        }
    ),
    // 普通搜索
    CustomTexts: ecui.inherits(
        ecui.ui.Text,
        'custom-search-text',
        function (el, options) {
            ecui.ui.Text.call(this, el, options);
            var clearEl = ecui.dom.create('SPAN', {
                className: 'clear-icon'
            });
            el.appendChild(clearEl);
            this._uClear = ecui.$fastCreate(this.ClearValue, clearEl, this, {});
            var searchEl = ecui.dom.create('SPAN', {
                className: 'search-icon'
            });
            el.appendChild(searchEl);
            this._uSearch = ecui.$fastCreate(this.SearchText, searchEl, this, {});
            this._sCheckRule = options.checkRule;
        }, {
            $input: function (event) {
                ecui.ui.Text.prototype.$input.call(this, event);
                let value = this.getValue();
                if (this._sCheckRule) {
                    let regexp = new RegExp(this._sCheckRule);
                    if (value.match(regexp)) {
                        this._sLastValue = value;
                        return;
                    } else {
                        if (value === '') {
                            this._sLastValue = '';
                        }
                    }
                } else {
                    this._sLastValue = value;
                }
                this.setValue(this._sLastValue || '');
            },
            SearchText: ecui.inherits(ecui.ui.Control, {
                onclick: function () {
                    this.getParent().refresh();
                }
            }),
            ClearValue: ecui.inherits(ecui.ui.Control, {
                onclick: function () {
                    this.getParent().setValue('');
                }
            }),
            onkeydown: function (event) {
                if (event.which === 13) {
                    this.refresh();
                }
            },
            refresh: function () {
                yiche.util.findchildrenRouteAndCall(this);
            }
        }
    ),
    // id 搜索
    CustomNumberTexts: ecui.inherits(
        ecui.ui.Number,
        'custom-search-text',
        function (el, options) {
            ecui.ui.Number.call(this, el, options);
            var clearEl = ecui.dom.create('SPAN', {
                className: 'clear-icon'
            });
            el.appendChild(clearEl);
            this._uClear = ecui.$fastCreate(this.ClearValue, clearEl, this, {});
            var searchEl = ecui.dom.create('SPAN', {
                className: 'search-icon'
            });
            el.appendChild(searchEl);
            this._uSearch = ecui.$fastCreate(this.SearchText, searchEl, this, {});
        }, {
            SearchText: ecui.inherits(ecui.ui.Control, {
                onclick: function () {
                    this.getParent().refresh();
                }
            }),
            ClearValue: ecui.inherits(ecui.ui.Control, {
                onclick: function () {
                    this.getParent().setValue('');
                }
            }),
            onkeydown: function (event) {
                if (event.which === 13) {
                    this.refresh();
                }
            },
            refresh: function () {
                yiche.util.findchildrenRouteAndCall(this);
            }
        }
    ),
    // 点击展开显示子元素
    CustomToggle: ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this._oRowData = options.data;
            this._bVisible = false;
        }, {
            onclick: function () {
                this.asyncLoadChild();
                this.handleToggle();
            },
            // 展开 收起
            handleToggle: function () {
                let parentEl = ecui.dom.parent(this.getMain());
                if (!ecui.dom.hasClass(parentEl, 'ec-custom-toggle-wrap')) {
                    return;
                }
                if (this._bVisible) {
                    ecui.dom.removeClass(parentEl, 'ec-custom-toggle-wrap-show');
                } else {
                    ecui.dom.addClass(parentEl, 'ec-custom-toggle-wrap-show');
                }
                this._bVisible = !this._bVisible;
            },
            // 子元素相关操作
            asyncLoadChild: function () {

            }
        }
    ),
    // 下拉
    CustomSelect: ecui.inherits(
        ecui.ui.Select,
        function (el, options) {
            ecui.ui.Select.call(this, el, options);
        }, {
            onchange: function () {
                if (!this.getValue()) {
                    return;
                }
                yiche.util.findchildrenRouteAndCall(this);
            }
        }
    ),
    // 下拉搜索
    CustomCombox: ecui.inherits(ecui.ui.Combox, {
        onchange: function () {
            if (!this.getValue()) {
                return;
            }
            yiche.util.findchildrenRouteAndCall(this);
        }
    }),

    // 日期范围筛选
    CustomTimers: ecui.inherits(frd.RangeSelectDate, {
        onchange: function () {
            this.setValue(this._uRangeCalendar.getSelectDates());
            this._uRangeCalendar.hide();
            yiche.util.findchildrenRouteAndCall(this);
        }
    }),

    SelectedCustomerTime: ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this._sRouteName = options.routeName; //要刷新的路由名称
        }, {
            CustomerSelect: ecui.inherits(
                ecui.ui.Select,
                function (el, options) {
                    this._sDefaultValue = options.defaultValue; //默认值
                    ecui.ui.Select.call(this, el, options);
                }, {
                    onchange: function () {
                        let calendarControl = this.getParent().calendarControl,
                            beginDate = new Date(),
                            endDate = new Date();
                        if (this.getValue() === '0') { // 今日
                        } else if (this.getValue() === '1' || this.getValue() === '7' || this.getValue() === '15' || this.getValue() === '30') { // 1:昨天 7:过去7天 15:过去15天 (不包括今天)
                            beginDate.setDate(beginDate.getDate() - this.getValue());
                            endDate.setDate(endDate.getDate() - 1);
                        } else if (this.getValue() === 'nw') { // 本周(包括今天)
                            let cur = beginDate.getDay();// 看是本周的第几天
                            if (cur === 0) {
                                beginDate.setTime(beginDate.getTime() - 6 * 24 * 60 * 60 * 1000);
                            } else {
                                beginDate.setTime(beginDate.getTime() - (cur - 1) * 24 * 60 * 60 * 1000);
                            }
                        } else if (this.getValue() === 'pw') { // 上周
                            let cur = beginDate.getDay(), // 看是本周的第几天
                                temp = cur === 0 ? beginDate.getDate() :  beginDate.getDate() - cur;
                            beginDate.setDate(temp - 6);
                            endDate.setDate(temp);
                        } else if (this.getValue() === 'nm') { // 本月(包括今天)
                            beginDate.setDate(1);
                            endDate.setMonth(beginDate.getMonth() + 1); // 本月加一即为下个月
                            endDate.setDate(1); // 设置为本月的第一天
                            endDate.setDate(endDate.getDate() - 1); //本月第一天减一天即为上月的最后一天
                        } else if (this.getValue() === 'pm') { // 上月
                            beginDate.setDate(1); // 必须先设置日,再设置月, 否则会在 31 号查看时会出现显示问题
                            beginDate.setMonth(beginDate.getMonth() - 1); // 本月减一即为上月
                            endDate.setDate(1); // 设置为本月的第一天
                            endDate.setDate(endDate.getDate() - 1); //本月第一天减一天即为上月的最后一天
                        } else if (this.getValue() === 'ny') { // 本年(包括今天)
                            beginDate.setMonth(0);
                            beginDate.setDate(1);
                            endDate.setMonth(11);
                            endDate.setDate(31);
                        }
    
                        let beginDateString = ecui.util.formatDate(new Date(beginDate), "yyyy-MM-dd"),
                            endDateString = ecui.util.formatDate(new Date(endDate), "yyyy-MM-dd");
                        calendarControl.setRangeValue([beginDateString, endDateString]);
                        calendarControl._uBeginInput.setValue(beginDateString);
                        calendarControl._uEndInput.setValue(endDateString);
    
                        if (this.getValue() === '-1') { //自定义
                            calendarControl._uBeginInput.setValue('');
                            calendarControl._uEndInput.setValue('');
                        }
                        this.getParent().callRoute();
                    },
    
                    Item: ecui.inherits(
                        ecui.ui.Select.prototype.Item,
                        'ui-select-item', {
                            $click: function (event) {
                                ecui.ui.Item.prototype.$click.call(this, event);
                                if (this.getValue() !== '-1') {
                                    // 日期的自定义，什么都不干
                                    let parent = this.getParent();
                                    parent._uOptions.hide();
                                    if (parent.getSelected() !== this) {
                                        parent.setSelected(this);
                                        ecui.dispatchEvent(parent, 'change', event);
                                    }
                                }
                            }
                        }
                    ),
    
                    onready: function () {
                        let parent = this.getParent(),
                            selectControls = ecui.query(function (item) {
                                return item instanceof parent.CustomerSelect && ecui.dom.contain(parent.getMain(), item.getMain());
                            }, this);
                        if (selectControls.length > 0) {
                            parent.selectControl = selectControls[0];
                        }
                        !this.getValue() && this.setValue(this._sDefaultValue + '');
                    }
                }
            ),
    
            CustomerRangeCalendarInput: ecui.inherits(
                frd.RangeSelectDate,
                function (el, options) {
                    frd.RangeSelectDate.call(this, el, options);
                    this._sTimePlaceString = options.timePlaceString;
                    this._sStartValue = options.startValue; 
                    this._sEndValue = options.endValue; 
                }, {
                    onready: function () {
                        let parent = this.getParent(),
                            calendarControls = ecui.query(function (item) {
                                return item instanceof parent.CustomerRangeCalendarInput && ecui.dom.contain(parent.getMain(), item.getMain());
                            }, this);
                         
                        if (calendarControls.length > 0) {
                            parent.calendarControl = calendarControls[0];
                        }
                        this.setRangeValue([this._sStartValue, this._sEndValue]);
                    },
    
                    onchange: function () {
                        frd.RangeSelectDate.prototype.onchange.call(this);
                        this.getParent().selectControl.setValue('-1');
                        
                        this.getParent().callRoute();
                    }
                }
            ),

            callRoute: function (){
                this._sRouteName && ecui.esr.callRoute(this._sRouteName + '~pageNo=1~pageNum=1', true);
            }
        }
    ),

    // 编辑输入
    CustomInputTexts: ecui.inherits(
        ecui.ui.Text,
        'custom-text',
        function (el, options) {
            ecui.ui.Text.call(this, el, options);
            this.oRules = options.rules;
            var clearEl = ecui.dom.create('SPAN', {
                className: 'clear-icon'
            });
            el.appendChild(clearEl);
            this._uClear = ecui.$fastCreate(this.ClearValue, clearEl, this, {});
            this._eParentEl = ecui.dom.parent(el);
        }, {
            ClearValue: ecui.inherits(ecui.ui.Control, {
                onclick: function () {
                    this.getParent().setValue('');
                }
            }),
            handleCheck: function () {
                let check = this.isEditControl();
                if (!this.oRules || !check) {
                    return;
                }
                const { message, reg } = this.oRules;
                let regexp = new RegExp(reg);
                let value = this.getValue();
                if (!value.match(regexp)) {
                    let errorInfoEl = this._eParentEl.querySelector('.error-info');
                    if (errorInfoEl) {
                        errorInfoEl.innerHTML = message;
                    }
                    ecui.dispatchEvent(this, 'error');
                    return;
                }
                if (value && this._eParentEl) {
                    ecui.dom.removeClass(this._eParentEl, 'item-error');
                }
            },
            onblur: function () {
                this.handleCheck();
            },
            onerror: function () {
                let check = this.isEditControl();
                if (!check) {
                    return;
                }
                ecui.dom.addClass(this._eParentEl, 'item-error');
            },
            isEditControl: function () {
                let res = false;
                if (this._eParentEl) {
                    res = ecui.dom.hasClass(this._eParentEl, 'edit-form-item');
                }
                return res;
            }
        }
    ),

    // 编辑下拉
    CustomEditSelect: ecui.inherits(
        ecui.ui.Select,
        function (el, options) {
            ecui.ui.Select.call(this, el, options);
            this._eParentEl = ecui.dom.parent(el);
        }, {
            onchange: function () {
                let value = this.getValue(),
                    check = this.isEditControl();
                if (value && check) {
                    ecui.dom.removeClass(this._eParentEl, 'item-error');
                }
            },
            onerror: function () {
                let check = this.isEditControl();
                if (!check) {
                    return;
                }
                ecui.dom.addClass(this._eParentEl, 'item-error');
            },
            isEditControl: function () {
                let res = false;
                if (this._eParentEl) {
                    res = ecui.dom.hasClass(this._eParentEl, 'edit-form-item');
                }
                return res;
            }
        }
    ),

    // 图表
    Echarts: ecui.inherits(
        ecui.ui.Control,
        'echarts',
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this.reqDataName = options.reqDataName;
            this.echartInfo = options.echartInfo;
            this.contentEl = ecui.dom.create('div', { className: 'chart-content' });
            this.emptyMaskEl = ecui.dom.create('div', { className: 'empty-echarts ui-hide', innerHTML: '' });
            el.appendChild(this.contentEl);
            el.appendChild(this.emptyMaskEl);
            this.content = ecui.$fastCreate(ecui.ui.Control, this.contentEl, this);
            this.emptyMask = ecui.$fastCreate(ecui.ui.Control, this.emptyMaskEl, this);

        }, {
            onready: function () {
                this.getMain().style.width = this.getWidth() + 'px';
                this.chart = echarts.init(this.content.getMain());
                if (this.echartInfo && this.echartInfo.immediate) {
                    let echartInfo = this.echartInfo;
                    this.render(echartInfo);
                }
                this.chart.on('legendselectchanged', function (param) {
                    var selected = [];
                    for (var key in param.selected) {
                        if (param.selected[key]) {
                            selected.push(key);
                        }
                    }
                    if (selected.length < 1) {
                        this.chart.dispatchAction({
                            type: 'legendSelect',
                            name: param.name
                        });
                    }
                }.bind(this));
                ecui.dom.addEventListener(window, 'resize', yiche.util.debounce(this.resizeCharts.bind(this), 200));
            },
            isEmpty: function () {
                return this.emptyMask.isShow();
            },
            reqSuccess: function (data) {
                const that = this;
                that.chart.hideLoading();
                if (!that.content.isShow()) {
                    that.emptyMask.hide();
                    that.content.show();
                }
                try {
                    const option = that.transfromEchartOptions(data);
                    that.chart.setOption(option, true);
                } catch (error) {
                    that.emptyMask.show();
                    that.content.hide();
                }
            },
            // 处理 图表相关数据
            transfromEchartOptions: function () {
                let option = {};
                return option;
            },
            reqFail: function (xhr) {
                var err = JSON.parse(xhr.response);
                ecui.globalTips(
                    err.description,
                    'error'
                );
                this.chart.hideLoading();
                if (!this.emptyMask.isShow()) {
                    this.emptyMask.show();
                    this.content.hide();
                    ecui.dispatchEvent(this, 'emptyevent');
                }
                return;
            },
            render: function (echartInfo) {
                if (!this.chart) {
                    return;
                }
                const { url, method, params, defaultOption } = echartInfo;
                if (echartInfo.defaultOption && JSON.stringify({}) !== JSON.stringify(echartInfo.defaultOption)) {
                    if (!this.content.isShow()) {
                        this.emptyMask.hide();
                        this.content.show();
                    }
                    this.chart.setOption(defaultOption, true);
                    return;
                }
                if (url && method && params) {
                    this.chart.showLoading('default', {
                        text: '',
                        color: '#4466FF'
                    });
                    if (method === 'post') {
                        yiche.util.post(url, params, this.reqSuccess.bind(this), this.reqFail.bind(this));
                    } else {
                        yiche.util.get(url, this.reqSuccess.bind(this), this.reqFail.bind(this));
                    }
                }

            },
            resizeCharts: function () {
                this.chart.resize();
            },
            $dispose: function () {
                ecui.ui.Control.prototype.$dispose.call(this);
                ecui.dom.removeEventListener(window, 'resize', yiche.util.debounce(this.resizeCharts.bind(this), 200));
                this.chart && this.chart.dispose();
            }
        }
    ),

    // 分页
    Pagination: ecui.inherits(frd.Pagination,
        function (el, options) {
            this._nPageSizeOption = options.pageSizeOptions || [20, 50, 100];
            frd.Pagination.call(this, el, options);
        }, {
            hascreatePageSize: function () {
                if (this._nPageSizeOption) {
                    let sizeHtml = '';
                    this._nPageSizeOption.forEach(item => {
                        sizeHtml += `<div ui="value:${item}">${item}条/页</div>`;
                    });
                    this._ePageSize = ecui.dom.create('DIV', {
                        className: 'page-size',
                        innerHTML: sizeHtml
                    });
                }
                return true;
            },
            Pages: ecui.inherits(
                frd.Pagination.prototype.Pages, {
                    setPageInfoContent: function (pageNo, size, count, total) {
                        this.getParent()._uPageInfo.setContent(
                            '共 ' + total + ' 条数据'
                        );
                    }
                }
            )
        }
    ),

    // 单选
    CustomRadio: ecui.inherits(
        frd.SimulationRadio,
        function (el, options) {
            this._bRefresh = options.refreshChildRoute || false;
            frd.SimulationRadio.call(this, el, options);
        }, {
            onchange: function () {
                if (this._bRefresh) {
                    this.refresh();
                }
            },
            refresh: function () {
                yiche.util.findchildrenRouteAndCall(this);
            }
        }
    ),

    // 复选
    CustomCheckbox: ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            this._oItemData = options.itemData;
            this._sScopedName = options.scopedName;
            ecui.ui.Control.call(this, el, options);
        }, {
            onready: function () {
                let { checked } = this._oItemData;
                if (checked) {
                    this.alterStatus('+checked');
                }
            },
            onclick: function () {
                this.changeStatus();
                this.handleChange && this.handleChange();
            },
            changeStatus: function () {
                let { checked } = this._oItemData;
                if (checked) {
                    this.alterStatus('-checked');
                } else {
                    this.alterStatus('+checked');
                }
                this._oItemData.checked = !this._oItemData.checked;
            },
            getData: function () {
                if (!this._sScopedName) {
                    return {
                        itemLength: '',
                        list: []
                    };
                }
                let scopedEl = ecui.$(this._sScopedName),
                    checkboxList = this.findChildrenControl(scopedEl),
                    len = checkboxList.length,
                    res = [];
                if (len > 0) {
                    checkboxList.forEach(item => {
                        if (item._oItemData.checked) {
                            res.push(item._oItemData);
                        }
                    });
                }
                return {
                    itemLength: len,
                    list: res
                };
            },
            findChildrenControl: function (el) {
                return yiche.util.findChildrenControl(el, yiche.ui.CustomCheckbox);
            },
            handleChange: null
        }
    ),
    CustomCheckboxSelectAll: ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            this._sScopedName = options.scopedName;
            ecui.ui.Control.call(this, el, options);
        }, {
            onclick: function () {
                let { len, nowLen } = this.getData();
                if (len !== nowLen) {
                    this.alterStatus('-part');
                    this.alterStatus('+checked');
                    this.setData(true);
                } else {
                    this.alterStatus('-checked');
                    this.alterStatus('-part');
                    this.setData(false);
                }
            },
            changeStatus: function (len, nowLen) {
                // 全选
                if (len === nowLen) {
                    this.alterStatus('-part');
                    this.alterStatus('+checked');
                } else if (nowLen < len && nowLen > 0) {
                    // 半选
                    this.alterStatus('-checked');
                    this.alterStatus('+part');
                } else {
                    // 未选
                    this.alterStatus('-checked');
                    this.alterStatus('-part');
                }
            },
            getData: function () {
                let scopedEl = ecui.$(this._sScopedName),
                    checkBoxControls = this.findChildrenControl(scopedEl),
                    len = checkBoxControls.length,
                    res = [],
                    oldData = [];
                if (len > 0) {
                    checkBoxControls.forEach(item => {
                        if (item._oItemData.checked) {
                            res.push(item._oItemData);
                        }
                        oldData.push(item._oItemData);
                    });
                }
                let nowLen = res.length;
                return {
                    len,
                    nowLen,
                    res,
                    oldData
                };
            },
            findChildrenControl: function (el) {
                return yiche.util.findChildrenControl(el, yiche.ui.CustomCheckbox);
            },
            setData: function (flag) {
                let scopedEl = ecui.$(this._sScopedName),
                    checkBoxControls = this.findChildrenControl(scopedEl),
                    len = checkBoxControls.length;
                if (len > 0) {
                    checkBoxControls.forEach(item => {
                        if (flag) {
                            if (!item._oItemData.checked) {
                                ecui.dispatchEvent(item, 'click');
                            }
                        } else {
                            if (item._oItemData.checked) {
                                ecui.dispatchEvent(item, 'click');
                            }
                        }
                    });
                }
            },
            onready: function () {
                let timer = setTimeout(() => {
                    this.refreshStatus();
                    clearTimeout(timer);
                }, 0);
            },
            refreshStatus: function () {
                let { len, nowLen } = this.getData();
                this.changeStatus(len, nowLen);
            }
        }
    ),

    // 树结构单选
    CustomTreeSelect: ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this._oResData = null;
        }, {
            CustomItem: ecui.inherits(
                ecui.ui.Control,
                function (el, options) {
                    ecui.ui.Control.call(this, el, options);
                    this._oRowData = options.data;
                }, {
                    hasExpend: function () {
                        let el = this.getMain();
                        return ecui.dom.hasClass(el, 'tree-item-expend');
                    },
                    onclick: function (e) {
                        let targetEl = e.target;
                        this.handleCollapse(targetEl);
                    },
                    handleCollapse: function (dom) {
                        if (this._oRowData.children.length > 0) {
                            if (!ecui.dom.hasClass(dom, 'icon-open')) {
                                return;
                            }
                            let el = this.getMain();
                            if (this.hasExpend()) {
                                ecui.dom.removeClass(el, 'tree-item-expend');
                            } else {
                                ecui.dom.addClass(el, 'tree-item-expend');
                            }
                        }
                    },
                    CustomChildItem: ecui.inherits(
                        ecui.ui.Control,
                        function (el, options) {
                            ecui.ui.Control.call(this, el, options);
                            this._oChildItemData = options.data;
                        }, {
                            onclick: function (e) {
                                e.stopPropagation();
                                this.getParent().getParent().clearStatus();
                                this.alterStatus('+actived');
                                this.getParent().getParent().setValue(this._oChildItemData);
                            }
                        }
                    )
                }
            ),
            setValue: function (obj) {
                this._oResData = obj;
            },
            // 外部设置值
            handleSetValue(id) {
                let allCustomItem = yiche.util.findChildrenControl(this.getMain(), this.CustomItem);
                if (allCustomItem && allCustomItem.length > 0) {
                    allCustomItem.forEach(item => {
                        if (item._oRowData.children.length > 0) {
                            let child = yiche.util.findChildrenControl(item.getMain(), item.CustomChildItem);
                            if (child && child.length > 0) {
                                child.forEach(cItem => {
                                    if (cItem._oChildItemData.id == id) {
                                        ecui.dispatchEvent(cItem, 'click');
                                    }
                                });
                            }
                        }
                    });
                }
            },
            getValue: function () {
                return this._oResData;
            },
            clearStatus: function () {
                let allCustomItem = yiche.util.findChildrenControl(this.getMain(), this.CustomItem);
                if (allCustomItem && allCustomItem.length > 0) {
                    allCustomItem.forEach(item => {
                        if (item._oRowData.children.length > 0) {
                            let child = yiche.util.findChildrenControl(item.getMain(), item.CustomChildItem);
                            if (child && child.length > 0) {
                                child.forEach(cItem => {
                                    cItem.alterStatus('-actived');
                                });
                            }
                        }
                    });
                }
            },
            SearchItem: ecui.inherits(
                ecui.ui.Text,
                'custom-search-text',
                function (el, options) {
                    ecui.ui.Text.call(this, el, options);
                    var clearEl = ecui.dom.create('SPAN', {
                        className: 'clear-icon'
                    });
                    el.appendChild(clearEl);
                    this._uClear = ecui.$fastCreate(this.ClearValue, clearEl, this, {});
                    var searchEl = ecui.dom.create('SPAN', {
                        className: 'search-icon'
                    });
                    el.appendChild(searchEl);
                    this._uSearch = ecui.$fastCreate(this.SearchText, searchEl, this, {});
                    this._sCheckRule = options.checkRule;
                }, {
                    SearchText: ecui.inherits(ecui.ui.Control, {
                        onclick: function () {
                            const value = this.getParent().getValue();
                            this.getParent().getParent().handleSearch(value);
                        }
                    }),
                    ClearValue: ecui.inherits(ecui.ui.Control, {
                        onclick: function () {
                            this.getParent().setValue('');
                        }
                    })
                }
            ),
            handleSearch: function (value) {
                let allCustomItem = yiche.util.findChildrenControl(this.getMain(), this.CustomItem);
                if (allCustomItem && allCustomItem.length > 0) {
                    allCustomItem.forEach(item => {
                        if (item._oRowData.children.length > 0) {
                            let child = yiche.util.findChildrenControl(item.getMain(), item.CustomChildItem),
                                len = child.length,
                                count = 0;
                            if (child && len > 0) {
                                child.forEach(cItem => {
                                    if (value !== '') {
                                        cItem.hide(cItem);
                                        if (cItem._oChildItemData.id == value || cItem._oChildItemData.name.indexOf(value) !== -1) {
                                            cItem.show();
                                            count = count + 1;
                                        }
                                    } else {
                                        cItem.show();
                                        count = count + 1;
                                    }
                                });
                                if (count === 0) {
                                    item.hide();
                                } else {
                                    item.show();
                                }
                            }
                        }
                    });
                }
            }
        }
    ),

    // 文件上传 
    CustomUploads: ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this._sFileType = options.fileType || '0'; // 0: 文件 1:图片 2:视频
            this._sUploadUrl = `${yiche.info.API_BASE}${options.url}` || '/serve-idea/api/file/upload'; // 上传地址
            this._sCheckFileInfo = options.checkFileInfo || {
                size: 99999999999,
                msg: '不限制文件大小!'
            }; // 文件大小校验信息
            this._nMaxCount = options.maxCount || 1; //一次最大可上传数量
            this._sPreviewType = options.preview || 'a'; //一次最大可上传数量 a:打开一个新窗口预览  m: 当前页出现一个蒙层进行预览
            this._oFileValues = options.fileList; // 回显文件
            this._sFileParamsName = options.fileParamName || 'file'; //请求参数名称定义
        }, {
            SelectFiles: ecui.inherits(
                ecui.ui.Upload,
                function (el, options) {
                    ecui.ui.Upload.call(this, el, options);
                    this._eFiles = el.querySelector('input');
                }, {
                    onclick: function () {
                        this._eFiles.click();
                        this.alterStatus('-error');
                    },
                    $ready: function () {}, // 覆盖原始方法
                    init: function (event) {
                        ecui.ui.Upload.prototype.init.call(this, event);
                        ecui.dom.addEventListener(this._eFiles, 'change', this.getParent().handleGetFiles.bind(this));
                    }
                }
            ),
            // 获取选中的文件信息
            handleGetFiles: function (e) {
                let files = [],
                    fileInputEl = this._eFiles, // 选择文件控件
                    selectEl = this,
                    canUpload = true;
                // 获取文件上传控件
                let customUploads = selectEl.getParent() || null;
                if (!e.target.files || !customUploads) {
                    return;
                }
                files = Array.prototype.slice.call(e.target.files, 0);
                const fileLength =  files.length;
                if (fileLength === 0) {
                    return;
                }

                // 校验文件数量
                if (!customUploads.checkMaxuploadNumber(fileLength)){
                    fileInputEl.value = '';
                    return;
                }

                // 校验文件大小
                if (customUploads._sCheckFileInfo) {
                    for (let i = 0; i < fileLength; i++) {
                        const file = files[i],
                            fileName = file.name,
                            size = file.size;
                        // 1M文件的大小是1048576（1*1024*1024）
                        if (size / 1024 > customUploads._sCheckFileInfo.size) {
                            ecui.tip('error', `${fileName}${customUploads._sCheckFileInfo.msg}`);
                            canUpload = false;
                            return;
                        }
                        // 检验文件是否重复上传
                        canUpload = customUploads.checkFileRepeat(fileName);
                    }
                }

                if (!canUpload) {
                    return;
                }
                // 自定义请求名称
                const paramFileName = customUploads._sFileParamsName;
                // 上传文件
                let fileSecCount = files.length;
                files.forEach(file => {
                    // 当前文件名称
                    const currentName = file.name;
                    // 添加占位元素
                    let itemFileInfo = {
                        name: file.name,
                        uploadStatus: false
                    };
                    customUploads.addFileItem(itemFileInfo, 'add');

                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function () {
                        const data = new FormData();
                        data.append(paramFileName, file);
                        ecui.io.ajax(customUploads._sUploadUrl, {
                            method: 'POST',
                            data: data,
                            headers: yiche.info.UPLOAD_FILES_HEADER,
                            onupload: function (e) {
                                const percent = Math.round(e.loaded / e.total * 100);
                                customUploads.updateProgressStatus(percent, currentName);
                            },
                            onsuccess: function (res) {
                                if (typeof res == 'string') {
                                    res = JSON.parse(res);
                                }
                                if (res.errorCode === 0) {
                                    customUploads.uploadSuccess(res.data, currentName);
                                } else {
                                    ecui.globalTips(
                                        res.msg,
                                        'error'
                                    );
                                    customUploads.uploadFail(currentName);
                                }
                                // 解决前后2次选同一个文件不触发file的change事件
                                fileSecCount--;
                                if (fileSecCount === 0) {
                                    fileInputEl.value = '';
                                }
                            },
                            onerror: function () {
                                customUploads.uploadFail(currentName);
                                // 解决前后2次选同一个文件不触发file的change事件
                                fileSecCount--;
                                if (fileSecCount === 0) {
                                    fileInputEl.value = '';
                                }
                            }
                        });
                    };
                });
                // 文件数达到最大时隐藏文件上传按钮
                customUploads.handleHideSelectFilesBtn();
            },
            uploadSuccess: function (res, name) {
                let fileItem = this.getMain().getControl().FileItem;
                let itemFiles = yiche.util.findChildrenControl(this.getMain(), fileItem).filter(i => i._oData.name === name);
                let current = itemFiles[0],
                    itemEl = current.getMain();
                ecui.dom.removeClass(itemEl, 'loading');
                if (res instanceof Object) {
                    current._oData = Object.assign(current._oData, res, {
                        uploadStatus: true
                    });
                } else {
                    current._oData = Object.assign(current._oData, {
                        url: res,
                        name: res,
                        uploadStatus: true
                    });
                }
                if (this._sFileType === '1') {
                    itemEl.querySelector('.item-file-wrap img').src = res;
                    itemEl.querySelector('.mask a').href = res;
                }
                if (this._sFileType === '2') {
                    itemEl.querySelector('.item-file-wrap video').src = res;
                    itemEl.querySelector('.mask a').href = res;
                }
            },
            uploadFail: function (name) {
                let fileItem = this.getMain().getControl().FileItem;
                let itemFiles = yiche.util.findChildrenControl(this.getMain(), fileItem).filter(i => i._oData.name === name);
                let current = itemFiles[0],
                    itemEl = current.getMain();
                ecui.dom.removeClass(itemEl, 'loading');
                ecui.dom.removeClass(itemEl, 'success');
                ecui.dom.addClass(itemEl, 'fail');
            },
            FileItem: ecui.inherits(
                ecui.ui.Control,
                function (el, options) {
                    ecui.ui.Control.call(this, el, options);
                    this._oData = options.rowData;

                }, {
                    onclick: function (e) {
                        let el = e.target;
                        if (!ecui.dom.hasClass(el, 'iconfont')) {
                            return;
                        }
                        // 删除
                        if (ecui.dom.hasClass(el, 'del-icon')) {
                            let wrapEl = this.getMain(),
                                selectFile = this.getParent().getMain().querySelector('.ui-upload').getControl();
                            if (!selectFile.isShow()) {
                                selectFile.show();
                            }
                            ecui.dispose(wrapEl);
                            ecui.dom.remove(wrapEl);
                            return;
                        }
                        // 预览
                        let parent = this.getParent().getMain().getControl();
                        if (parent._sPreviewType === 'm' && ecui.dom.hasClass(el, 'handle-prewiew-img')) {
                            let currentName = this._oData.name,
                                fileItem = parent.FileItem,
                                itemFiles = yiche.util.findChildrenControl(parent.getMain(), fileItem);
                            if (itemFiles.length === 0) {
                                return;
                            }
                            let list = [],
                                current = -1;
                            itemFiles.forEach((item, index) => {
                                list.push(item._oData);
                                if (item._oData.name === currentName) {
                                    current = index;
                                }
                            });
                            ecui.get('handlePreview').initPreview(list, current);
                        }
                    }
                }
            ),
            addFileItem: function (file, type) {
                let fileListWrpaEl = this.getMain().querySelector('.file-list-wrap');
                if (!fileListWrpaEl) {
                    return;
                }
                let tempEl = ecui.dom.create({
                    innerHTML: ecui.esr.getEngine().render('customUploadFileTarget', {
                        timestamp: Date.now(),
                        file,
                        type,
                        viewType: this._sFileType,
                        preview: this._sPreviewType
                    })
                });
                let fileItemEl = ecui.dom.first(tempEl);
                ecui.dom.insertBefore(fileItemEl, ecui.dom.last(fileListWrpaEl));
                ecui.init(fileItemEl);
            },
            updateProgressStatus: function (percent, name) {
                let fileItem = this.getMain().getControl().FileItem;
                let itemFiles = yiche.util.findChildrenControl(this.getMain(), fileItem).filter(i => i._oData.name === name);
                let current = itemFiles[0],
                    itemEl = current.getMain();
                ecui.dom.addClass(itemEl, 'loading');
                itemEl.querySelector('.progress-wrap .text').innerHTML = `${percent}%`;
                itemEl.querySelector('.progress-wrap .progress-bar').style.width = `${percent}%`;
                if (percent === 100) {
                    ecui.dom.removeClass(itemEl, 'loading');
                    ecui.dom.addClass(itemEl, 'success');
                }
            },
            checkFileRepeat: function (name) {
                let fileItem = this.getMain().getControl().FileItem;
                let itemFiles = yiche.util.findChildrenControl(this.getMain(), fileItem);
                for (let i = 0, len = itemFiles.length; i < len; i++) {
                    let fileName = itemFiles[i]._oData.name;
                    if (fileName === name) {
                        ecui.globalTips(
                            `${name}已经存在,请勿重复上传!`,
                            'error'
                        );
                        return false;
                    }
                }
                return true;
            },
            checkMaxuploadNumber: function (selectCount) {
                let fileItem = this.getMain().getControl().FileItem,
                    fileCount = yiche.util.findChildrenControl(this.getMain(), fileItem).length + selectCount;
                if (fileCount <= this._nMaxCount) {
                    return true;
                } else {
                    ecui.globalTips(
                        `最多可上传${this._nMaxCount}个文件!`,
                        'error'
                    );
                    return false;
                }
            },
            getValues: function () {
                let fileItem = this.getMain().getControl().FileItem,
                    itemFiles = yiche.util.findChildrenControl(this.getMain(), fileItem),
                    successFiles = itemFiles.filter(i => i._oData.uploadStatus),
                    countFile = itemFiles.length;
                if (successFiles.length !== countFile) {
                    ecui.globalTips(
                        '请删除上传失败的图片再提交保存!',
                        'error'
                    );
                    return [];
                }
                let result = [];
                itemFiles.forEach(item => {
                    result.push(item._oData);
                });
                return result;
            },
            setValues: function (list) {
                if (list.length === 0) {
                    return;
                }
                list.forEach(item => {
                    this.addFileItem(item, 'edit');
                });
                // 文件数达到最大时隐藏文件上传按钮
                this.handleHideSelectFilesBtn();
            },
            handleRequired: function () {
                let selectFile = this.getMain().querySelector('.ui-upload').getControl();
                selectFile.alterStatus('+error');
            },
            // 当文件列表的文件数达到最大上传数时,隐藏上传按钮
            handleHideSelectFilesBtn: function () {
                let fileItem = this.getMain().getControl().FileItem,
                    fileCount = yiche.util.findChildrenControl(this.getMain(), fileItem).length;
                if (fileCount === this._nMaxCount * 1) {
                    this.getMain().querySelector('.ui-upload').getControl().hide();
                }
            },
            onready: function () {
                if (this._oFileValues && this._oFileValues.length > 0) {
                    this.setValues(this._oFileValues);
                }
            }
        }
    ),

    // 图片预览
    CustomPreview: ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this._sCurrentIndex = options.index;
            this._oDataList = options.data;
            this._eImgWrapEl = el.querySelector('.swiper');
            this._uPrev = null;
            this._uNext = null;
            this.hide();
        }, {
            onclick: function (e){
                const el = e.target;
                if (ecui.dom.hasClass(el, 'preview-session') || ecui.dom.hasClass(el, 'close')){
                    this.repaint();
                    this._sCurrentIndex = 0;
                    this._oDataList = [];
                    this._eImgWrapEl.innerHTML = '';
                    this.hide();
                }
            },
            PreviewImgChange: ecui.inherits(
                ecui.ui.Control,
                function (el, options) {
                    ecui.ui.Control.call(this, el, options);
                    this._sBtnType = options.btnType;
                }, {
                    onclick: function () {
                        let parent = this.getParent(),
                            list = parent._oDataList,
                            imgPos = parent._eImgWrapEl,
                            uPrev = parent._uPrev,
                            uNext = parent._uNext,
                            type = this._sBtnType,
                            len = list.length;
                        if (type === 'prev') {
                            parent._sCurrentIndex--;
                            if (parent._sCurrentIndex === 0) {
                                uPrev.hide();
                            }
                            if (!uNext.isShow()) {
                                uNext.show();
                            }

                        } else {
                            parent._sCurrentIndex++;
                            if (parent._sCurrentIndex === len - 1) {
                                uNext.hide();
                            }
                            if (!uPrev.isShow()) {
                                uPrev.show();
                            }
                        }
                        imgPos.innerHTML = `<img src="${list[parent._sCurrentIndex].url}" alt="${list[parent._sCurrentIndex].name}" />`;
                    }
                }
            ),
            initPreview: function (list, index) {
                this._oDataList = [];
                this._sCurrentIndex = 0;
                if (list.length === 0) {
                    return;
                }
                this._oDataList = list;
                this._sCurrentIndex = index;
                const imgEl = `<img src="${this._oDataList[this._sCurrentIndex].url}" alt="${this._oDataList[this._sCurrentIndex].name}" />`;
                this._eImgWrapEl.innerHTML = imgEl;
                this.show();
                if (this._sCurrentIndex === 0 && this._oDataList.length === 1) {
                    this._uPrev.hide();
                    this._uNext.hide();
                } else if (this._sCurrentIndex === 0 && this._oDataList.length - 1 > 0) {
                    this._uPrev.hide();
                    this._uNext.show();
                } else if (this._sCurrentIndex === this._oDataList.length - 1 && this._oDataList.length - 1 > 0) {
                    this._uPrev.show();
                    this._uNext.hide();
                } else {
                    this._uPrev.show();
                    this._uNext.show();
                }
            },
            onready: function () {
                let btnControls = yiche.util.findChildrenControl(this.getMain(), this.PreviewImgChange);
                if (btnControls.length === 2) {
                    this._uPrev = btnControls[0];
                    this._uNext = btnControls[1];
                }
            }
        }
    ),

    // 富文本编辑器
    Tinymce: ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this._bRequired = options.required || false;
            this._sValue = options.value;
        }, {
            onready: function () {
                let that = this,
                    value = this._sValue;
                tinymce.init({
                    target: this.getMain().querySelector('.tinymce'),
                    statusbar: false,
                    menubar: false,
                    height: 300,
                    language: 'zh_CN',
                    plugins: 'image',
                    branding: false,
                    fontsize_formats: '11px 12px 14px 16px 18px 24px 36px 48px',
                    toolbar: 'undo redo |  bold italic underline strikethrough backcolor forecolor| image | alignleft aligncenter alignright alignjustify | lineheight | fontselect | fontsizeselect | outdent indent',
                    images_upload_handler: function (blobInfo, succFun, failFun) {
                        let file = blobInfo.blob(); //转化为易于理解的file对象
                        const formData = new FormData();
                        formData.append('imageFileName', file);
                        ecui.io.ajax('/communitycms/image/addByAttachment', {
                            method: 'POST',
                            data: formData,
                            headers: yiche.info.UPLOAD_FILES_HEADER,
                            onsuccess: function (res) {
                                if (typeof res == 'string') {
                                    res = JSON.parse(res);
                                }
                                let json = {
                                    location: res.data
                                };
                                succFun(json.location);
                            },
                            onerror: function (event) {
                                failFun('HTTP Error: ' + event);
                            }
                        });
                    },
                    file_picker_callback: function (callback, value, meta) {
                        if (meta.filetype == 'image') {
                            callback('myimage.jpg', { alt: 'My alt text' });
                        }
                    },
                    init_instance_callback: function (editor) {
                        editor.on('focus', function () {
                            that.alterStatus('-error');
                        });
                        if (value) {
                            let { graphicDetail } = ecui.esr.getData('saveParams');
                            that.setValue(graphicDetail);
                        }
                    }
                });
            },
            getValue: function () {
                let htmls = tinyMCE.activeEditor.getContent();
                if (this._bRequired && !htmls) {
                    this.handleRequired();
                }
                return htmls;
            },
            setValue: function (html) {
                tinyMCE.activeEditor.setContent(html);
            },
            handleRequired: function () {
                this.alterStatus('+error');
            },
            $dispose: function () {
                ecui.ui.Control.prototype.$dispose.call(this);
            }
        }
    ),

    // 右侧pane
    RightPaneView: ecui.inherits(
        ecui.ui.Control,
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
        }, {
            onclick: function (e){
                if (ecui.dom.hasClass(e.target, 'ec-right-pane-view') || ecui.dom.hasClass(e.target, 'close')){
                    ecui.dom.removeClass(this.getMain(), 'actived');
                }
            },
            handleMaskShow: function (){
                !ecui.dom.hasClass(this.getMain(), 'actived') && ecui.dom.addClass(this.getMain(), 'actived');
            }
        }
    ),

    // 拖动排序
    DragSort: ecui.inherits(
        ecui.ui.Control,
        'ec-drag-sort',
        function (el, options) {
            ecui.ui.Control.call(this, el, options);
            this.myItemsData = [];
            this.myDragingEl = null;
        }, {
            HandleItem: ecui.inherits(
                ecui.ui.Control,
                'ec-drag-sort-item',
                function (el, options) {
                    ecui.ui.Control.call(this, el, options);
                    this.myData = options.item;
                }, {
                    onready: function (){
                        this.getMain().setAttribute('draggable', true);
                    },
                    onclick: function (){
                        console.log(this.myData);
                    }
                }
            ),
            getData: function (){
                let res = [],
                    ctrs = yiche.util.findChildrenControl(this.getMain(), this.getMain().getControl().HandleItem);
                ctrs && ctrs.forEach(item => {
                    res.push(item.myData); 
                });
            },
            ondragstart: function (e){
                this.myDragingEl = e.target;
                e.dataTransfer.setData("te", e.target.innerText);
            },
            ondragover: function (e){
                e.preventDefault();
                let target = e.target;
                this._moving(target);
            },
            ondragend: function (e) {
                e.preventDefault();
                this.myDragingEl = null;
            },
            _moving:function (target){
                if (target.nodeName === "LI" && this.myDragingEl !== target) {
                    const targetRect = target.getBoundingClientRect();
                    const dragingRect = this.myDragingEl.getBoundingClientRect();
                    if (this.myDragingEl && this.myDragingEl.animated) return;
                    let currentIndex = this.handleIndex(this.myDragingEl);
                    let endIndex = this.handleIndex(target);
                    if (currentIndex < endIndex){ // 向下拖
                        target.parentNode.insertBefore(this.myDragingEl, target.nextSibling);
                    } else { // 向上拖
                        target.parentNode.insertBefore(this.myDragingEl, target);
                    }
                    this.getData();
                    this.handleMove(dragingRect, this.myDragingEl);
                    this.handleMove(targetRect, target);
                }
            },
            handleMove: function (prevRect, target){
                let ms = 300,
                    that = this;

                if (ms) {
                    let currentRect = target.getBoundingClientRect();
        
                    if (prevRect.nodeType === 1) {
                        prevRect = prevRect.getBoundingClientRect();
                    }
                    that._css(target, 'transition', 'none');
                    that._css(target, 'transform', 'translate3d(' +
                        (prevRect.left - currentRect.left) + 'px,' +
                        (prevRect.top - currentRect.top) + 'px, 0)'
                    );
                    target.offsetWidth; // 触发重绘
                    that._css(target, 'transition', 'all ' + ms + 'ms');
                    that._css(target, 'transform', 'translate3d(0,0,0)');
        
                    target.animated && clearTimeout(target.animated);
                    target.animated = setTimeout(function () {
                        that._css(target, 'transition', '');
                        that._css(target, 'transform', '');
                        target.animated = false;
                    }, ms);
                }
            },
            _css:function (el, prop, val){
                const style = el && el.style;
                if (style) {
                    if (val === void 0) {
                        if (document.defaultView && document.defaultView.getComputedStyle) {
                            val = document.defaultView.getComputedStyle(el, '');
                        } else if (el.currentStyle) {
                            val = el.currentStyle;
                        }

                        return prop === void 0 ? val : val[prop];
                    } else {
                        if (!(prop in style)) {
                            prop = '-webkit-' + prop;
                        }
                        style[prop] = val + (typeof val === 'string' ? '' : 'px');
                    }
                }
            },
            handleIndex: function (el){
                let index = 0;
                if (!el || !el.parentNode) {
                    return -1;
                }
                while (el && (el = el.previousElementSibling)) {
                    index++;
                }
                return index;
            },
            onready: function (){
                const dragView = this.getMain();
                const dragstart = this.ondragstart.bind(this);
                const dragover = this.ondragover.bind(this);
                const dragend = this.ondragend.bind(this);
                ecui.dom.addEventListener(dragView, 'dragstart', dragstart);
                ecui.dom.addEventListener(dragView, 'dragover', dragover);
                ecui.dom.addEventListener(dragView, 'dragend', dragend);
                ecui.addEventListener(this, 'dispose', function () {
                    ecui.dom.removeEventListener(dragView, 'dragstart', dragstart);
                    ecui.dom.removeEventListener(dragView, 'dragover', dragover);
                    ecui.dom.removeEventListener(dragView, 'dragend', dragend);
                });
            }
        }
    )
};