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
         * 3、fragmentRE正则：匹配是否为html节点
         * 4、simpleSelectorRE正则：校验字符串名称是否含 - 
         * 5、readyRE正则：判断文档加载状态
         * 6、emptyArray缓存一个空数组
         * 7、isArray判断是否是数组
         * 8、class2type存储类型值
         * 9、filter数组的过滤器方法
         * 9、slice数组的截取方法
         * 9、concat数组的合并方法
         * 10、tempParent是一个div元素
         * 11、singleTagRE正则：匹配是否是一对完整的标签，如：<div></div>
         * 12、tagExpanderRE正则：对 html 进行修复，如<p class="test" /> 修复成 <p class="test" /></p>
         * 13、containers,用于生成元素包裹传入的特殊标签
         * 14、methodAttributes，保存一些元素标签属性，用来遍历赋值
         * 15、classCache
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
        var slice = emptyArray.slice; //slice的参数都是选填，默认从0开始到结束
        var concat = emptyArray.concat;
        var tempParent = document.createElement('div');
        var singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/; // 1指向前面(\w+)匹配到的字符串
        var tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
        var table = document.createElement('table'), tableRow = document.createElement('tr');
        var containers = {
            'tr': document.createElement('tbody'),
            'tbody': table, 'thead': table, 'tfoot': table,
            'td': tableRow, 'th': tableRow,
            '*': document.createElement('div'),
        };
        var methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'];
        var classCache = {};
        /**
         * 初始化一些方法函数
         * 1、Z构造函数Z(dom, selector)
         * 2、type函数判断数据类型
         * 3、isFunction判断是否是函数
         * 4、compact返回项不为空的数组
         * 5、isObject是否为对象
         * 6、isPlainObject是否是纯对象
         * 7、isWindow是否是window对象
         * 8、likeArray是否是类数组
         * 9、camelize:将一组字符串变成“骆驼”命名法的新字符串
         * 10、extend方法用来数据拷贝
         * 11、flatten方法用来给数组降维
         * 12、uniq方法数组去除重复项
         * 13、className方法：
         * 14、funcArg方法：当参数为函数时的处理
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
        function camelize(str){
            return str.replace(/-+(.)?/g, function(match, chr){
                return chr ? chr.toUpperCase() : ''
            })
        }
        function extend(target, source, deep) {
            for ( key in source) {
                if (deep && (isPlainObject(source[key]) || isArray(source[key])) ) {
                    if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                        target[key] = {}
                    }
                    if (isArray(source[key]) && !isArray(target[key])) {
                        target[key] = []
                    }
                    extend(target[key], source[key], deep)
                } else if (source[key] !== undefined) {
                    target[key] = source[key]
                }
            }
        }
        //apply方法的第二个参数是个数组类型，从而达到数组降维的效果
        function flatten(array) {
            return array.length>0 ? $.fn.concat.apply([], array) : array
        }
        function uniq(array) {
            return filter.call(array, function(item, idx){
                return array.indexOf(item) == idx
            })
        }
        function className(node, value) {
            var klass = node.className || '',
                svg = klass && klass.baseVal !== undefined; //判断是否是svg元素baseVal是svg元素的属性
            if (value === undefined) { // 要设置的calss值可以是空
                return svg ? klass.baseVal : klass
            }
            svg ? (klass.baseVal = value) : (node.className = value)
        }
        function funcArg(context, arg, idx, payload) { // payload指原始值，就是arg函数执行的时候，上下文context对应的一个原始值
            return isFunction(arg) ? arg.call(context, idx, payload) : arg
        }
        function classRE(name) {
            return name in classCache ? classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
        }
        /**
         * 声明xepto里的方法
         * 1、xepto.Z方法返回一个实例
         * 2、[核心] init方法处理传参，最后调用xepto.Z生成$对象
         * 3、xepto.fragment方法：将html片断转换成dom数组形式
         * 4、xepto.qsa方法通过css的id/类名/tag生成元素
         * 5、xepto.matches方法用于判断某个元素是否与一个给定的选择器匹配
         */
        //-------------------------------------------------------------
        xepto.Z = function(dom, selector) {
            return new Z(dom, selector)
        }
        xepto.fragment = function(html, name, properties) { // 标签字符串，标签名，要给标签设置的属性
            var dom, nodes, container // container指外层包裹元素

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
                if (!(name in containers)) {
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
        xepto.matches = function(element, selector){
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
            // ~是按位非操作符：返回操作数的负值 再 -1 (性能更快)
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
                    dom = xepto.fragment(selector, RegExp.$1, context);// RegExp.$1：指的是与正则表达式匹配的第一个 子匹配(以括号为标志)字符串
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
         * 3、contains方法
         * 4、camelCase方法
         * 5、extend方法扩展目标对象的属性
         * 6、grep方法就是filter的功能
         * 7、inArray方法返回数组中指定元素的索引值
         * 8、isNumeric方法判断是否是数字还是字符串数字
         * 9、map方法遍历集合中的元素返回一个新数组
         * 10、noop方法引用一个空函数，不做别的处理
         * 11、parseJSON方法就是JSON.parse
         * 12、trim方法去掉字符串首尾空格
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
        $.camelCase = camelize;
        $.extend = function(target) {
            var deep, args = slice.call(arguments, 1)
            if (typeof target == 'boolean') { //第一个值为布尔值，那就依据它控制是深拷贝还是浅拷贝
                deep = target;
                target = args.shift()
            }
            args.forEach(function(arg){
                extend(target, arg, deep)
            })
            return target;
        }
        $.grep = function(elements, callback) {
            return filter.call(elements,callback)
        }
        $.inArray = function(elem, array, i) {
            return emptyArray.indexOf.call(array, elem, i) //原生indexOf有一个fromindex参数可选
        }
        $.isNumeric = function(val) {
            var num = Number(val),
                type = typeof val;
            return val != null && type != 'boolean' && (type != 'string' || val.length) && !isNaN(num) && isFinite(num) || false
        }
        $.map = function(elements, callback) {
            var value, values = [], i, key;
            if (likeArray(elements)){
                for(i = 0; i<elements.length;i++){
                    value = callback(elements[i], i)
                    if (value != null) {
                        values.push(value)
                    }
                }
            } else {
                for( key in elements) {
                    value = callback(elements[key], key)
                    if (value != null) {
                        values.push(value)
                    }
                }
            }
            return flatten(values)
        }
        $.noop = function() {}
        if (window.JSON) {
            $.parseJSON  = JSON.parse
        }
        $.trim = function(str) {
            return str == null ? "" : String.prototype.trim.call(str);
        }
        /**
         * 给$对象上增加fn对象，存储公共方法
         * 1、ready方法：判断document是否加载完成
         * 2、find方法：
         * 3、filter方法：没懂逻辑
         * 4、not方法：
         * 5、toArray方法：把数据转化为纯数组
         * 5、concat方法：就是实现数组的合并，在内部判断如果项是xepto的集合(类数组)就转为纯数组
         * 6、slice方法：
         * 7、add方法：添加元素到当前匹配的元素集合中。如果给定content参数，将只在content元素中进行查找，否则在整个document中查找。
         * 7、each方法：使得遍历里的回调函数返回false的时候能跳出遍历
         * 7、hasClass方法：判断是否包含类名
         * 8、addClass方法：为每个匹配的元素添加指定的class类名。多个class类名使用空格分隔。
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
            },
            slice: function() {
                return $(slice.apply(this, arguments))
            },
            get: function(idx) { //不传索引值，按普通数组的方式返回所有的元素
                return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
            },
            toArray: function(){
                return this.get();
            },
            concat: function(){
                var i, value, args = [];
                for (i=0;i<arguments.length;i++) {
                    value = arguments[i]
                    args[i] = xepto.isZ(value) ? value.toArray() : value
                }
                return concat.apply(xepto.isZ(this) ? this.toArray() : this, args)
            },
            add: function(selector, context) {
                return $(uniq(this.concat($(selector, context))))
            },
            each: function(callback) {
                // every() 方法测试数组的"所有"元素是否都通过了指定函数的测试,有一个没通过就返回false,并跳出遍历
                emptyArray.every.call(this, function(el, idx) {
                    return callback.call(el, idx, el) !== false
                })
                return this
            },
            hasClass: function(name) {
                if (!name) return false
                //some() 方法测试数组中的某些元素是否通过了指定函数的测试,找到第一个返回true的元素后就跳出循环 (与every正相反)
                return emptyArray.some.call(this, function(el) {
                    return this.test(className(el)) //this指向classRE(name),即一个正则
                }, classRE(name))
            },
            addClass: function(name) {
                if (!name) {
                    return this;
                }
                return this.each(function(idx) {
                    if (!('className' in this)) return
                    classList = [];
                    var cls = className(this), //获取当前存在的class类名
                        newName = funcArg(this, name, idx, cls);
                    newName.split(/\s+/g).forEach(function(klass) {
                        if (!$(this).hasClass(klass)) {
                            classList.push(klass)
                        }
                    }, this)
                    classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
                })
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