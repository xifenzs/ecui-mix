(function() {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        ext = core.ext;

    yiche.ui = {
        // 导航菜单
        CustomNavs: ecui.inherits(
            ecui.ui.Control,
            function(el, options) {
                ecui.ui.Control.call(this, el, options);
                this._bCollapse = options.collapse || false;
            }, {
                CustomNavsParent: ecui.inherits(ecui.ui.Control,
                    function(el, options) {
                        ecui.ui.Control.call(this, el, options);
                        this._oNavData = options.navItem;
                        this._bIsOpened = false;
                    }, {
                        onclick: function() {
                            let hasChildNav = this._oNavData.children;
                            // 如果没有子菜单 就直接添加样式
                            if (hasChildNav && hasChildNav.length === 0) {
                                this.removeParentControlSelected();
                                this.alterStatus('+selected');
                                return;
                            }
                            this._bIsOpened = !this._bIsOpened;
                            if (this._bIsOpened) {
                                this.alterStatus('+opened');
                            } else {
                                this.alterStatus('-opened');
                            }
                        },
                        removeParentControlSelected: function() {
                            let parent = this.getParent(),
                                navParentControl = yiche.util.findChildrenControl(parent.getMain(), parent.CustomNavsParent);
                            navParentControl && navParentControl.forEach(item => {
                                let child = yiche.util.findChildrenControl(item.getMain(), item.CustomNavsChild);
                                if (child && child.length > 0) { // 二级导航
                                    child.forEach(cItem => {
                                        cItem.alterStatus('-selected');
                                    })
                                } else { // 一级导航
                                    item.alterStatus('-selected');
                                }
                                let wrapLinkEl = item.getMain().querySelector('.nav-child-mask-wrap');
                                if (wrapLinkEl) {
                                    let linkChild = yiche.util.findChildrenControl(wrapLinkEl, item.LinkItem);
                                    if (linkChild && linkChild.length > 0) {
                                        linkChild.forEach(lItem => {
                                            lItem.alterStatus('-selected');
                                        })
                                    }
                                }
                            });
                        },
                        CustomNavsChild: ecui.inherits(ecui.ui.Control,
                            function(el, options) {
                                ecui.ui.Control.call(this, el, options);
                                this._oNavData = options.navItem;
                            }, {
                                onclick: function(e) {
                                    e.stopPropagation();
                                    this.getParent().removeParentControlSelected();
                                    this.alterStatus('+selected');
                                }
                            }
                        ),
                        onmouseover: function() {
                            let mainEl = this.getMain(),
                                menuWrapEl = ecui.dom.parent(ecui.dom.parent(ecui.dom.parent(mainEl)));
                            if (!ecui.dom.hasClass(menuWrapEl, 'menu-collapsed')) {
                                return;
                            }
                            let dom = ecui.dom.getPosition(mainEl),
                                maskEl = mainEl.querySelector('.mask-nav-name'),
                                hasChildNav = this._oNavData.children;
                            if (hasChildNav && hasChildNav.length === 0) {
                                maskEl.style.top = dom.top + 4 + 'px';
                                return;
                            }
                            maskEl = mainEl.querySelector('.nav-child-mask-wrap');
                            if (!maskEl) {
                                return;
                            }
                            let maskElStyle = maskEl.style;
                            maskElStyle.top = dom.top + 'px';
                        },
                        LinkItem: ecui.inherits(ecui.ui.Control,
                            function(el, options) {
                                ecui.ui.Control.call(this, el, options);
                                this._oNavData = options.navItem;
                            }, {
                                onclick: function(e) {
                                    e.stopPropagation();
                                    this.getParent().removeParentControlSelected();
                                    let timer = setTimeout(() => {
                                        this.alterStatus('+selected');
                                        clearTimeout(timer);
                                    }, 300);
                                }
                            }
                        )
                    }
                ),
                refreshNavStatus: function() {
                    const loc = ecui.esr.getLocation().split('~')[0],
                        parent = this,
                        navParentControl = yiche.util.findChildrenControl(parent.getMain(), parent.CustomNavsParent);
                    navParentControl && navParentControl.forEach(item => {
                        let child = yiche.util.findChildrenControl(item.getMain(), item.CustomNavsChild);
                        if (child && child.length > 0) { // 二级导航
                            child.forEach(cItem => {
                                if (cItem._oNavData.route === loc) {
                                    ecui.dispatchEvent(cItem, 'click');
                                    let cItemParent = cItem.getParent();
                                    if (!cItemParent._bIsOpened) {
                                        ecui.dispatchEvent(cItemParent, 'click');
                                    }
                                }
                            })
                        } else { // 一级导航
                            if (item._oNavData.route === loc) {
                                ecui.dispatchEvent(item, 'click');
                            }
                        }
                        let wrapLinkEl = item.getMain().querySelector('.nav-child-mask-wrap');
                        if (wrapLinkEl) {
                            let linkChild = yiche.util.findChildrenControl(wrapLinkEl, item.LinkItem);
                            if (linkChild && linkChild.length > 0) {
                                linkChild.forEach(lItem => {
                                    if (lItem._oNavData.route === loc) {
                                        lItem.alterStatus('+selected');
                                    }
                                })
                            }
                        }
                    });
                },
                handleCollapse: function() {
                    this._bCollapse = !this._bCollapse;
                    let collapseEl = this.hasCollapse();
                    if (this._bCollapse) {
                        ecui.dom.addClass(collapseEl, 'menu-collapsed');
                    } else {
                        ecui.dom.removeClass(collapseEl, 'menu-collapsed');
                    }
                },
                hasCollapse: function() {
                    let menuWrapEl = ecui.dom.parent(ecui.dom.parent(this.getMain())),
                        parentEl = false;
                    if (ecui.dom.hasClass(menuWrapEl, 'content-menu')) {
                        parentEl = menuWrapEl;
                    }
                    return parentEl;
                },
                $ready: function() {
                    this.refreshNavStatus();
                    if (this._bCollapse) {
                        let collapseEl = this.hasCollapse();
                        collapseEl && this.handleCollapse();
                    }
                }
            }
        ),
        // 导航折叠
        CustomNavsCollapse: ecui.inherits(
            ecui.ui.Control,
            function(el, options) {
                ecui.ui.Control.call(this, el, options);
                this._sNavId = options.navId;
            }, {
                onclick: function() {
                    if (this._sNavId) {
                        let menuControl = ecui.get(this._sNavId);
                        if (!menuControl) {
                            return;
                        }
                        collapseStatus = menuControl._bCollapse;
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
                onready: function() {
                    if (yiche.util.getSessionStorage('MENU_COLLAPSE') === '1') {
                        ecui.dispatchEvent(this, 'click');
                    }
                }
            }
        ),
        // 退出登录
        CustomLogout: ecui.inherits(
            ecui.ui.Control,
            function(el, options) {
                ecui.ui.Control.call(this, el, options);
            }, {
                onclick: function() {
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
            function(el, options) {
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
                $input: function(event) {
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
                    onclick: function() {
                        this.getParent().refresh();
                    }
                }),
                ClearValue: ecui.inherits(ecui.ui.Control, {
                    onclick: function() {
                        this.getParent().setValue('');
                    }
                }),
                onkeydown: function(event) {
                    if (event.which === 13) {
                        this.refresh();
                    }
                },
                refresh: function() {
                    yiche.util.findchildrenRouteAndCall(this);
                }
            }
        ),
        // id 搜索
        CustomNumberTexts: ecui.inherits(
            ecui.ui.Number,
            'custom-search-text',
            function(el, options) {
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
                    onclick: function() {
                        this.getParent().refresh();
                    }
                }),
                ClearValue: ecui.inherits(ecui.ui.Control, {
                    onclick: function() {
                        this.getParent().setValue('');
                    }
                }),
                onkeydown: function(event) {
                    if (event.which === 13) {
                        this.refresh();
                    }
                },
                refresh: function() {
                    yiche.util.findchildrenRouteAndCall(this);
                }
            }
        ),
        // 图片预览
        PreviewHide: ecui.inherits(ecui.ui.Control, {
            onclick: function() {
                let elPreview = ecui.$('preview_session_handle');
                ecui.dom.addClass(elPreview, 'ui-hide');
                elPreview.querySelector('.swiper').innerHTML = '';
            }
        }),
        // 点击展开显示子元素
        CustomToggle: ecui.inherits(
            ecui.ui.Control,
            function(el, options) {
                ecui.ui.Control.call(this, el, options);
                this._oRowData = options.data;
                this._bVisible = false;
            }, {
                onclick: function() {
                    this.asyncLoadChild();
                    this.handleToggle();
                },
                // 展开 收起
                handleToggle: function() {
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
                asyncLoadChild: function() {

                }
            }
        ),
        // 下拉
        CustomSelect: ecui.inherits(
            ecui.ui.Select,
            function(el, options) {
                ecui.ui.Select.call(this, el, options)
            }, {
                onchange: function(evt) {
                    if (!this.getValue()) {
                        return;
                    }
                    yiche.util.findchildrenRouteAndCall(this);
                }
            }
        ),
        // 下拉搜索
        CustomCombox: ecui.inherits(ecui.ui.Combox, {
            onchange: function() {
                if (!this.getValue()) {
                    return;
                }
                yiche.util.findchildrenRouteAndCall(this);
            }
        }),

        // 日期范围筛选
        CustomTimers: ecui.inherits(frd.RangeSelectDate, {
            onchange: function() {
                this.setValue(this._uRangeCalendar.getSelectDates());
                this._uRangeCalendar.hide();
                yiche.util.findchildrenRouteAndCall(this);
            }
        }),

        // 编辑输入
        CustomInputTexts: ecui.inherits(
            ecui.ui.Text,
            'custom-text',
            function(el, options) {
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
                    onclick: function() {
                        this.getParent().setValue('');
                    }
                }),
                handleCheck: function() {
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
                onblur: function() {
                    this.handleCheck();
                },
                onerror: function() {
                    let check = this.isEditControl();
                    if (!check) {
                        return;
                    }
                    ecui.dom.addClass(this._eParentEl, 'item-error');
                },
                isEditControl: function() {
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
            function(el, options) {
                ecui.ui.Select.call(this, el, options);
                this._eParentEl = ecui.dom.parent(el);
            }, {
                onchange: function() {
                    let value = this.getValue(),
                        check = this.isEditControl();
                    if (value && check) {
                        ecui.dom.removeClass(this._eParentEl, 'item-error');
                    }
                },
                onerror: function() {
                    let check = this.isEditControl();
                    if (!check) {
                        return;
                    }
                    ecui.dom.addClass(this._eParentEl, 'item-error');
                },
                isEditControl: function() {
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
            function(el, options) {
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
                onready: function() {
                    this.getMain().style.width = this.getWidth() + 'px';
                    this.chart = echarts.init(this.content.getMain());
                    if (this.echartInfo && this.echartInfo.immediate) {
                        let echartInfo = this.echartInfo;
                        this.render(echartInfo);
                    }
                    this.chart.on('legendselectchanged', function(param) {
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
                },
                isEmpty: function() {
                    return this.emptyMask.isShow();
                },
                reqSuccess: function(data) {
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
                transfromEchartOptions: function(data) {
                    let option = {};
                    return option;
                },
                reqFail: function(xhr) {
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
                render: function(echartInfo) {
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
                $dispose: function() {
                    ecui.ui.Control.prototype.$dispose.call(this);
                    this.chart && this.chart.dispose();
                }
            }
        ),

        // 分页
        Pagination: ecui.inherits(frd.Pagination,
            function(el, options) {
                this._nPageSizeOption = options.pageSizeOptions || [20, 50, 100];
                frd.Pagination.call(this, el, options);
            }, {
                hascreatePageSize: function() {
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
                        setPageInfoContent: function(pageNo, size, count, total, totalPage) {
                            this.getParent()._uPageInfo.setContent(
                                '共 ' + total + ' 页'
                            );
                        }
                    }
                )
            }
        ),

        // 单选
        CustomRadio: ecui.inherits(
            frd.SimulationRadio,
            function(el, options) {
                this._bRefresh = options.refreshChildRoute || false;
                frd.SimulationRadio.call(this, el, options);
            }, {
                onchange: function() {
                    if (this._bRefresh) {
                        this.refresh();
                    }
                },
                refresh: function() {
                    yiche.util.findchildrenRouteAndCall(this);
                }
            }
        ),

        // 复选
        CustomCheckbox: ecui.inherits(
            ecui.ui.Control,
            function(el, options) {
                this._oItemData = options.itemData;
                this._sScopedName = options.scopedName;
                ecui.ui.Control.call(this, el, options);
            }, {
                onready: function() {
                    let { checked } = this._oItemData;
                    if (checked) {
                        this.alterStatus('+checked');
                    }
                },
                onclick: function() {
                    this.changeStatus();
                    this.handleChange && this.handleChange();
                },
                changeStatus: function() {
                    let { checked } = this._oItemData;
                    if (checked) {
                        this.alterStatus('-checked');
                    } else {
                        this.alterStatus('+checked');
                    }
                    this._oItemData.checked = !this._oItemData.checked;
                },
                getData: function() {
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
                        })
                    }
                    return {
                        itemLength: len,
                        list: res
                    }
                },
                findChildrenControl: function(el) {
                    return yiche.util.findChildrenControl(el, yiche.ui.CustomCheckbox);
                },
                handleChange: null
            }
        ),
        CustomCheckboxSelectAll: ecui.inherits(
            ecui.ui.Control,
            function(el, options) {
                this._sScopedName = options.scopedName;
                ecui.ui.Control.call(this, el, options);
            }, {
                onclick: function() {
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
                changeStatus: function(len, nowLen) {
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
                getData: function() {
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
                        })
                    }
                    let nowLen = res.length;
                    return {
                        len,
                        nowLen,
                        res,
                        oldData
                    }
                },
                findChildrenControl: function(el) {
                    return yiche.util.findChildrenControl(el, yiche.ui.CustomCheckbox);
                },
                setData: function(flag) {
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
                        })
                    }
                },
                onready: function() {
                    let timer = setTimeout(() => {
                        this.refreshStatus();
                        clearTimeout(timer);
                    }, 0);
                },
                refreshStatus: function() {
                    let { len, nowLen } = this.getData();
                    this.changeStatus(len, nowLen);
                }
            }
        ),

        // 树结构单选
        CustomTreeSelect: ecui.inherits(
            ecui.ui.Control,
            function(el, options) {
                ecui.ui.Control.call(this, el, options);
                this._oResData = null;
            }, {
                CustomItem: ecui.inherits(
                    ecui.ui.Control,
                    function(el, options) {
                        ecui.ui.Control.call(this, el, options);
                        this._oRowData = options.data;
                    }, {
                        hasExpend: function() {
                            let el = this.getMain();
                            return ecui.dom.hasClass(el, 'tree-item-expend');
                        },
                        onclick: function(e) {
                            let targetEl = e.target;
                            this.handleCollapse(targetEl);
                        },
                        handleCollapse: function(dom) {
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
                            function(el, options) {
                                ecui.ui.Control.call(this, el, options);
                                this._oChildItemData = options.data;
                            }, {
                                onclick: function(e) {
                                    e.stopPropagation();
                                    this.getParent().getParent().clearStatus();
                                    this.alterStatus('+actived');
                                    this.getParent().getParent().setValue(this._oChildItemData);
                                }
                            }
                        )
                    },
                ),
                setValue: function(obj) {
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
                                    })
                                }
                            }
                        })
                    }
                },
                getValue: function() {
                    return this._oResData;
                },
                clearStatus: function() {
                    let allCustomItem = yiche.util.findChildrenControl(this.getMain(), this.CustomItem);
                    if (allCustomItem && allCustomItem.length > 0) {
                        allCustomItem.forEach(item => {
                            if (item._oRowData.children.length > 0) {
                                let child = yiche.util.findChildrenControl(item.getMain(), item.CustomChildItem);
                                if (child && child.length > 0) {
                                    child.forEach(cItem => {
                                        cItem.alterStatus('-actived');
                                    })
                                }
                            }
                        })
                    }
                },
                SearchItem: ecui.inherits(
                    ecui.ui.Text,
                    'custom-search-text',
                    function(el, options) {
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
                            onclick: function() {
                                const value = this.getParent().getValue();
                                this.getParent().getParent().handleSearch(value);
                            }
                        }),
                        ClearValue: ecui.inherits(ecui.ui.Control, {
                            onclick: function() {
                                this.getParent().setValue('');
                            }
                        })
                    }
                ),
                handleSearch: function(value) {
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
                                    })
                                    if (count === 0) {
                                        item.hide();
                                    } else {
                                        item.show();
                                    }
                                }
                            }
                        })
                    }
                }
            }
        ),

        // 文件上传 
        CustomUploads: ecui.inherits(
            ecui.ui.Control,
            function(el, options) {
                ecui.ui.Control.call(this, el, options);
                this._sFileType = options.fileType || '0'; // 0: 文件 1:图片 2:视频
                this._sUploadUrl = options.url || '/serve-idea/api/file/upload'; // 上传地址
                this._sCheckFileInfo = options.checkFileInfo || {
                    size: 99999999999,
                    msg: '不限制文件大小!'
                }; // 文件大小校验信息
                this._nMaxCount = options.maxCount || 1; //一次最大可上传数量
                this._sPreviewType = options.preview || 'a'; //一次最大可上传数量 a:打开一个新窗口预览  m: 当前页出现一个蒙层进行预览
            }, {
                SelectFiles: ecui.inherits(
                    ecui.ui.Upload,
                    function(el, options) {
                        ecui.ui.Upload.call(this, el, options);
                        this._eFiles = el.querySelector('input');
                    }, {
                        onclick: function() {
                            this._eFiles.click();
                        },
                        $ready: function(options) {},
                        init: function(event) {
                            ecui.ui.Upload.prototype.init.call(this, event);
                            ecui.dom.addEventListener(this._eFiles, 'change', this.getParent().handleGetFiles);
                        }
                    }
                ),
                // 获取选中的文件信息
                handleGetFiles: function(e) {
                    let files = [],
                        fileInputEl = this,
                        selectEl = ecui.dom.parent(fileInputEl),
                        canUpload = true;
                    // 获取文件上传控件
                    let customUploads = selectEl.getControl().getParent() || null;
                    if (!e.target.files || !customUploads) {
                        return;
                    }
                    files = Array.prototype.slice.call(e.target.files, 0);
                    if (files.length === 0) {
                        return;
                    }

                    // 校验一次最大上传数量
                    if (customUploads._nMaxCount && customUploads.checkMaxuploadNumber && !customUploads.checkMaxuploadNumber(files.length)) {
                        return;
                    }

                    // 校验文件大小
                    if (customUploads._sCheckFileInfo) {
                        for (let i = 0, len = files.length; i < len; i++) {
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
                    // 上传文件
                    let fileSecCount = files.length;
                    files.forEach((file) => {
                        // 
                        const currentName = file.name;
                        // 添加占位元素
                        let itemFileInfo = {
                            name: file.name,
                            uploadStatus: false
                        };
                        customUploads.addFileItem(itemFileInfo, 'add');

                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = function(e) {
                            const data = new FormData();
                            data.append('file', file);
                            ecui.io.ajax(customUploads._sUploadUrl, {
                                method: 'POST',
                                data: data,
                                headers: yiche.info.UPLOAD_FILES_HEADER,
                                onupload: function(e) {
                                    const percent = Math.round(e.loaded / e.total * 100);
                                    customUploads.updateProgressStatus(percent, currentName);
                                },
                                onsuccess: function(res) {
                                    if (typeof res == 'string') {
                                        res = JSON.parse(res);
                                    }
                                    if (res.code === 0) {
                                        customUploads.uploadSuccess(res.data, currentName);
                                    }
                                    // 解决前后2次选同一个文件不触发file的change事件
                                    fileSecCount--;
                                    if (fileSecCount === 0) {
                                        fileInputEl.value = '';
                                    }
                                },
                                onerror: function(event) {
                                    customUploads.uploadFail(currentName);
                                    // 解决前后2次选同一个文件不触发file的change事件
                                    fileSecCount--;
                                    if (fileSecCount === 0) {
                                        fileInputEl.value = '';
                                    }
                                }
                            });
                        }
                    });
                },
                uploadSuccess: function(res, name) {
                    let fileItem = this.getMain().getControl().FileItem;
                    let itemFiles = yiche.util.findChildrenControl(this.getMain(), fileItem).filter(i => i._oData.name === name);
                    let current = itemFiles[0],
                        itemEl = current.getMain();
                    ecui.dom.removeClass(itemEl, 'loading');
                    if (res instanceof Object) {
                        current._oData = Object.assign(current._oData, res, {
                            uploadStatus: true
                        })
                    } else {
                        current._oData = Object.assign(current._oData, {
                            url: res,
                            uploadStatus: true
                        })
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
                uploadFail: function(name) {
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
                    function(el, options) {
                        ecui.ui.Control.call(this, el, options);
                        this._oData = options.rowData;

                    }, {
                        onclick: function(e) {
                            let el = e.target;
                            if (!ecui.dom.hasClass(el, 'iconfont')) {
                                return;
                            }
                            // 删除
                            if (ecui.dom.hasClass(el, 'del-icon')) {
                                let wrapEl = this.getMain();
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
                                })
                                ecui.get('handlePreview').initPreview(list, current);
                            }
                        }
                    }
                ),
                addFileItem: function(file, type) {
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
                updateProgressStatus: function(percent, name) {
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
                checkFileRepeat: function(name) {
                    let fileItem = this.getMain().getControl().FileItem;
                    let itemFiles = yiche.util.findChildrenControl(this.getMain(), fileItem);
                    for (let i = 0, len = itemFiles.length; i < len; i++) {
                        let fileName = itemFiles[i]._oData.name;
                        if (fileName === name) {
                            ecui.tip('error', `${name}已经存在,请勿重复上传!`);
                            return false;
                        }
                    }
                    return true;
                },
                checkMaxuploadNumber: function(selectCount) {
                    let fileItem = this.getMain().getControl().FileItem;
                    let fileCount = yiche.util.findChildrenControl(this.getMain(), fileItem).length + selectCount;
                    if (fileCount <= this._nMaxCount) {
                        return true;
                    } else {
                        ecui.tip('error', `最多可上传${this._nMaxCount}个文件!`);
                        return false;
                    }
                },
                getValues: function() {
                    let fileItem = this.getMain().getControl().FileItem,
                        itemFiles = yiche.util.findChildrenControl(this.getMain(), fileItem),
                        successFiles = itemFiles.filter(i => i._oData.uploadStatus),
                        countFile = itemFiles.length;
                    if (successFiles.length !== countFile) {
                        ecui.tip('error', '请删除上传失败的图片再提交保存!');
                        return [];
                    }
                    let result = [];
                    itemFiles.forEach(item => {
                        result.push(item._oData);
                    });
                    return result;
                },
                setValues: function(list) {
                    if (list.length === 0) {
                        return;
                    }
                    list.forEach(item => {
                        this.addFileItem(item, 'edit');
                    })
                }
            }
        ),

        // 图片预览
        CustomPreview: ecui.inherits(
            ecui.ui.Control,
            function(el, options) {
                ecui.ui.Control.call(this, el, options);
                this._sCurrentIndex = options.index;
                this._oDataList = options.data;
                this._eImgWrapEl = el.querySelector('.swiper');
                this._uPrev = null;
                this._uNext = null;
                this.hide();
            }, {
                HandleHide: ecui.inherits(
                    ecui.ui.Control, {
                        onclick: function() {
                            let parent = this.getParent();
                            parent.repaint();
                            parent._sCurrentIndex = 0;
                            parent._oDataList = [];
                            parent._eImgWrapEl.innerHTML = '';
                            parent.hide();
                        }
                    }
                ),
                PreviewImgChange: ecui.inherits(
                    ecui.ui.Control,
                    function(el, options) {
                        ecui.ui.Control.call(this, el, options);
                        this._sBtnType = options.btnType;
                    }, {
                        onclick: function() {
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
                initPreview: function(list, index) {
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
                onready: function() {
                    let btnControls = yiche.util.findChildrenControl(this.getMain(), this.PreviewImgChange);
                    if (btnControls.length === 2) {
                        this._uPrev = btnControls[0];
                        this._uNext = btnControls[1];
                    }
                }
            }
        )
    };
}());