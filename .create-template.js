/***route.js-begin***/
(function() {
    Object.assign(
        NS.ui, {

        }
    );

    ecui.esr.addRoute('{route}', {
        model: function(context, callBack) {
            let requestUrl = ['getXxxList@GET ' + yiche.info.API_BASE + 'search/tool/channels'];
            ecui.esr.request(requestUrl, callBack);
            return false;
        },
        main: 'container', // 挂载容器
        view: '{target}Target', // 渲染模板
        children: ['{target}Table'],
        onbeforerequest: function(context) {
            // 列表请求数据
            context.tableParams = {};
        },
        onbeforerender: function(context) {
            // 面包屑导航
            ecui.esr.setData('globleCrumbs', [{
                content: '订单'
            }]);

            if(!context.getXxxList){
				context.getXxxList = [];
            }
        },
        onafterrender: function(context) {},
        onleave: function(context) {
            yiche.util.removeDialog();
        }
    });

    ecui.esr.addRoute(
        '{target}Table', 
        {
            model: function(context, callBack) {
                let requestUrl = ['{target}TableList@JSON ' + yiche.info.API_BASE + 'maintain/v1/standard/list?${tableParams}'];
                ecui.esr.request(requestUrl, callBack);
                return false;
            },
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
<div class="no-result">
    <img class="empty-img" src="images/empty@2x.png" alt="" />
    <p>未找到相关数据</p>
</div>
<!-- /if -->
<!-- if: ${{route}TableList.total} && ${{route}TableList.total} !=='0' &&  ${{route}TableList.pageSize} && ${{route}TableList.pageNo} -->
<div class="page-info" ui="type:yiche.ui.Pagination;total:${{route}TableList.total};pageSize:${{route}TableList.pageSize};pageNo:${{route}TableList.pageNo};"></div>
<!-- /if -->

/***route.html-end***/

/***route.css-begin***/
/***route.css-end***/