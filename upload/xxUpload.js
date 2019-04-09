/**
 * GitHub地址：
 * 
 * 思路：
 * 
 * 设计模式：迭代器模式
 * 
 * 关键方法：
 * 
 * 调用方式：
 * 
 * 
 *  
 **/
;(function(window, document){
    //声明不同浏览器环境下不同的upload方法，替换if判断
    var getActiveUploadObj = function(){};
    var getFlashUploadObj = function(){};
    var getFormUploadObj = function(){};
    //声明一个迭代器函数用于遍历上面声明的函数
    var iteratorUploadObj = function(){};
    var uploadObj = iteratorUploadObj(getActiveUploadObj, getFlashUploadObj, getFormUploadObj);
    window.xxUld = uploadObj;

})(window, document);