/**
 *思路来源：https://www.jianshu.com/p/4c93f5bd9861
 *
 *收获：
 *
 *github地址：
 *实现的功能：
 *1、
 *2、避免加载太久，提供一个直接完成的接口
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
			var $prg = this.$prg = document.getElementById(selector)
			return $prg;
		},
		valDom:function(selector){
			//获取进度条元素
			var $val = this.$val = document.getElementById(selector);
			return $val;
		},
		progress:function(dist, cb){//进度主函数
			console.log(this);
			console.log(xLoading.fn);
			var _self = this;
			this.timer = window.setInterval(function(){
				if(_self.prg>=dist){
					window.clearInterval(_self.timer);
					_self.prg=dist
					cb&&cb();
				}else{
					_self.prg++;
					_self.$prg.style.width = _self.prg+'%';
					_self.$val.innerText = _self.prg+'%';
				}
			}, 100);
		},
		add:function(dist, cb){//传值
			//传得值要和当前已经累加到的值next作比较
			
			this.progress(this.next,cb);
		},
		complete:function(){},
		random:function(){}
	}
	//设置实例
	var init = xLoading.fn.init = function(box){
		this.prg = 0;//进度条具体值
		this.timer = 0;//定时器
		this.next = this.prg;//增量进度，实现
		this[0] = document.getElementById(box);//指定进度条根dom元素
		return this;
	}
	//拿到公共方法
	init.prototype = xLoading.fn;

	window.xLoading = xLoading;
})(window, document)