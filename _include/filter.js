(function() {
    /*定义etpl过滤器
     *
     *addFilter参数
     *{string}name - 过滤器名称
     *{Function}filter - 过滤函数
     */
    etpl.addFilter('stringify', function(value) {
        return JSON.stringify(value || {});
    });
    etpl.addFilter('toFixed', function(value, divisor, fixedNum) {
        return (Number(value) / divisor).toFixed(fixedNum);
    });
    // 根据 code 从 baseInfoMap 中解析数据
    etpl.addFilter('parseBaseInfo', function(value, nameSpace) {
        return yiche.info.baseInfoMap[nameSpace][value.toString()] || '--';
    });
    // 时间转换过滤器
    etpl.addFilter('dateFormat', function(value, format) {
        return value ? util.formatDate(new Date(Number(value)), format) : '';
    });
    //数据为空时用 --代替
    etpl.addFilter('default', function(value) {
        return value || '--';
    });
    // 数字 保留两位小数，加千分位
    etpl.addFilter('numberFormat', function(num) {
        if (num === '' || num.length < 1 || num === '--') {
            return '--';
        }
        num = Number(num);
        num = String(num.toFixed(2));
        var re = /(-?\d+)(\d{3})/;
        while (re.test(num)) {
            num = num.replace(re, "$1,$2");
        }
        return num;
    });
    etpl.addFilter('parseBr', function(value) {
        var value = value.replace(/\n|\\n/g, '<br/>');
        return value || '--';;
    });

    etpl.addFilter('toThousands', function(value) {
        return yiche.util.getToThousands(value);
    });
    /* 自定义etpl过滤器 - end */
})();