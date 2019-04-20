/**
 * GitHub地址：https://github.com/madrobby/zepto/blob/master/src/zepto.js   
 * 
 * 中文文档：https://www.html.cn/doc/zeptojs_api/
 * 
 * 思路：
 * 
 * 设计模式：策略模式
 * 
 * 实现功能: 1. 
 **/
(function(global, factory) {
    factory(global)
}(this, function(window) {
    var Xepto = (function(){
        /**
         * 初始化变量
         * 1、$
         * 2、xepto
         * 3、fragmentRE正则：用来匹配标签字符串
         * 4、simpleSelectorRE正则：校验字符串名称是否含 - 
         * 5、readyRE正则：判断文档加载状态
         * 6、emptyArray缓存一个空数组
         * 7、isArray判断是否是数组
         * 8、class2type存储类型值
         * 9、filter数组的过滤器方法
         * 10、tempParent是一个div元素
         */
        //-----------------------------------------------------------
        var $, xepto = {};
        var fragmentRE = /^\s*<(\w+|!)[^>]*>/;
        var simpleSelectorRE = /^[\w-]*$/;
        var readyRE = /complete|loaded|interactive/;
        var emptyArray = [];
        var isArray = Array.isArray || function(object) {
            return object instanceof Array
        };
        var class2type = {},
        toString = class2type.toString;
        var filter = emptyArray.filter;
        var tempParent = document.createElement('div');
        /**
         * 初始化一些方法函数
         * 1、Z构造函数Z(dom, selector)
         * 2、type函数判断数据类型
         * 3、isFunction判断是否是函数
         * 4、compact返回项不为空的数组
         * 5、isObject是否为对象
         * 6、isPlainObject是否是纯对象
         * 7、isWindow是否是window对象
         * 8、是否是类数组
         */
        //------------------------------------------------------------
        function Z(dom, selector) {
            var i, len = dom ? dom.length : 0
            for (i = 0; i < len; i++) {
                this[i] = dom[i]
            }
            this.length = len;
            this.selector = selector || '';
        }
        function type(obj) {
            return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
        }
        function isFunction(value) {
            return type(value) == "function"
        }
        function compact(array) {
            return filter.call(array, function(item){
                return item != null;
            })
        }
        function isObject(obj) {
            return type(obj) == "object"
        }
        function isWindow(obj) {
            return obj != null && obj == obj.window
        }
        function isPlainObject(obj) {
            return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
        }
        //+?
        function likeArray(obj) {
            var length = !!obj && 'length' in obj && obj.length,
                type = $.type(obj);
            return 'function' != type && !isWindow(obj) && ('array' == type || length === 0 ||(typeof length == 'number' && length > 0 && (length - 1) in obj))
        }
        /**
         * 声明xepto里的方法
         * 1、xepto.Z方法返回一个实例
         * 2、[核心] init方法处理传参，最后调用xepto.Z生成$对象
         * 3、xepto.fragment方法返回dom元素
         * 4、xepto.qsa方法通过css的id/类名/tag生成元素
         * 5、xepto.matches方法
         */
        //-------------------------------------------------------------
        xepto.Z = function(dom, selector) {
            return new Z(dom, selector)
        }
        xepto.fragment = function(html, name, properties) {
            var dom, nodes, container

            if (singleTagRE.test(html)) {
                dom = $(document.createElement(RegExp.$1))
            }
            if (!dom) {
                if (html.replace) {
                    html = html.replace(tagExpanderRE, "<$1></$2>")
                }
                if (name === undefined) {
                    name = fragmentRE.test(html) && RegExp.$1
                }
                if (!(name in container)) {
                    name = '*'
                }
                container = containers[name];
                container.innerHTML = '' + html;
                dom = $.each(slice.call(container,childNodes), function(){
                    container.removeChild(this)
                })
            }
            if (isPlainObject(properties)) {
                nodes = $(dom)
                $.each(properties, function(key, value) {
                    if ( methodAttributes.indexOf(key) > -1) {
                        nodes[key](value)
                    } else {
                        nodes.attr(key, value)
                    }
                })
            }
            return dom
        }
        xepto.qsa = function(element, selector){
            var found,
                maybeID = selector[0] == '#',
                maybeClass = !maybeID && selector[0] == '.',
                nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
                isSimple = simpleSelectorRE.test(nameOnly);
            return (element.getElementById && isSimple && maybeID) ? ( (found = element.getElementById(nameOnly)) ? [found] : [] ) : ( (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] : slice.call(
                isSimple && !maybeID && element.getElementsByClassName ? ( maybeClass ? element.getElementsByClassName(nameOnly) : element.getElementsByTagName(selector) ) : element.querySelectorAll(selector)
            ) )
        }
        xepto.isZ = function(object) {
            return object instanceof xepto.Z;
        }
        xepto.matches = function(){
            if (!selector || !element || element.nodeType !== 1) {
                return false
            }
            var matchesSelector = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.matchesSelector;
            if ( matchesSelector ) {
                return matchesSelector.call(element, selector)
            }
            var match, parent = element.parentNode, temp = !parent;
            if ( temp ) {
                (parent = tempParent).appendChild(element)
            }
            match = ~xepto.qsa(parent, selector).indexOf(element)
            temp && tempParent.removeChild(element)
            return match
        }
        // xeptoinit初始化方法
        /**
         * 参数context是一个配置项，用来给生成的元素添加属性
         */
        xepto.init = function(selector, context) {
            var dom
            if (!selector) {
                return xepto.Z()
            } else if (typeof selector == 'string') {
                selector = selector.trim()
                if (selector[0] == '<' && fragmentRE.test(selector)) {
                    dom = xepto.fragment(selector, RegExp.$1, context);//+?RegExp.$1：指的是与正则表达式匹配的第一个 子匹配(以括号为标志)字符串
                    selector = null;
                } else if (context !== undefined) {
                    return $(context).find(selector)
                } else {
                    dom = xepto.qsa(document, selector)
                }
            } else if (isFunction(selector)) {
                return $(document).ready(selector)
            } else if (xepto.isZ(selector)) { //selector是不是zepto的实例$($())
                return selector
            } else {
                if (isArray(selector)) {
                    dom = compact(selector)
                } else if (isObject(selector)) {
                    dom = [selector];
                    selector = null;
                } else if (fragmentRE.test(selector)) {
                    dom = xepto.fragment(selector.trim(), RegExp.$1, context);
                    selector = null;
                } else if (context !== undefined) {
                    return $(context).find(selector)
                } else {
                    dom = xepto.qsa(document, selector)
                }
            }

            return xepto.Z(dom, selector);
        }
        //实例化$,通过返回一个实例
        $ = function(selector, context){
            return xepto.init(selector, context)
        }
        /**
         * 给$对象上增加方法
         * 1、each方法遍历可枚举的引用类型,回调函数里传参得是（索引，项）
         * 2、type方法
         */
        //-----------------------------------------------------------
        $.type = type;
        $.each = function(elements, callback) {
            var i, key;
            if (likeArray(elements)) {
                for(i=0; i < elements.length; i++) {
                    if ( callback.call(elements[i], i, elements[i]) === false) {
                        return elements
                    }
                }
            } else {
                for (key in elements) {
                    if( callback.call(elements[key], key, elements[key]) === false ) {
                        return elements
                    }
                }
            }
            return elements
        }
        //生成class2type
        $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name){
            class2type["[object " + name + "]"] = name.toLowerCase()
        })
        $.contains = document.documentElement.contains ? function(parent, node) {
            return parent !== node && parent.contains(node)
        } : function(parent, node) {
            while (node && (node = node.parentNode)) {
                if (node === parent) return true
            }
            return false
        }
        /**
         * 给$对象上增加fn对象，存储公共方法
         * 1、ready方法：判断document是否加载完成
         * 2、find方法：
         * 3、filter方法：没懂逻辑
         * 4、not方法：
         */
        //------------------------------------------------------------
        $.fn = {
            constructor: xepto.Z,
            length:0,
            forEach: emptyArray.forEach,
            ready: function (callback) {
                if(readyRE.test(document.readyState) && document.body){
                    callback($)
                } else {
                    document.addEventListener('DOMContentLoaded', function(){
                        callback($)
                    }, false)
                }
                return this;
            },
            //+?
            filter: function(selector){
                if (isFunction(selector)){
                    return this.not(this.not(selector))
                }
                return $(filter.call(this, function(element){
                    return xepto.matches(element, selector)
                }))
            },
            not: function(selector){
                var nodes = [];
                if (isFunction(selector) && selector.call !== undefined){
                    this.each(function(idx){
                        if (!selector.call(this, idx)) {
                            nodes.push(this)
                        }
                    })
                } else {
                    var excludes = typeof selector == 'string' ? this.filter(selector) : (
                        (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
                    );
                    this.forEach(function(el){
                        if(excludes.indexOf(el) < 0) {
                            nodes.push(el)
                        }
                    });
                }
                return $(nodes)
            },
            find: function(selector) {
                var result, $this = this;
                if ( !selector ) {
                    result = $()
                } else if (typeof selector == 'object') {
                    result = $(selector).filter(function(){
                        var node = this;
                        return emptyArray.some.call($this, function(parent) {
                            return $.contains(parent, node)
                        })
                    })
                }
            }
        }
        xepto.Z.prototype = Z.prototype = $.fn;
        $.xepto = xepto
        return $;
    })()
    window.Xepto = Xepto;
    window.$ === undefined && (window.$ = Xepto)

    return Xepto
}))