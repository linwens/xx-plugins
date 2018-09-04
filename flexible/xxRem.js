/**
 *思路：https://segmentfault.com/a/1190000007526917
 *知识点：
 *1、在javascript中，可以通window.devicePixelRatio获取到当前设备的dpr；dpr=物理像素/设备独立像素(css像素)
 *2、通过document.documentElement.clientWidth获取deviceWidth；
 *
 *理解：
 *1、网易的做法：以640设计稿宽度、html的font-size=100px为基准换算页面布局中css的宽度,；同时决定了不同设备上的html的font-size=(deviceWidth/640)*100 px;问：640的设计稿做出来的页面，页面上有个元素的宽是2rem，那在iphone4上等于多少px?
 *2、阿里的做法：scale = 1 / dpr;布局视口根据scale缩放；如果dpr=2,那就会缩小一半，所以字体font-size设置两倍px。淘宝将布局视口设置成了物理像素大小（即750设计稿就是物理像素个数，iphone6的设备宽度是375），通过 scale缩放（缩放一半刚好是设备宽）嵌入了 视觉视口中；
**/
;(function(window, document){
	console.log('dpr===>'+window.devicePixelRatio);
	console.log('deviceWidth==>'+document.documentElement.clientWidth);
	var deviceWidth = document.documentElement.clientWidth;
	if(deviceWidth > 640) deviceWidth = 640;
	document.documentElement.style.fontSize = deviceWidth / 6.4 + 'px'; 
})(window, document);