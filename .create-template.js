/***route.js-begin***/
(function() {
    Object.assign(
        NS.ui, {

        }
    );

    ecui.esr.addRoute('{route}', {
        model: ['getXxxList@GET ' + yiche.info.API_BASE + 'search/tool/channels'],
        main: 'container', // 挂载容器
        view: '{target}Target', // 渲染模板
        children: ['{target}Table'],
        onbeforerequest: function(context) {
            
        },
        onbeforerender: function(context) {
            // 面包屑导航
            ecui.esr.setData('globleCrumbs', [{
                content: '订单'
            }]);
        },
        onafterrender: function(context) {},
        onleave: function() {
            yiche.util.removeDialog();
        }
    });

    ecui.esr.addRoute(
        '{target}Table', 
        {
            model: ['{target}TableList@JSON ' + yiche.info.API_BASE + 'maintain/v1/standard/list?${tableParams}'],
            main: 'table_view',
            view: '{target}TableTarget',
            onbeforerequest: function(context) {
                let tmp = {};
                ecui.esr.parseObject(document.forms.{target}Form, tmp, false);

                // 合并请求参数
                context.tableParams = Object.assign({}, tmp, {
                    pageNo: context.pageNo,
                    pageSize: context.pageSize,
                });
            },
            onbeforerender: function(context) {
               
            },
            onafterrender: function(context) {}
        }
    )
}());
/***route.js-end***/

/***route.html-begin***/
<!-- target:{route}Target -->
<div class="page-container">
    <form name="{route}Form">
    </form>
    <div class="page-list-session" id="table_view">
    </div>
</div>

<!-- target: {route}TableTarget -->
<!-- if: ${{route}TableList.data.length} > 0 -->
<div ui="type:frd.SimulationLockTable;">
    <table>
        <thead>
            <tr>
                <th style="width: 120px;">预览</th>
                <th style="width: 100px;">创意ID</th>
                <th style="width: 120px;">创意名称</th>
            </tr>
        </thead>
        <tbody>
            <!-- for: ${{route}TableList.data} as ${item}, ${index} -->
            <tr>
                <td style="width: 120px;">
                    <span class="word-clamp-2" title="${item.name}">${item.name}</span>
                </td>
                <td style="width: 100px;">
                    <span class="word-clamp-2" title="${item.campaignId}">${item.campaignId}</span>
                </td>
                <td style="width: 120px;">
                    <span class="word-clamp-2" title="${item.adId}">${item.adId}</span>
                </td>
            </tr>
            <!-- /for -->
        </tbody>
    </table>
</div>
<!-- else -->
<!-- use: noDataTarget() -->
<!-- /if -->
<!-- if: ${{route}TableList.totalRecord} && ${{route}TableList.totalRecord} !=='0' -->
<div ui="type:yiche.ui.Pagination;total:${{route}TableList.totalRecord};pageSize:${{route}TableList.pageSize};pageNo:${{route}TableList.pageNo};"></div>
<!-- /if -->

/***route.html-end***/

/***route.css-begin***/
/***route.css-end***/