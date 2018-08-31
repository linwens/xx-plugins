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
	var xLD = function(box){
		return new xLD.fn.init(box);
	}
	//存放原型上的方法
	xLD.fn = xLD.prototype = {
		contructor: xLD,
		prgDom:function(selector){
			//获取进度条展示元素
			var $prg = null;
			if(!selector){
				$prg = document.createElement('b');
				$prg.id = "J_val";
				this[0].appendChild($prg);
				this.$prg = $prg;
			}else{
				$prg = this.$prg = document.getElementById(selector);
			}
			return $prg;
		},
		valDom:function(selector){
			//获取进度值展示元素
			var $val = null;
			if(!selector){
				$val = document.createElement('b');
				$val.id = "J_val";
				this[0].appendChild($val);
				this.$val = $val;
			}else{
				$val = this.$val = document.getElementById(selector);
			}
			return $val;
		},
		add:function(incre, speed, cb){//增量，数字变化时间间隔，回调函数
			//传得值要和当前已经累加到的值next作比较
			if(this.next + incre >=100){
				this.next = 100;
			}else{
				this.next += incre;
			}
			progress.apply(this,[this.next, speed, cb]);
			//this.progress(this.next, speed, cb);
		},
		complete:function(speed,cb){
			this.add(100, speed, cb);
		},
		random:function(n){
			return n+(100-Math.random()*200);//{n-100,n+100}
		}
	}
	//进度主函数(进度值，数字变化时间间隔，回调函数),写这里是为了不把progress函数对外暴露
	function progress(phase, speed, cb){
		var _self = this;
		var _speed = this.random(speed);//随机化间隔时间，更真实
		window.clearInterval(this.timer);//如果上一轮定时器未走完，新定时器已启动，新的覆盖旧的
		this.timer = window.setTimeout(function(){
			if(_self.prg>=phase){
				window.clearInterval(_self.timer);
				_self.prg=phase
				cb&&cb();
			}else{
				_self.prg++;
				_self.$prg.style.width = _self.prg+'%';
				_self.$val.innerText = _self.prg;
				progress.call(_self,phase, _speed, cb);
			}
		}, _speed);//间隔时间动态
	}

	//设置实例
	var init = xLD.fn.init = function(box){
		this.prg = 0;//进度条具体值
		this.timer = 0;//定时器
		this.next = this.prg;//增量进度，实现
		this[0] = document.getElementById(box);//指定进度条根dom元素
		return this;
	}
	//拿到公共方法
	init.prototype = xLD.fn;

	window.xLD = xLD;
})(window, document)