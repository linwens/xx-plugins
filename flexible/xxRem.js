/**
 *思路：https://segmentfault.com/a/1190000007526917
 *知识点：
 *1、在javascript中，可以通window.devicePixelRatio获取到当前设备的dpr；dpr=物理像素/设备独立像素(css像素)
 *2、通过document.documentElement.clientWidth获取deviceWidth；
 *
 *理解：
 *1、网易的做法：以640设计稿宽度、html的font-size=100px为基准换算页面布局中css的宽度,；同时决定了不同设备上的html的font-size=(deviceWidth/640)*100 px;问：640的设计稿做出来的页面，页面上有个元素的宽是2rem，那在iphone4上等于多少px?
 *2、阿里的做法：scale = 1 / dpr;布局视口根据scale缩放；如果dpr=2,那就会缩小一半，所以字体font-size设置两倍px。淘宝将布局视口设置成了物理像素大小（即750设计稿就是物理像素个数，iphone6的设备宽度是375），通过 scale缩放（缩放一半刚好是设备宽）嵌入了 视觉视口中；
 *问题：
 *1、直接使用flexible：在页面初始化的时候会有个画面抖动，实现适配，不好...
 *2、
**/
;(function(window, document){
	console.log('dpr===>'+window.devicePixelRatio);
	console.log('deviceWidth==>'+document.documentElement.clientWidth);
	// var deviceWidth = document.documentElement.clientWidth;
	// if(deviceWidth > 640) deviceWidth = 640;
	// document.documentElement.style.fontSize = deviceWidth / 6.4 + 'px'; 
	var docEl = document.documentElement;//返回文档的文档元素，即HTML元素
	var dpr = window.devicePixelRatio || 1; //获取设备像素比,页面字体适配，0.5px兼容会用到

	//设置基础值,如：1rem = 75px
	function setRemUnit(){
		var rem = docEl.clientWidth / 10;//1rem = 设备宽的十分之一；如果设计稿是750，就相当于设备宽是750；
		docEl.style.fontSize = rem + 'px';
	}
	setRemUnit();

	//
	window.addEventListener('resize', setRemUnit);//监听页面缩放
	window.addEventListener('pageshow',function(e){//onload 事件在页面第一次加载时触发， onpageshow 事件在每次加载页面时触发,不同事件，回调函数中的event/e对象不同
		//https://developer.mozilla.org/zh-CN/docs/Web/Events/pageshow
		if(e.persisted){//页面是否从浏览器缓存中加载
			setRemUnit();
		}
	});

})(window, document);