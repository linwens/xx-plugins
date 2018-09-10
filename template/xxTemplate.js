/**
 *思路：
 *  1、underscore.js源码1.9.1：https://github.com/jashkenas/underscore/blob/master/underscore.js
 *  2、廖雪峰教程：https://www.liaoxuefeng.com/article/001426512790239f83bfb47b1134b63b09a57548d06e5c5000
 *
 *设计模式：
 *
 *调用方式：
 *  1、xxTPL(tpl, html)
 *  2、支持require引入
 *  3、模拟underscore.template的调用方式
 		var html = $('#tpl_curProducts').html();//banner上的标展示
 		var template = _.template(html);
 		var tpl = template({data:rslt.information_list});
 		$('#J_curProducts').append(tpl);
 *  4、
 *
**/
;(function(window, document){
	var xxTPL = function(){};

	window.xxTPL = xxTPL;
})(window, document);