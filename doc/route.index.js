(function() {
    Object.assign(
        NS.data, {}
    );

    Object.assign(
        NS.ui, {
            SetBarEcharts: ecui.inherits(
                yiche.ui.Echarts,
                function(el, options) {
                    yiche.ui.Echarts.call(this, el, options);
                }, {
                    transfromEchartOptions: function(data) {
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
                        }
                    }
                }
            ),
            CheckBox: ecui.inherits(yiche.ui.CustomCheckbox, {
                findChildrenControl: function(el) {
                    return yiche.util.findChildrenControl(el, NS.ui.CheckBox)
                },
                handleChange: function() {
                    let { itemLength, list } = this.getData();
                    let nowLen = list.length;
                    ecui.get('checkboxAll').changeStatus(itemLength, nowLen);
                }
            }),
            CustomCheckboxSelectAll: ecui.inherits(yiche.ui.CustomCheckboxSelectAll, {
                findChildrenControl: function(el) {
                    return yiche.util.findChildrenControl(el, NS.ui.CheckBox)
                }
            }),
            BtnCheckBox: ecui.inherits(yiche.ui.CustomCheckbox, {
                findChildrenControl: function(el) {
                    return yiche.util.findChildrenControl(el, NS.ui.BtnCheckBox)
                },
                handleChange: function() {
                    let { itemLength, list } = this.getData();
                    let nowLen = list.length;
                    ecui.get('checkboxAllBtn').changeStatus(itemLength, nowLen);
                }
            }),
            BtnCustomCheckboxSelectAll: ecui.inherits(yiche.ui.CustomCheckboxSelectAll, {
                findChildrenControl: function(el) {
                    return yiche.util.findChildrenControl(el, NS.ui.BtnCheckBox)
                }
            }),
            BorderCheckBox: ecui.inherits(yiche.ui.CustomCheckbox, {
                findChildrenControl: function(el) {
                    return yiche.util.findChildrenControl(el, NS.ui.BorderCheckBox)
                },
                handleChange: function() {
                    let { itemLength, list } = this.getData();
                    let nowLen = list.length;
                    ecui.get('checkboxAllBorder').changeStatus(itemLength, nowLen);
                }
            }),
            BorderCustomCheckboxSelectAll: ecui.inherits(yiche.ui.CustomCheckboxSelectAll, {
                findChildrenControl: function(el) {
                    return yiche.util.findChildrenControl(el, NS.ui.BorderCheckBox)
                }
            }),
            OpenDialog: ecui.inherits(
                ecui.ui.Control,
                function(el, options) {
                    ecui.ui.Control.call(this, el, options);
                    this._alignTyle = options.btnAlgin;
                }, {
                    onclick: function() {
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
            )
        }
    );

    ecui.esr.addRoute('index', {
        model: [
            //         'pixelLists@POST /console/report/filter/pixel',
        ],
        main: 'container', // 挂载容器
        view: 'docTarget', // 渲染模板
        onbeforerequest: function(context) {
            // 列表请求数据
            context.tableParams = {};
        },
        onbeforerender: function(context) {
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
                }, // echart的默认配置
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
        },
        onafterrender: function(context) {},
        onleave: function(context) {
            yiche.util.removeDialog();
        }
    });

    ecui.esr.addRoute('dialogTest', {
        model: [],
        main: 'dialog_test',
        view: 'demoDialogBodyTarget',
        onbeforerequest: function(context) {},
        onbeforerender: function(context) {},
        onafterrender: function(context) {}
    });
}());