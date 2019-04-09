/**
 *思路：1、https://github.com/amfe/lib-flexible/blob/2.0/index.js
 *2、https://juejin.im/post/5b0a9f266fb9a07aa114a908
 *3、https://github.com/hbxeagle/rem  (在chrome上模拟，demo提到的一些bug没显示出来，但是在老机型上应该还是存在的)
 *知识点：
 *1、在javascript中，可以通window.devicePixelRatio获取到当前设备的dpr；dpr=物理像素/设备独立像素(css像素)
 *2、通过document.documentElement.clientWidth获取deviceWidth；
 *3、onpageshow事件: https://developer.mozilla.org/zh-CN/docs/Web/Events/pageshow
 *4、getComputedStyle：https://developer.mozilla.org/zh-CN/docs/Web/API/Window/getComputedStyle
**/
;(function(designW, rate){
	var docEl = document.documentElement;//返回文档的文档元素，即HTML元素
	var metaEl = document.querySelector('meta[name="viewport"]');//找到meta[viewport]元素
	var head = document.getElementsByTagName('head')[0];//获取head元素
	var dfs = getDFS();//获取浏览器默认fontsize

	//如果页面没设置meta viewport,增加设置。如果不设置meta viewport 默认页面宽度980px;虽然不影响rem，但计算的数值会让人难以理解。所以强制单倍
	if(metaEl){
		metaEl.setAttribute('content','width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0')
	}else{
		console.warn('当前页面未设置meta[name="viewport"],默认设备最小宽度会取980px');
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
	//获取浏览器默认font-size
	function getDFS(){
		//由于js取默认font-size值的时候浏览器进行了四舍五入，所以换个style属性（如width）取1rem对应的px值
		var d = document.createElement('div');
		d.id = 'J_temp';d.style.width = '1rem';d.style.display = 'none';
		head.appendChild(d);
		var defaultFontSize = parseFloat(window.getComputedStyle(d, null).getPropertyValue('width'));
		head.removeChild(d);//删除元素
		d = null;//获取defaultFontSize后清除内存占用
		return defaultFontSize;
	}
	//设置基础值,如：1rem = 100px,因为方便换算，不管什么尺寸的设计稿，rem换算的时候都是除以100
	function setRemUnit(){
		//设百分比值，16px为浏览器默认根节点html的font-size大小
		var rem = ((docEl.clientWidth/designW)*rate/dfs)*100 + '%';
		//获取设备像素比,页面字体适配
		var dpr = window.devicePixelRatio || 1; 
		docEl.style.fontSize = rem;
		//给html元素设置一个data-dpr属性，存放设备dpr值用于媒体查询实现响应式
		docEl.setAttribute('data-dpr', parseInt(dpr));
	}
	setRemUnit();
	//监听页面缩放(横竖屏切换时也会触发)
	window.addEventListener('resize', setRemUnit);
	//onload 事件在页面第一次加载时触发， onpageshow 事件在每次加载页面时触发,不同事件，回调函数中的event/e对象不同
	window.addEventListener('pageshow',function(e){
		//页面是否从浏览器缓存中加载（浏览器后退按钮），如果是的话重新设置fontsize
		if(e.persisted){
			setRemUnit();
		}
	});

})(750, 100);//设计稿宽750，换算比例1rem = 100px