/**
 * GitHub地址：
 * 
 * 思路：
 * 
 * 设计模式：代理模式
 * 
 * 关键方法：
 * 
 * 调用方式：
 * 
 * 
 *  
 **/
;(function(window, document){
    //本体对象，用于生成最终展示的图片
    var myImage = (function(){
        //生成img标签
        var imgNode = document.createElement('img');
        document.body.appendChild(imgNode);

        return {
            //对外提供接口，用于设置图片路径
            setSrc: function( src ){
                imgNode.src = src;
            }
        }
    })();
    //代理对象，用于生成预加载的图片
    var proxyImage = (function(){
        var img = new Image; //实例化一个image对象
        img.onload = function(){//当image对象的src内容加载完成的时候触发函数，生成img标签
            myImage.setSrc(this.src);//此时生成的图片静态资源已经加载好了
        }

        return {
            setSrc: function(src){//对外暴露接口，用于设置img标签的src
                myImage.setSrc('path/to/loading.gif');//在设置src之前先生成一个本地图片用于，使用户在等待图片加载完成的时间段内不至于看一个白屏
                img.src = src;//设置图片src
            }
        }
    })();

    window.lazyImg = proxyImage.setSrc;//对外暴露接口，用于设置图片资源路径

})(window, document);