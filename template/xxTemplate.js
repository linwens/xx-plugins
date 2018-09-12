/**
 *思路：
 *  1、underscore.js源码1.9.1：https://github.com/jashkenas/underscore/blob/master/underscore.js
 *  2、廖雪峰教程：https://www.liaoxuefeng.com/article/001426512790239f83bfb47b1134b63b09a57548d06e5c5000
 *  3、冴羽的文章：https://segmentfault.com/a/1190000012501120
 *  4、
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
; (function (window, document) {
	var xxTPL = function (tpl) {
		//定义函数体内容
		var code = "var p = []; p.push('";
		code += tpl.replace(/[\r\t\n]/g, "")
			.replace(/<%=(.*?)%>/g, "');p.push($1);p.push('")
			.replace(/<%/g, "');")
			.replace(/%>/g, "p.push('");
		code += "');return p.join('')"
		//上面的正则匹配要优化



		//声明函数,这个函数体里的内容会根据模板动态修改
		var fn = new Function("data",code);//这样声明的函数的最后一个参数是个字符串，它包含整个函数体的代码
		//声明渲染函数，为了链式调用，所以使用this
		var render = function (data) {
			return fn.apply(this, [data]);
		}
		return render;
	};

	window.xxTPL = xxTPL;
	

})(window, document);