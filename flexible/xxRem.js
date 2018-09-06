/**
 *思路：1、https://github.com/amfe/lib-flexible/blob/2.0/index.js
 *2、https://juejin.im/post/5b0a9f266fb9a07aa114a908
 *3、https://github.com/hbxeagle/rem  (在chrome上模拟，demo提到的一些bug没显示出来，但是在老机型上应该还是存在的)
 *知识点：
 *1、在javascript中，可以通window.devicePixelRatio获取到当前设备的dpr；dpr=物理像素/设备独立像素(css像素)
 *2、通过document.documentElement.clientWidth获取deviceWidth；
 *3、getComputedStyle：https://developer.mozilla.org/zh-CN/docs/Web/API/Window/getComputedStyle
 *理解：
 *1、网易的做法：以640设计稿宽度、html的font-size=100px为基准换算页面布局中css的宽度,；同时决定了不同设备上的html的font-size=(deviceWidth/640)*100 px;问：640的设计稿做出来的页面，页面上有个元素的宽是2rem，那在iphone4上等于多少px?
 *2、阿里的做法：scale = 1 / dpr;布局视口根据scale缩放；如果dpr=2,那就会缩小一半，所以字体font-size设置两倍px。淘宝将布局视口(设计稿)设置成了物理像素大小（即750设计稿就是物理像素个数，iphone6的设备宽度是375，如果不缩放就是两倍大），通过 scale缩放（缩放一半刚好是设备宽）嵌入了 视觉视口中；因为把css像素跟物理像素1:1对应了，就不会有一像素问题
 *问题：
 *1、直接使用flexible：在页面初始化的时候会有个画面抖动，实现适配，不好...可能是出于静态资源加载慢的问题
 *2、
**/
;(function(window, document, designW){
	console.log('dpr===>'+window.devicePixelRatio);
	console.log('deviceWidth==>'+document.documentElement.clientWidth);
	

	var docEl = document.documentElement;//返回文档的文档元素，即HTML元素
	var metaEl = document.querySelector('meta[name="viewport"]');//找到meta[viewport]元素
	var htmlStyle = window.getComputedStyle(docEl,null);
	// var htmlFontSize = parseFloat(htmlStyle.getPropertyValue('font-size'));//获取到系统字体大小
	// console.log(document.getElementsByTagName('html')[0]===docEl);
	// console.log(htmlStyle);
	//如果页面没设置meta viewport,增加设置。如果不设置meta viewport 默认页面宽度980px;虽然不影响rem，但计算的数值会让人难以理解。所以强制单倍
	if(metaEl){
		metaEl.setAttribute('content','width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0')
	}else{
		console.warn('当前页面未设置meta[name="viewport"],默认设备宽度会取980px');
		metaEl = document.createElement('meta');
		metaEl.setAttribute('name','viewport');
		metaEl.setAttribute('content','width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0')
		if (docEl.firstElementChild) {//html元素的第一个子元素是否存在，一般就是head标签
		    docEl.firstElementChild.appendChild(metaEl);
		} else {
		    var wrap = doc.createElement('div');
		    wrap.appendChild(metaEl);
		    doc.write(wrap.innerHTML);
		    wrap = null;//清除掉wrap,节省内存
		}
	}
	//
	//设置基础值,如：1rem = 100px,因为方便换算，不管什么尺寸的设计稿，rem换算的时候都是除以100
	function setRemUnit(){
		//由于js去font-size值的时候浏览器进行了四舍五入，所以换个style属性（如width）取1rem对应的px值
		var d = null;//每次执行先清缓存
		d = document.createElement('div');
		d.style.width = '1rem';d.style.display = 'none';
		var head = document.getElementsByTagName('head')[0];
		head.appendChild(d);
		var defaultFontSize = parseFloat(window.getComputedStyle(d, null).getPropertyValue('width'))
		console.log(defaultFontSize);
		//考虑横竖屏的问题,在head的style标签里增加媒体查询
		var st = document.createElement('style');
		var portait = "@media screen and (min-width:"+docEl.clientWidth+"px){html{font-size:"+((docEl.clientWidth/designW)*100/defaultFontSize)*100+"%;}}";
		var landscape = "@media screen and (min-width:"+docEl.clientHeight+"px){html{font-size:"+((docEl.clientHeight/designW)*100/defaultFontSize)*100+"%;}}";
		st.innerHTML = portait+landscape;
		head.appendChild(st);
		//var rem = (docEl.clientWidth/designW)*100+'px';//1rem = 100px；如果设计稿是750，就相当于设备宽是7.5rem；
		var rem = ((docEl.clientWidth/designW)*100/defaultFontSize)*100 + '%';//设百分比值，16px为浏览器默认根节点html的font-size大小
		var dpr = window.devicePixelRatio || 1; //获取设备像素比,页面字体适配，0.5px兼容会用到
		docEl.style.fontSize = rem;
		//给html元素设置一个data-dpr属性，存放设备dpr值用于媒体查询实现响应式
		docEl.setAttribute('data-dpr', dpr);
		console.log(docEl.style.fontSize)
	}
	setRemUnit();
	
	console.log(htmlStyle['float']);
	console.log(htmlStyle.getPropertyValue('float'));
	//增加横竖屏切换的监听
	window.onorientationchange = function(){
		window.location.reload();//直接重新加载页面
	};
	window.addEventListener('resize', setRemUnit);//监听页面缩放
	window.addEventListener('pageshow',function(e){//onload 事件在页面第一次加载时触发， onpageshow 事件在每次加载页面时触发,不同事件，回调函数中的event/e对象不同
		//https://developer.mozilla.org/zh-CN/docs/Web/Events/pageshow
		if(e.persisted){//页面是否从浏览器缓存中加载（浏览器后退按钮），如果是的话重新设置fontsize
			setRemUnit();
		}
	});

})(window, document, 640);