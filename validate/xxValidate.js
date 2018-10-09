/**
 * GitHub地址：
 * 
 * 思路：
 * 
 * 设计模式：策略模式
 * 
 * 关键方法：
 * 
 * 调用方式：
 * 
 * 
 *  
 **/
;(function(window, document){
    //预先定义好(各种校验规则)策略，替换N个if判断
    var strategies = {
        isNonEmpty: function(){}
    };
    //定义Validator工具类
    var Validator = function(){
        this.cache = []; //保存校验规则
    };
    //保存校验规则的函数
    Validator.prototype.add = function(){};
    //启动校验的函数
    Validator.prototype.start = function(){};

    //暴露给用户的方法
    var validateFunc = function(){
        var validator = new Validator();
        //增加校验规则
        validator.add();
        //获得校验结果
        var errorMsg = validator.start();
        //返回校验结果
        return errorMsg;
    };

    //对外暴露函数接口
    window.xxValid = validateFunc;


})(window, document);