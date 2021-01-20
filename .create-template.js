/***route.js-begin***/
(function() {
    Object.assign(
        NS.data, {}
    );

    Object.assign(
        NS.ui, {

        }
    );

    ecui.esr.addRoute('{route}', {
        model: [
//         'pixelLists@POST /console/report/filter/pixel',
        ],
        main: 'container', // 挂载容器
        view: '{target}Target', // 渲染模板
        children: ['{target}Table'],
        onbeforerequest: function(context) {
            // 列表请求数据
            context.tableParams = {
            };
        },
        onbeforerender: function(context) {
            // 面包屑导航
            ecui.esr.setData('globleCrumbs', [{
                content: '订单'
            }]);
            // 图片尺寸
            context.pixelLists = context.pixelLists || [];
        },
        onafterrender: function(context) {},
        onleave: function(context) {
            yiche.util.removeDialog();
        }
    });

    ecui.esr.addRoute(
        '{target}Table', 
        {
            // model: ['{target}Table@JSON /console/report/creatives?${tableParams}'],
            main: 'table_view',
            view: '{target}TableTarget',
            searchParm: {
                pageNo: 1,
                pageSize: 20
            },
            onbeforerequest: function(context) {
                let tmp = {};
                ecui.esr.parseObject(document.forms.{target}Form, tmp);

                // 记录当前页信息
                context.pageNo = context.pageNum = context.pageNo || +this.searchParm.pageNo;
                context.pageSize = this.searchParm.pageSize = +context.pageSize || +this.searchParm.pageSize;
                // 回填 pageNum 和 pageSize
                context.tableParams = Object.assign(context.tableParams, tmp, {
                    pageNum: context.pageNo,
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
        <div class="page-query">
    
        </div>
    </form>
    <div class="page-list-session" id="table_view">
    </div>
</div>

<!-- target: {route}TableTarget -->
<!-- if: ${{route}Table.total} && ${{route}Table.total} > 0 -->
<div ui="type:table;headFloat:0;">
    <table>
        <thead>
            <tr>
                <th style="width: 120px;">预览</th>
                <th style="width: 100px;">创意ID</th>
                <th style="width: 120px;">创意名称</th>
            </tr>
        </thead>
        <tbody>
            <!-- for: ${{route}Table.list} as ${item}, ${index} -->
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
<div class="pagination-container" ui="type:frd.Pagination;total:${{route}Table.total};pageSize:${pageSize};pageNo:${pageNo};"></div>
<!-- else -->
<div class="no-result">
    <img class="empty-img" src="images/empty@2x.png" alt="" />
    <p>未找到相关数据</p>
</div>
<!-- /if -->

/***route.html-end***/

/***route.css-begin***/
/***route.css-end***/