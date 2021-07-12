(function () {
    Object.assign(
        NS.data, {}
    );

    Object.assign(
        NS.ui, {
            SetBarEcharts: ecui.inherits(
                yiche.ui.Echarts,
                function (el, options) {
                    yiche.ui.Echarts.call(this, el, options);
                }, {
                    transfromEchartOptions: function () {
                        return {
                            xAxis: {
                                type: 'category',
                                boundaryGap: false,
                                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                            },
                            yAxis: {
                                type: 'value'
                            },
                            series: [{
                                data: [820, 932, 901, 934, 1290, 1330, 1320],
                                type: 'line',
                                areaStyle: {}
                            }]
                        };
                    }
                }
            ),

            CheckBox: ecui.inherits(yiche.ui.CustomCheckbox, {
                findChildrenControl: function (el) {
                    return yiche.util.findChildrenControl(el, NS.ui.CheckBox);
                },
                handleChange: function () {
                    let { itemLength, list } = this.getData();
                    let nowLen = list.length;
                    ecui.get('checkboxAll').changeStatus(itemLength, nowLen);
                }
            }),
            CustomCheckboxSelectAll: ecui.inherits(yiche.ui.CustomCheckboxSelectAll, {
                findChildrenControl: function (el) {
                    return yiche.util.findChildrenControl(el, NS.ui.CheckBox);
                }
            }),

            BtnCheckBox: ecui.inherits(yiche.ui.CustomCheckbox, {
                findChildrenControl: function (el) {
                    return yiche.util.findChildrenControl(el, NS.ui.BtnCheckBox);
                },
                handleChange: function () {
                    let { itemLength, list } = this.getData();
                    let nowLen = list.length;
                    ecui.get('checkboxAllBtn').changeStatus(itemLength, nowLen);
                }
            }),
            BtnCustomCheckboxSelectAll: ecui.inherits(yiche.ui.CustomCheckboxSelectAll, {
                findChildrenControl: function (el) {
                    return yiche.util.findChildrenControl(el, NS.ui.BtnCheckBox);
                }
            }),

            BorderCheckBox: ecui.inherits(yiche.ui.CustomCheckbox, {
                findChildrenControl: function (el) {
                    return yiche.util.findChildrenControl(el, NS.ui.BorderCheckBox);
                },
                handleChange: function () {
                    let { itemLength, list } = this.getData();
                    let nowLen = list.length;
                    ecui.get('checkboxAllBorder').changeStatus(itemLength, nowLen);
                }
            }),
            BorderCustomCheckboxSelectAll: ecui.inherits(yiche.ui.CustomCheckboxSelectAll, {
                findChildrenControl: function (el) {
                    return yiche.util.findChildrenControl(el, NS.ui.BorderCheckBox);
                }
            }),

            OpenDialog: ecui.inherits(
                ecui.ui.Control,
                function (el, options) {
                    ecui.ui.Control.call(this, el, options);
                    this._alignTyle = options.btnAlgin;
                }, {
                    onclick: function () {
                        const type = this._alignTyle;
                        if (!type) {
                            return;
                        }
                        switch (type) {
                        case 'center':
                            yiche.util.initDialog('dialogContainer', 'demoDialogBtnAlignCenterTarget', {}).showModal();
                            break;
                        case 'right':
                            yiche.util.initDialog('dialogContainer', 'demoDialogBtnAlignRightTarget', {}).showModal();
                            break;
                        default:
                            yiche.util.initDialog('dialogContainer', 'demoDialogBtnAlignLeftTarget', {}).showModal();
                            break;
                        }
                        ecui.esr.callRoute('dialogTest', true);
                    }
                }
            ),

            // 自定义显示项
            ReportADGroupCheckBox: ecui.inherits(yiche.ui.CustomCheckbox, {
                findChildrenControl: function (el) {
                    return yiche.util.findChildrenControl(el, NS.ui.ReportADGroupCheckBox);
                },
                handleChange: function () {
                    let { itemLength, list } = this.getData();
                    let nowLen = list.length;
                    ecui.get('checkboxAllOptions').changeStatus(itemLength, nowLen);
                }
            }),
            ReportADGroupCheckboxSelectAll: ecui.inherits(yiche.ui.CustomCheckboxSelectAll, {
                findChildrenControl: function (el) {
                    return yiche.util.findChildrenControl(el, NS.ui.ReportADGroupCheckBox);
                }
            }),
            CustomOptions: ecui.inherits(
                ecui.ui.Control,
                function (el, options) {
                    ecui.ui.Control.call(this, el, options);
                    this._uOptopns = el.querySelector('.options');
                    this._bVisible = false;
                }, {
                    HideOptions: ecui.inherits(
                        ecui.ui.Control, {
                            onclick: function (e) {
                                // 按钮类型
                                let type = e.target.innerText;
                                if (type === '确认') {
                                    let temp = this.getParent().getData().oldData,
                                        res = this.getParent().getData().res;
                                    if (res.length === 0) {
                                        ecui.tip('error', '请至少选择一项');
                                        return;
                                    }
                                    ecui.esr.setData('customOptions', temp);
                                    // ecui.esr.callRoute('reportADGroupListTable', true);
                                    yiche.util.setSessionStorage('reportADGroupMenu', temp);
                                }
                                ecui.dispatchEvent(this.getParent(), 'blur');
                            }
                        }
                    ),
                    onclick: function (e) {
                        let type = e.target.innerText;
                        if (type === '自定义选项') {
                            if (this._bVisible) {
                                this.alterStatus('-actived');
                                ecui.dispose(this._uOptopns);
                                this._uOptopns.innerHTML = `<div class="ui-hide"></div>`;
                            } else {
                                this.readerItems();
                                ecui.get('checkboxAllOptions').refreshStatus();
                                this.alterStatus('+actived');
                            }
                            this._bVisible = !this._bVisible;
                        }
                    },
                    onblur: function () {
                        this.alterStatus('-actived');
                        this._bVisible = false;
                        ecui.dispose(this._uOptopns);
                        this._uOptopns.innerHTML = `<div class="ui-hide"></div>`;
                    },
                    readerItems: function () {
                        let data = ecui.esr.getData('customOptions'),
                            optionEl = this._uOptopns,
                            NS = ecui.esr.getData('NS');
                        if (data && data.length > 0) {
                            data.forEach(item => {
                                let tempEl = ecui.dom.create({
                                    innerHTML: ecui.esr.getEngine().render('customTableOptionTarget', {
                                        item,
                                        NS
                                    })
                                });
                                let fileItemEl = ecui.dom.first(tempEl);
                                ecui.dom.insertBefore(fileItemEl, ecui.dom.last(optionEl));
                                ecui.init(fileItemEl);
                            });
                        }
                    },
                    getData: function () {
                        let control = ecui.get('checkboxAllOptions');
                        if (control) {
                            return control.getData();
                        }
                        return {
                            res: [],
                            oldData: []
                        };
                    }
                }
            )
        }
    );

    ecui.esr.addRoute('index', {
        model: [
            //         'pixelLists@POST /console/report/filter/pixel',
        ],
        main: 'container', // 挂载容器
        view: 'docTarget', // 渲染模板
        onbeforerequest: function (context) {
            // 列表请求数据
            context.tableParams = {};
            // 分页相关参数
            context.basePaginationInfo = {
                pageNo: 1,
                pageSize: 20
            };
        },
        onbeforerender: function (context) {
            // 面包屑导航
            ecui.esr.setData('globleCrumbs', [{
                content: '订单'
            }]);
            // 图片尺寸
            context.pixelLists = context.pixelLists || [];
            // 输入校验规则
            context.inputRules = {
                message: '颜色不能为空',
                reg: '^[a-fA-F0-9]{6,6}$'
            };
            // 非空输入校验
            context.noNullRules = {
                message: '内容不能为空',
                reg: '.+'
            };
            // 图表
            // echart 请求参数
            context.echartReqParams = {};
            context.echartReqInfo = {
                url: yiche.info.API_BASE + 'filter/cmd', // 接口地址
                method: 'post', // 接口类型
                params: context.echartReqParams, // 请求参数数据源,
                immediate: true, // 立即渲染
                defaultOption: {
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        data: [820, 932, 901, 934, 1290, 1330, 1320],
                        type: 'line',
                        areaStyle: {}
                    }]
                } // echart的默认配置
            };
            // 分页每页配置参数
            context.paginationInfo = {
                total: context.total || 100,
                pageSize: context.pageSize || 20,
                pageNo: context.pageNo || context.pageNum || 1,
                pageSizeOptions: [10, 20, 50, 80, 100]
            };
            // 复选mack数据
            context.checkboxList = [{
                id: '1',
                name: '选项1',
                checked: false,
                disabled: false
            }, {
                id: '2',
                name: '选项2',
                checked: false,
                disabled: false
            }, {
                id: '3',
                name: '选项3',
                checked: false,
                disabled: false
            }];
            // tree data
            context.treeData = [{
                id: 1,
                name: '你好',
                children: [{
                    id: 11,
                    name: '你好11',
                    children: []
                }, {
                    id: 12,
                    name: '你好12',
                    children: []
                }, {
                    id: 13,
                    name: '你好13',
                    children: []
                }, {
                    id: 14,
                    name: '你好14',
                    children: []
                }]
            },
            {
                id: 2,
                name: '你好2',
                children: [{
                    id: 21,
                    name: '你好21',
                    children: []
                }, {
                    id: 22,
                    name: '你好22',
                    children: []
                }, {
                    id: 23,
                    name: '你好23',
                    children: []
                }, {
                    id: 24,
                    name: '你好24',
                    children: []
                }]
            },
            {
                id: 33,
                name: '你好33',
                children: [{
                    id: 31,
                    name: '你好31',
                    children: []
                }, {
                    id: 32,
                    name: '你好32',
                    children: []
                }, {
                    id: 33,
                    name: '你好33',
                    children: []
                }, {
                    id: 34,
                    name: '你好34',
                    children: []
                }]
            },
            {
                id: 4,
                name: '你好4',
                children: [{
                    id: 41,
                    name: '你好41',
                    children: []
                }, {
                    id: 42,
                    name: '你好42',
                    children: []
                }, {
                    id: 43,
                    name: '你好43',
                    children: []
                }, {
                    id: 44,
                    name: '你好44',
                    children: []
                }]
            }
            ];

            // 自定义选项
            context.customOptions = [{
                title: '广告计划名称',
                name: 'report-ad-group-ggjhmc',
                checked: true,
                key: 'display',
                width: 150
            },
            {
                title: '广告计划ID',
                name: 'report-ad-group-ggjhid',
                checked: true,
                key: 'click',
                width: 150
            },
            {
                title: '项目名称',
                name: 'report-ad-group-xmmc',
                checked: true,
                key: 'display',
                width: 150
            },
            {
                title: '项目ID',
                name: 'report-ad-group-xmid',
                checked: true,
                key: 'click',
                width: 150
            },
            {
                title: '展示量',
                name: 'report-ad-group-zsl',
                checked: true,
                key: 'display',
                width: 150
            },
            {
                title: '点击量',
                name: 'report-ad-group-djl',
                checked: true,
                key: 'click',
                width: 150
            },
            {
                title: '转化量',
                name: 'report-ad-group-zhl',
                checked: true,
                key: 'distinctDisplay',
                width: 150
            },
            {
                title: '点击率',
                name: 'report-ad-group-djlv',
                checked: true,
                key: 'ctr',
                width: 150
            },
            {
                title: '转化率',
                name: 'report-ad-group-zhlv',
                checked: true,
                key: 'cvr',
                width: 150
            },
            {
                title: '转化成本',
                name: 'report-ad-group-zhcb',
                checked: true,
                key: 'distinctClick',
                width: 150
            },
            {
                title: '单次点击成本',
                name: 'report-ad-group-dcdjcb',
                checked: true,
                key: 'distinctClick',
                width: 150
            },
            {
                title: '千次曝光成本',
                name: 'report-ad-group-qcbgcb',
                checked: true,
                key: 'distinctClick',
                width: 150
            },
            {
                title: '消耗',
                name: 'report-ad-group-xh',
                checked: true,
                key: 'distinctCtr',
                width: 150
            }
            ];
            if (yiche.util.getSessionStorage('reportADGroupMenu')) {
                context.customOptions = yiche.util.getSessionStorage('reportADGroupMenu');
            }
            // 
            context.manufacturerImageUrl = [{
                name: '文件1',
                url: 'http://image.bitautoimg.com/slpfile/6bfa3d43ff1d4ffa947a7d3601568639.jpg',
                uploadStatus: true
            }, {
                name: '文件2',
                url: 'http://image.bitautoimg.com/slpfile/45c054d58ec349ee8a2685a4a6147a4e.jpg',
                uploadStatus: true
            }, {
                name: '文件3',
                url: 'http://image.bitautoimg.com/slpfile/a5b98ddd214747179c5d5e6b736c7d29.jpg',
                uploadStatus: true
            }];

            // 拖动排序数据
            context.dragList = [
                {
                    id: 1,
                    name: '内容1'
                },
                {
                    id: 2,
                    name: '内容2'
                }, {
                    id: 3,
                    name: '内容3'
                }, {
                    id: 4,
                    name: '内容4'
                }, {
                    id: 5,
                    name: '内容5'
                }
            ];
        },
        onafterrender: function (){

        },
        onleave: function () {
            yiche.util.removeDialog();
        }
    });

    ecui.esr.addRoute(
        'reportADGroupListTable', {
            model: ['reportADGroupList@JSON ' + yiche.info.API_BASE + 'ad-report-yms/groupByCondition?${tableParams}'],
            main: 'reportAdGroupListTableView',
            view: 'reportADGroupTableTarget',
            onbeforerequest: function (context) {
                const tmp = {};
                ecui.esr.parseObject(document.forms.reportADGroupSearchParamsForm, tmp, false);

                // 记录当前页信息
                context.pageNo = context.pageNum = context.pageNo || +this.searchParm.pageNo;
                context.pageSize = this.searchParm.pageSize = +context.pageSize || +this.searchParm.pageSize;

                // 回填 pageNum 和 pageSize
                context.basePaginationInfo = Object.assign(context.basePaginationInfo, {
                    pageNo: context.pageNo,
                    pageSize: context.pageSize
                });

                // 合并请求参数
                context.tableParams = Object.assign(context.tableParams, tmp, context.basePaginationInfo);
            },
            onbeforerender: function (context) {
                context.tableWidth = 412;
                let tempTableWidth = context.tableWidth;
                context.customOptions.forEach(item => {
                    if (item.checked) {
                        tempTableWidth += item.width + 12;
                    }
                });
                context.tableWidth = tempTableWidth;

                // 处理表头宽度
                let currentWidth = document.querySelector('.page-container').offsetWidth - 50;
                context.fixWidth = currentWidth - context.tableWidth - 12;
                context.tableWidth = Math.max(context.tableWidth, currentWidth);
            }
        }
    );

    ecui.esr.addRoute('dialogTest', {
        model: [],
        main: 'dialog_test',
        view: 'demoDialogBodyTarget'
    });
}());