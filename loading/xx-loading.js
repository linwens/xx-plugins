/**
 *思路来源：https://www.jianshu.com/p/4c93f5bd9861
 *
 *收获：
 *
 *github地址：
 *实现的功能：
 *1、
 *2、
**/

(function(window, document){
	var xLoading = function(box){
		return new xLoading.fn.init(box);
	}
	//存放原型上的方法
	xLoading.fn = xLoading.prototype = {
		contructor: xLoading,
		prgDom:function(selector){
			//获取进度条元素
			
		}
	}
	//设置实例
	var init = xLoading.fn.init = function(box){
		this[0] = document.getElementById(box);//指定进度条根dom元素
		console.log(this);
		return this;
	}
	//拿到公共方法
	init.prototype = xLoading.fn;

	window.xLoading = xLoading;
})(window, document)