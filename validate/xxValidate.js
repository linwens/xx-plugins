/**
 * GitHub地址：
 * 
 * 参考资料: https://github.com/jquery-validation/jquery-validation/blob/master/src/core.js , https://github.com/chriso/validator.js , js高级程序设计14章--表单脚本 , 
 * 
 * 思路：
 * 
 * 设计模式：策略模式
 * 
 * 关键方法：strategies[strategy].apply(dom, ary)
 * 
 * 调用方式：(dom, [{ strategy:'name[: other arg]', errMsg:'' }]),错误提示出现顺序依据调用顺序为准
 * 
 * 实现功能: 可设置提示出现位置,
 *  
 **/
;(function(window, document){
    //预先定义好(各种校验规则)策略，替换N个if判断
    var strategies = {
        // 是否为空
        isNoEmpty: function( val, errMsg){
            if( val === '' ){
                return errMsg;
            }
        },
        //最大长度
        maxLen:function( val, max, errMsg){
            if(val.length>max){
                return errMsg;
            }
        },
        //最小长度
        minLen:function( val, min, errMsg){
            if(val.length<min){
                return errMsg;
            }
        },
        //校验手机号
        isMobile: function( val, errMsg ){
            if(!/(^1[3|5|8][0-9]{9}$)/.test( val )){
                return errMsg;
            }
        },
    };
    //一些工具函数
    //给目标元素后面增加元素用于存放提示信息
    var createTips = function(target){
        
    };
    //定义Validator工具类
    var Validator = function(){
        this.cache = []; //保存校验规则
    };
    //保存校验规则的函数
    Validator.prototype.add = function(dom, rules){
        var _self = this;
        for(var i=0, rule; rule=rules[i++];){
            (function(rule){//通过闭包预存rule, 不然push的时候会有问题,而且访问不到rule变量
                var ary = rule.strategy.split(':');
                var errMsg = rule.errMsg;
                
                _self.cache.push(function(){
                    var strategy = ary.shift(); // shift()把数组的第一个元素从其中删除，并返回第一个元素的值.
                    ary.unshift(dom.value); //数组首部存入value
                    ary.push(errMsg); // 数组尾部存入errMsg
                    return strategies[strategy].apply(dom, ary); // 绑定this,返回函数
                })
            })(rule)
        }
    };
    //启动校验的函数
    Validator.prototype.start = function(){
        for(var i=0, validateFunc; validateFunc = this.cache[i++];){ // 遍历缓存的校验规则, 执行校验获取返回信息
            var msg = validateFunc();
            if(msg){ // 如果存在返回信息说明校验没通过
                return msg;
            }
        }
    };

    // //暴露给用户的方法
    // var validateFunc = function(dom){
    //     var validator = new Validator();
    //     //增加校验规则(不能自动化)
    //     validator.add(dom.userName, 'isNoEmpty', '用户名不能为空');
    //     validator.add(dom.pwd, 'minLen:6', '密码长度不能少于 6 位');
    //     validator.add(dom.phoneNumber,'isMobile', '手机号码格式不正确');
    //     //获得校验结果
    //     var errorMsg = validator.start();
    //     //返回校验结果
    //     return errorMsg;
    // };

    //对外暴露函数接口
    //window.xxValid = validateFunc;
    window.xxValid = Validator;

})(window, document);