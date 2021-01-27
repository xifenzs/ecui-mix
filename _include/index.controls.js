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
                        res = [];
                    if (len > 0) {
                        checkBoxControls.forEach(item => {
                            if (item._oItemData.checked) {
                                res.push(item._oItemData);
                            }
                        })
                    }
                    let nowLen = res.length;
                    return {
                        len,
                        nowLen
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
                        let { len, nowLen } = this.getData();
                        this.changeStatus(len, nowLen);
                        clearTimeout(timer);
                    }, 0);
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
                this._sFileType = options.fileType; // 0: 文件 1:图片
            }, {

            }
        )
    };
}());