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
    // 以下为核心方法
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
         * 15、classCache:缓存类名正则
         * 16、adjacencyOperators: 存储dom操作的方法
         * 17、cssNumber：
         * 18、capitalRE：校验大写
         * 19、rootNodeRE：校验body/html标签
         * 20、propMap: 用于纠正一些大小写的属性写错
         * 21、elementDisplay：用于缓存元素的默认display属性
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
        var adjacencyOperators = [ 'after', 'prepend', 'before', 'append'];
        var cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 };
        var capitalRE = /([A-Z])/g;
        var rootNodeRE = /^(?:body|html)$/i;
        var propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            'maxlength': 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            'rowspan': 'rowSpan',
            'colspan': 'colSpan',
            'usemap': 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        };
        var elementDisplay = {};
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
         * 15、traverseNode方法：
         * 16、setAttribute方法设置dom节点属性
         * 17、children方法返回dom数组
         * 18、filtered方法返回xepto的dom对象
         * 19、dasherize方法
         * 20、maybeAddPx方法
         * 21、deserializeValue方法：
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
        //?+
        function funcArg(context, arg, idx, payload) { // payload指原始值，就是arg函数执行的时候，上下文context对应的一个原始值
            return isFunction(arg) ? arg.call(context, idx, payload) : arg
        }
        function classRE(name) {
            return name in classCache ? classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
        }
        function traverseNode(node, fun) {
            fun(node)
            for (var i = 0, len = node.childNodes.length; i < len; i++) {
                traverseNode(node.childNodes[i], fun)
            }
        }
        function setAttribute(node, name, value) {
            value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
        }
        function children(element) {
            return 'children' in element ? slice.call(element.children) : $.map(element.childNodes, function(node){
                if (node.nodeType == 1) {
                    return node
                }
            })
        }
        function filtered(nodes, selector) {
            return selector == null ? $(nodes) : $(nodes).filter(selector)
        }
        function isDocument(obj) {
            return obj != null && obj.nodeType == obj.DOCUMENT_NODE
        }
        function dasherize(str) {
            return str.replace(/::/g, '/')
                   .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                   .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                   .replace(/_/g, '-')
                   .toLowerCase()
        }
        function maybeAddPx(name, value) {
            return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
        }
        function deserializeValue(value) {
          try {
            return value ? value == "true" || ( value == "false" ? false : value == "null" ? null : +value + "" == value ? +value : /^[\[\{]/.test(value) ? $.parseJSON(value) : value ) : value
          } catch (err) {
            return value
          }
        }
        function defaultDisplay(nodeName) {
            var element, display
            if (!elementDisplay[nodeName]) {
                element = document.createElement(nodeName)
                document.body.appendChild(element)
                display = getComputedStyle(element, '').getPropertyValue("display")
                element.parentNode.removeChild(element)
                // 因为不是所有可见的元素的display都是block, 如table
                display == "none" && (display = "block")
                elementDisplay[nodeName] = display
            }
            return elementDisplay[nodeName]
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
                dom = $.each(slice.call(container.childNodes), function(){
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
        //?+
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
         * 2、type方法：
         * 2、isFunction方法：
         * 3、contains方法:检查父节点是否包含给定的dom节点，如果两者是相同的节点，则返回 false
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
        $.isFunction = isFunction;
        $.isWindow = isWindow;
        $.isArray = isArray;
        $.isPlainObject = isPlainObject;
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
         * 0、forEach方法：遍历对象集合中每个元素，当函数返回 false 的时候，遍历不会停止，直接使用的是数组的forEach方法
         * 0、indexOf方法就是数组的indexOf
         * 0、push方法：添加元素到当前对象集合的最后
         * 0、reduce方法：reduce() 方法接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，最终计算为一个值
         * 1、ready方法：判断document是否加载完成
         * 2、find方法：
         * 3、filter方法：过滤对象集合，返回对象集合中满足css选择器的项。如果参数为一个函数，函数返回有实际值得时候，元素才会被返回。在函数中， this 关键字指向当前的元素
         * 4、not方法：
         * 5、toArray方法：把数据转化为纯数组
         * 5、concat方法：就是实现数组的合并，在内部判断如果项是xepto的集合(类数组)就转为纯数组
         * 6、slice方法：
         * 6、get方法：根据索引值返回dom节点
         * 7、add方法：添加元素到当前匹配的元素集合中。如果给定content参数，将只在content元素中进行查找，否则在整个document中查找。
         * 7、each方法：使得遍历里的回调函数返回false的时候能跳出遍历
         * 7、hasClass方法：检查对象集合中是否有元素含有指定的class
         * 8、addClass方法：为每个匹配的元素添加指定的class类名。多个class类名使用空格分隔。
         * 9、after方法：
         * 9、prepend方法：
         * 9、before方法：在匹配每个元素的前面插入内容（注：外部插入）
         * 9、append方法：在每个匹配的元素末尾插入内容（注：内部插入）
         * 10、attr方法：读取或设置dom的属性
         * 11、children方法：获得每个匹配元素集合元素的直接子元素，如果给定selector，那么返回的结果中只包含符合css选择器的元素(不包括文字及注释节点)
         * 12、map方法:遍历对象集合中的所有元素。通过遍历函数返回值形成一个新的集合对象
         * 12、clone方法复制集合中的所有元素
         * 13、closet方法：从元素本身开始，逐级向上级元素匹配，并返回最先匹配selector的元素。如果给定context节点参数，那么只匹配该节点的后代元素
         * 14、contents方法：获得每个匹配元素集合元素的子元素，包括文字和注释节点
         * 15、css方法：设置元素的样式
         * 16、data方法：读取或写入dom的 data-* 属性
         * 17、empty方法：清空对象集合中每个元素的DOM内容
         * 18、eq方法：从当前对象集合中获取给定索引值对应的元素
         * 19、first方法：获取当前对象集合中的第一个元素 (注意别搞混成第一个子元素)
         * 20、has方法：判断当前对象集合内的元素是否含有符合选择器的子元素，或者是否包含指定的子DOM节点，如果有，则返回新的对象集合
         * 21、size方法：返回集合的长度
         * 22、width/height方法：获取对象集合中第一个元素的宽/高度；或者设置对象集合中所有元素的宽/高度
         * 23、offset方法：获得当前元素相对于document的位置。返回一个对象含有： top, left, width和height；当给定一个含有left和top属性对象时，使用这些值来对集合中每一个元素进行相对于document的定位。
         * 24、offsetParent方法：找到第一个定位过的祖先元素，意味着它的css中的position 属性值为“relative”,“absolute” or “fixed”
         * 25、hide方法：通过设置css的属性display 为 none来将对象集合中的元素隐藏
         * 26、html方法：获取或设置对象集合中元素的HTML内容。当没有给定content参数时，返回对象集合中第一个元素的innerHtml。当给定content参数时，用其替换对象集合中每个元素的内容。
         * 27、index方法：获取一个元素的索引值（注：从0开始计数）。当elemen参数没有给出时，返回当前元素在兄弟节点中的位置。当element参数给出时，返回它在当前对象集合中的位置。如果没有找到该元素，则返回-1
         * 28、parent方法：获取对象集合中每个元素的直接父元素。如果css选择器参数给出。过滤出符合条件的元素。
         * 29、pluck方法:获取对象集合中每一个元素的属性值
         * 30、is方法：判断当前元素集合中的第一个元素是否符css选择器
         * 31、last方法：获取对象集合中最后一个元素
         * 32、next方法：获取对象集合中每一个元素的下一个兄弟节点(可以选择性的带上过滤选择器)
         * 33、parents方法：获取对象集合每个元素所有的祖先元素。如果css选择器参数给出，过滤出符合条件的元素
         * 34、position方法：获取对象集合中第一个元素的位置
         * 35、prev方法：获取对象集合中每一个元素的前一个兄弟节点，通过选择器来进行过滤
         * 36、remove方法：从其父节点中删除当前集合中的元素，有效的从dom中移除
         * 37、removeAttr：移除当前对象集合中所有元素的指定属性
         * 38、removeClass: 移除当前对象集合中所有元素的指定class。如果没有指定name参数，将移出所有的class
         * 39、removeProp: 从集合的每个DOM节点中删除一个属性
         * 40、replaceWith: 用给定的内容替换所有匹配的元素。(包含元素本身)
         * 41、prop: 读取或设置dom元素的属性值
         * 42、scrollTop：获取或设置页面上的滚动元素或者整个窗口向下滚动的像素值
         * 43、scrollLeft：获取或设置页面上的滚动元素或者整个窗口向右滚动的像素值
         * 44、show：恢复对象集合中每个元素默认的“display”值
         * 45、siblings：获取对象集合中所有元素的兄弟节点
         * 46、text: 获取或者设置所有对象集合中元素的文本内容。当没有给定content参数时，返回当前对象集合中第一个元素的文本内容（包含子节点中的文本内容）。当给定content参数时，使用它替换对象集合中所有元素的文本内容
         * 47、toggle：显示或隐藏匹配元素。如果 setting为true，相当于show 法。如果setting为false。相当于 hide方法。
         * 48、toggleClass：在匹配的元素集合中的每个元素上添加或删除一个或多个样式类
         * 49、unwrap:移除集合中每个元素的直接父节点，并把他们的子元素保留在原来的位置
         * 50、val：获取或设置匹配元素的值。当没有给定value参数，返回第一个元素的值。如果是<select multiple>标签，则返回一个数组。当给定value参数，那么将设置所有元素的值。
         * 51、wrap:在每个匹配的元素外层包上一个html元素。
         * 52、wrapAll: 在所有匹配元素外面包一个单独的结构
         * 53、wrapInner:将每个元素中的内容包裹在一个单独的结构中
         */
        //------------------------------------------------------------
        $.fn = {
            constructor: xepto.Z,
            length:0,
            forEach: emptyArray.forEach, //+? 这样操作的目的是什么？
            indexOf: emptyArray.indexOf,
            push: emptyArray.push,
            reduce: emptyArray.reduce,
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
            //+?
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
                } else if (this.length == 1) {
                  result = $(xepto.qsa(this[0], selector))
                } else {
                  result = this.map(function() {
                    return xepto.qsa(this, selector)
                  })
                }
                return result
            },
            slice: function() {
                return $(slice.apply(this, arguments))
            },
            get: function(idx) { // 不传索引值，按普通数组的方式返回所有的元素
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
            },
            attr: function(name, value) { //++ 这里的判断存在缺陷，如 null = '属性值'
                var result;
                return (typeof name == 'string' && !(1 in arguments)) ? (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) : this.each(function(idx) {
                    if (this.nodeType != 1) return
                    if (isObject(name)) {
                        for (key in name) {
                            setAttribute(this, key, nam[key])
                        }
                    } else {
                        setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
                    }
                })
            },
            children: function(selector) {
                return filtered(this.map(function() {
                    return children(this)
                }), selector)
            },
            map: function(fn) {
                return $($.map(this, function(el, i) {
                    return fn.call(el, i, el)
                }))
            },
            clone: function() {
                return this.map(function() {
                    //cloneNode是原生方法：参数是 true，它还将递归复制当前节点的所有子孙节点。否则，它只复制当前节点。
                    return this.cloneNode(true)
                })
            },
            closest: function(selector, context) {
                var nodes = [],
                    collection = typeof selector == 'object' && $(selector);
                // 这里的下划线传参只是一种写法习惯(表示参数是要传的，但形参叫啥名字我也懒得起了),无特殊含义，看源码，我们会发现这里的 _ 指的是集合中的项
                this.each(function(_, node) {
                    while (node && !(collection ? collection.indexOf(node) >=0 : xepto.matches(node, selector))) {
                        node = node !== context && !isDocument(node) && node.parentNode
                    }
                    if (node && nodes.indexOf(node) < 0) {
                        nodes.push(node)
                    }
                })
                return $(nodes)
            },
            contents: function() {
                // contentDocument是原生属性：以 HTML 对象返回框架容纳的文档
                return this.map(function() {
                    return this.contentDocument || slice.call(this.childNodes)
                })
            },
            css: function(property, value) {
                if (arguments.length < 2) {
                    var element = this[0]
                    if (typeof property == 'string') {
                        if (!element) return
                        return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
                    } else if (isArray(property)) {
                        if (!element) return
                        var props = {}
                        var computedStyle = getComputedStyle(element, '')
                        $.each(property, function(_, prop) {
                            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
                        })
                        return props
                    }
                }
                var css = ''
                if (type(property) == 'string') {
                    if (!value && value !== 0) {
                        this.each(function() {
                            // removeProperty是原生的方法删除元素样式
                            this.style.removeProperty(dasherize(property))
                        })
                    } else {
                        css = dasherize(property) + ":" + maybeAddPx(property, value)
                    }
                } else {
                    for (key in property) {
                        if (!property[key] && property[key] !== 0) {
                            this.each(function() {
                                this.style.removeProperty(dasherize(key))
                            })
                        } else {
                            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
                        }
                    }
                }
                return this.each(function() {
                    this.style.cssText += ';' + css
                })
            },
            data: function(name, value) {
              //把驼峰命名变为 小写+斜杠
              var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase();
              var data = (1 in arguments) ? this.attr(attrName, value) : this.attr(attrName)

              return data !== null ? deserializeValue(data) : undefined
            },
            empty: function() {
              return this.each(function() {
                this.innerHTML = ''
              })
            },
            eq: function(idx) {
              return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
            },
            first: function() {
              var el = this[0];
              return el && !isObject(el) ? el : $(el)
            },
            has: function(selector) {
              return this.filter(function() {
                return isObject(selector) ? $.contains(this, selector) : $(this).find(selector).size()
              })
            },
            size: function() {
              return this.length
            },
            //+?
            offset: function(coordinates) {
                if ( coordinates ) {
                    return this.each(function(index) {
                        var $this = $(this),
                            coords = funcArg(this, coordinates, index, $this.offset()),
                            parentOffset = $this.offsetParent().offset(),
                            props = {
                                top: coords.top - parentOffset.top,
                                left: coords.left - parentOffset.left
                            };
                        if ($this.css('position') == 'static') {
                            props['position'] = 'relative'
                        }
                        $this.css(props)
                    })
                }
                if (!this.length) return null;
                if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0])) {
                    return {
                        top: 0,
                        left: 0
                    }
                }
                var obj = this[0].getBoundingClientRect()
                return {
                    left: obj.left + window.pageXOffset,
                    top: obj.top + window.pageYOffset,
                    width: Math.round(obj.width),
                    height: Math.round(obj.height)
                }
            },
            //+?
            offsetParent: function() {
                return this.map(function() {
                    var parent = this.offsetParent || document.body;
                    while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static") {
                        parent = parent.offsetParent
                    }
                    return parent;
                })
            },
            hide: function() {
                return this.css("display", "none")
            },
            html: function(html) {
                return (0 in arguments) ? this.each(function(idx) {
                    var originHtml = this.innerHTML
                    $(this).empty().append( funcArg(this, html, idx, originHtml) )
                }) : (0 in this ? this[0].innerHTML : null)
            },
            index: function(element) {
                return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
            },
            parent: function(selector) {
                return filtered(uniq(this.pluck('parentNode')), selector)
            },
            pluck: function(property) {
                return $.map(this, function(el) {
                    return el[property]
                })
            },
            is: function(selector) {
              return this.length > 0 && xepto.matches(this[0], selector)
            },
            last: function() {
                var el = this[this.length -1]
                return el && !isObject(el) ? el : $(el)
            },
            next: function(selector) {
                return $(this.pluck('nextElementSibling')).filter(selector || '*')
            },
            parents: function(selector) {
                var ancestors = [], nodes = this;
                while (nodes.length > 0) {
                    nodes = $.map(nodes, function(node) {
                        if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                            ancestors.push(node)
                            return node
                        }
                    })
                }
                return filtered(ancestors, selector)
            },
            //?+
            position: function() {
                if (!this.length) return

                var elem = this[0],
                    offsetParent = this.offsetParent(),
                    offset       = this.offset(),
                    parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0} : offsetParent.offset();
                offset.top  -= parseFloat( $(elem).css('margin-top')) || 0;
                offset.left -= parseFloat( $(elem).css('margin-left')) || 0;

                parentOffset.top += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0;
                parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0;

                return {
                    top:  offset.top  - parentOffset.top,
                    left: offset.left - parentOffset.left
                }
            },
            prev: function(selector) {
                return $(this.pluck('previousElementSibling')).filter(selector || '*')
            },
            remove: function() {
                return this.each(function() {
                    if (this.parentNode != null) {
                        this.parentNode.removeChild(this)
                    }
                })
            },
            removeAttr: function(name) {
                return this.each(function() {
                    this.nodeType === 1 && name.split(' ').forEach(function(attribute) {
                        setAttribute(this, attribute)
                    }, this)
                })
            },
            removeClass: function(name) {
                return this.each(function(idx) {
                    if (!('className' in this)) return
                    if (name === undefined) {
                        return className(this, '')
                    }
                    classList = className(this)
                    funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass) {
                        classList = classList.replace(classRE(klass), " ")
                    })
                    className(this, classList.trim())
                })
            },
            removeProp: function(name) {
                name = propMap[name] || name
                return this.each(function() {
                    delete this[name]
                })
            },
            prop: function(name, value) {
                name = propMap[name] || name
                return (1 in arguments) ? this.each(function(idx) {
                    this[name] = funcArg(this, value, idx, this[name])
                }) : (this[0] && this[0][name])
            },
            replaceWith: function(newContent) {
                return this.before(newContent).remove()
            },
            scrollTop: function(value) {
                if (!this.length) return
                var hasScrollTop = 'scrollTop' in this[0]
                if (value === undefined) {
                    return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
                }
                return this.each(hasScrollTop ? function() {
                    this.scrollTop = value
                } : function() {
                    this.scrollTop(this.scrollX, value)
                })
            },
            scrollLeft: function(value){
                if (!this.length) return
                var hasScrollLeft = 'scrollLeft' in this[0]
                if (value === undefined) {
                    return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
                }
                return this.each(hasScrollLeft ?
                  function(){ this.scrollLeft = value } :
                  function(){ this.scrollTo(value, this.scrollY) })
            },
            show: function() {
                return this.each(function() {
                    this.style.display == "none" && (this.style.display = '')
                    if (getComputedStyle(this, '').getPropertyValue("display") == "none") {
                        this.style.display = defaultDisplay(this.nodeName)
                    }
                })
            },
            siblings: function(selector) {
                return filtered(this.map(function(i, el) {
                    return filter.call(children(el.parentNode), function(child) {
                        return child !== el
                    })
                }), selector)
            },
            text: function(text) {
                return 0 in arguments ? this.each(function(idx) {
                    var newText = funcArg(this, text, idx, this.textContent)
                    this.textContent = newText == null ? '' : ''+newText
                }) : (0 in this ? this.pluck('textContent').join("") : null)
            },
            toggle: function(setting) {
                return this.each(function(){
                    var el = $(this);
                    (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
                })
            },
            toggleClass: function(name, when) {
                if (!name) return this;
                return this.each(function(idx) {
                    var $this = $(this),
                        names = funcArg(this, name, idx, className(this))
                    names.split(/\s+/g).forEach(function(klass) {
                        (when === undefined ? !$this.hasClass(klass) : when) ? $this.addClass(klass) : $this.removeClass(klass)
                    })
                })
            },
            unwrap: function() {
                this.parent().each(function(){
                    $(this).replaceWith($(this).children())
                })
                return this
            },
            val: function(value) {
                if (0 in arguments) {
                    if (value == null) {
                        value = ""
                    }
                    return this.each(function(idx) {
                        this.value = funcArg(this, value, idx, this.value)
                    })
                } else {
                    return this[0] && (this[0].multiple ? $(this[0]).find('option').filter(function() {
                        return this.selected
                    }).pluck('value') : this[0].value)
                }
            },
            wrap: function(structure) {
                var func = isFunction(structure)
                if (this[0] && !func) {
                    var dom   = $(structure).get(0),
                        clone = dom.parentNode || this.length > 1
                }
                return this.each(function(index){
                    $(this).wrapAll(
                        func ? structure.call(this, index) : clone ? dom.cloneNode(true) : dom
                    )
                })
            },
            wrapAll: function(structure) {
                if (this[0]) {
                    $(this[0]).before(structure = $(structure))
                    var children;
                    while ( (children = structure.children()).length ) {
                        structure = children.first()
                    }
                    $(structure).append(this)
                }
                return this
            },
            wrapInner: function(structure) {
                var func = isFunction(structure)
                return this.each(function(index) {
                    var self     = $(this),
                        contents = self.contents(),
                        dom      = func ? structure.call(this, index) : structure;
                    contents.length ? contents.wrapAll(dom) : self.append(dom)
                })
            }

        }
        //以下遍历生成插入dom的方法
        adjacencyOperators.forEach(function(operator, operatorIndex) {
            var inside = operatorIndex % 2; //能整除(偶数)返回0，不能整除(奇数)返回1
            $.fn[operator] = function() {
                var argType;
                var parent;
                var copyByClone = this.length > 1 ;
                var nodes = $.map(arguments, function(arg) {
                    var arr = [];
                    argType = type(arg);
                    if (argType == "array") {
                        arg.forEach(function(el) {
                            if (el.nodeType !== undefined) {
                                return arr.push(el)
                            } else if ($.xepto.isZ(el)) {
                                return arr = arr.concat(el.get())
                            }
                            arr = arr.concat(xepto.fragment(el))
                        })
                        return arr;
                    }
                    return (argType == "object" || arg == null) ? arg : xepto.fragment(arg)
                });
                if (nodes.length < 1) {
                    return this
                }

                return this.each(function(_, target) {
                    parent = inside ? target : target.parentNode;
                    target = operatorIndex == 0 ? target.nextSibling : (operatorIndex == 1 ? target.firstChild : (operatorIndex == 2 ? target : null));

                    var parentInDocument = $.contains(document.documentElement, parent);
                    // nodes是一个dom的数组
                    nodes.forEach(function(node) {
                        if (copyByClone) {
                            node = node.cloneNode(true); //cloneNode是原生方法
                        } else if (!parent) {
                            return $(node).remove()
                        }
                        parent.insertBefore(node, target); //insertBefore是原生方法
                        if (parentInDocument) {
                            traverseNode(node, function(el) {
                                if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' && (!el.type || el.type === 'text/javascript') && !el.src) {
                                    var target = el.ownerDocument ? el.ownerDocument.defaultView : window;
                                    target['eval'].call(target, el.innerHTML)
                                }
                            })
                        }
                    })
                })
            }

            $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html) {
                $(html)[operator](this)
                return this;
            }
        })
        //遍历生成width/height方法
        ;['width', 'height'].forEach(function(dimension) {
            // . 匹配除“\n”之外的任何单个字符
            // replace() 方法的参数 replacement 可以是函数而不是字符串。在这种情况下，每个匹配都调用该函数，它返回的字符串将作为替换文本使用。该函数的第一个参数是匹配模式的字符串。
            var dimensionProperty = dimension.replace(/./, function(m) {
                return m[0].toUpperCase()
            })
            $.fn[dimension] = function(value) {
                var offset, el = this[0];
                if ( value === undefined) {
                    return isWindow(el) ? el['inner' + dimensionProperty] : isDocument(el) ? el.documentElement['scroll' + dimensionProperty] : (offset = this.offset()) && offset[dimension]  //?+ (=赋值)&& 值，啥意思？
                } else {
                    return this.each(function(idx) {
                        el = $(this)
                        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
                    })
                }
            }
        });
        xepto.Z.prototype = Z.prototype = $.fn;
        xepto.deserializeValue = deserializeValue; // $.fn.data方法有用到
        $.xepto = xepto
        return $;
    })()
    window.Xepto = Xepto;
    window.$ === undefined && (window.$ = Xepto)
    // 判断 getComputedStyle 是否可用
    ;(function() {
        try {
            getComputedStyle(undefined)
        } catch (e) {
            var nativeGetComputedStyle = getComputedStyle
            window.getComputedStyle = function(element, pseudoElement) {
                try {
                    return nativeGetComputedStyle(element, pseudoElement)
                } catch(e) {
                    return null
                }
            }
        }
    })();
    // 在核心基础上增加event事件处理函数
    ;(function($) {
      /**
       * 1、specialEvents: 缓存一些特殊的事件，处理一些基础事件在不同浏览器上的兼容问题
       * 2、_zid：设置一个标识符
       * 3、handlers
       * 4、focusinSupported
       * 5、focus
       * 6、hover
       * 7、
       * 8、
       * 9、
       */
      var specialEvents = {};
          specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';
      var slice = Array.prototype.slice;
      var isFunction = $.isFunction;
      var isString = function(obj) {
          return typeof obj == 'string'
      };
      var _zid = 1;
      var handlers = {};
      var focusinSupported = 'onfocusin' in window;
      var focus = {
          focus: 'focusin',
          blur: 'focusout'
      };
      var hover = {
          mouseenter: 'mouseover',
          mouseleave: 'mouseout'
      }
      /**
       * 1、compatible：函数用来修正 event 对象的浏览器差异，向 event 对象中添加了 几个处理兼容的函数及属性。如：isDefaultPrevented、isImmediatePropagationStopped、isPropagationStopped 几个方法，对不支持 timeStamp 的浏览器，向 event 对象中添加 timeStamp 属性。
       * 2、zid方法：给函数增加标识符，方便查找
       * 3、remove方法：
       * 4、findHandlers方法：
       * 5、eventCapture：
       * 6、realEvent：
       * 7、parse：
       * 8、matcherFor：
       * 9、createProxy：
       * 10、add
       * 11、
       * 12、
       */
      var returnTrue  = function(){ return true },
          returnFalse = function(){ return false },
          ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
          eventMethods = {
            preventDefault: 'isDefaultPrevented', // 如果 defaultPrevented缺失或在某些浏览器下不可靠的时候
            stopImmediatePropagation: 'isImmediatePropagationStopped', // 如果stopImmediatePropagation()被该事件的实例调用，那么返回true。Zepto在不支持该原生方法的浏览器中实现它，  （例如老版本的Android）
            stopPropagation: 'isPropagationStopped' // 如果stopPropagation()被该事件的实例调用，那么返回true
          }
      function compatible(event, source) {
        if (source || !event.isDefaultPrevented) {
          source || (source = event)
          $.each(eventMethods, function(name, predicate) {
            var sourceMethod = source[name]
            event[name] = function(){
              this[predicate] = returnTrue
              return sourceMethod && sourceMethod.apply(source, arguments)
            }
            event[predicate] = returnFalse
          })
          event.timeStamp || (event,timeStamp = Date.now())

          if (source.defaultPrevented !== undefined ? source.defaultPrevented : ('returnValue' in source ? source.returnValue === false : source.getPreventDefault && source.getPreventDefault()) ) {
            event.isDefaultPrevented = returnTrue
          }
        }
        return event
      }
      function zid(element) {
        return element._zid || (element._zid = _zid++)
      }
      function remove(element, events, fn, selector, capture) {
          var id = zid(element)
          ;(events ||'').split(/\s/).forEach(function(event) {
              findHandlers(element, event, fn, selector).forEach(function(handler) {
                  delete handlers[id][handler.i]
                  if ('removeEventListener' in element) {
                      element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
                  }
              })
          })
      }
      function findHandlers(element, event, fn, selector) {
          event = parse(event)
          if (event.ns) {
              var matcher = matcherFor(event.ns)
          }
          return (handlers[zid(element)] || []).filter(function(handler) {
              return handler && (!event.e || handler.e == event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || zid(handler.fn) === zid(fn)) && (!selector || handler.sel == selector)
          })
      }
      function realEvent(type) {
        return hover[type] || (focusinSupported && focus[type]) || type
      }
      function eventCapture(handler, captureSetting) {
        return handler.del && (!focusinSupported && (handler.e in focus)) || !!captureSetting
      }
      function parse(event) {
          var parts = ('' + event).split('.')
          return {
              e: parts[0],
              ns: parts.slice(1).sort().join(' ')
          }
      }
      function matcherFor(ns) {
          return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
      }
      function createProxy(event) {
          var key, proxy = { originalEvent: event}
          for (key in event) {
              if (!ignoreProperties.test(key) && event[key] !== undefined) {
                  proxy[key] = event[key]
              }
          }
          return compatible(proxy, event)
      }
      function add(element, events, fn, data, selector, delegator, capture) {
          var id  = zid(element),
              set = (handlers[id] || (handlers[id] = []))
          events.split(/\s/).forEach(function(event) {
              if (event == 'ready') {
                  return $(document).ready(fn)
              }
              var handler = parse(event);
                  handler.fn = fn;
                  handler.sel = selector;

              if (handler.e in hover) {
                  fn = function(e) {
                      var related = e.relatedTarget
                      if (!related || (related !== this && !$.contains(this, related))) {
                          return handler.fn.apply(this, arguments)
                      }
                  }
              }
              handler.del = delegator;
              var callback = delegator || fn;
              handler.proxy = function(e) {
                  e = compatible(e)
                  if (e.isImmediatePropagationStopped()) return
                  e.data = data;
                  var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
                  if (result === false) {
                      e.preventDefault(),
                      e.stopPropagation()
                  }
                  return result
              }
              handler.i = set.length
              set.push(handler)
              if ('addEventListener' in element) {
                  element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
              }
          })
      }
      $.event = {add: add, remove: remove}
      /**
       * 1、Event方法：创建并初始化一个指定的DOM事件。如果给定properties对象，使用它来扩展出新的事件对象。默认情况下，事件被设置为冒泡方式；这个可以通过设置bubbles为false来关闭。
       */
      $.Event = function(type, props) {
        if (!isString(type)) {
          props = type,
          type = props.type;
        }
        var event   = document.createEvent(specialEvents[type] || 'Events'), //创建基础事件模块
            bubbles = true; // 默认设置事件冒泡
        if (props) {
          for ( var name in props ) {
            (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
          }
        }
        // 初始化事件，包含：定义事件名
        event.initEvent(type, bubbles, true)
        return compatible(event)
      }
      /**
       * 2、proxy方法：接受一个函数，然后返回一个新函数，并且这个新函数始终保持了特定的上下文(context)语境，新函数中this指向context参数
       */
      $.proxy = function(fn, context) {
          var args = (2 in arguments) && slice.call(arguments, 2)
          if (isFunction(fn)) {
              var proxyFn = function() {
                  return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments )
              }
              proxyFn._zid = zid(fn)
              return proxyFn
          } else if (isString(context)) {
              if (args) {
                  args.unshift(fn[context], fn)
                  return $.proxy.apply(null, args)
              } else {
                  return $.proxy(fn[context], fn)
              }
          } else {
              throw new TypeError('expected function')
          }
      }
      /**
       * 给集合对象添加方法。
       * 1、on方法：添加事件处理程序到对象集合中得元素上。
       * 2、off方法：移除通过 on 添加的事件.移除一个特定的事件处理程序， 必须通过用on()添加的那个相同的函数。否则，只通过事件类型调用此方法将移除该类型的所有处理程序。如果没有参数，将移出当前元素上全部的注册事件。
       * 3、one方法：添加一个处理事件到元素，当第一次执行事件以后，该事件将自动解除绑定，保证处理函数在每个元素上最多执行一次
       * 4、trigger方法：在对象集合的元素上触发指定的事件
       * 5、triggerHandler方法：像 trigger，它只在当前元素上触发事件，但不冒泡。
       * 6、bind：为一个元素绑定一个处理事件
       */
      $.fn.on = function(event, selector, data, callback, one) {
          var autoRemove, delegator, $this = this;
          if (event && !isString(event)) { // 当event存在且为对象
              $.each(event, function(type, fn){
                  $this.on(type, selector, data, fn, one)
              })
              return $this
          }
          if (!isString(selector) && !isFunction(callback) && callback !== false) {
              callback = data, data = selector, selector = undefined
          }
          if (callback === undefined || data === false) {
              callback = data, data = undefined
          }
          if (callback === false) {
              callback = returnFalse
          }
          return $this.each(function(_, element) {
              if (one) {
                  autoRemove = function(e) {
                      remove(element, e.type, callback)
                      return callback.apply(this, arguments)
                  }
              }
              if (selector) {
                  delegator = function(e) {
                      var evt, match = $(e.target).closest(selector, element).get(0)
                      if (match && match !== element) {
                          evt = $.extend(createProxy(e), {
                              currentTarget: match,
                              liveFired: element
                          })
                          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments,1)))
                      }
                  }
              }
              add(element, event, callback, data, selector, delegator || autoRemove)
          })
      }
      $.fn.off = function(event, selector, callback) {
          var $this = this
          if (event && !isString(event)) {
              $.each(event, function(type, fn) {
                  $this.off(type, selector, fn)
              })
              return $this
          }
          if (!isString(selector) && !isFunction(callback) && callback !== false) {
              callback = selector, selector = undefined
          }
          if (callback === false) {
              callback = returnFalse
          }
          return $this.each(function(){
              remove(this, event, callback, selector)
          })
      }
      $.fn.one = function(event, selector, data,  callback) {
          return this.on(event, selector, data, callback, 1)
      }
      $.fn.trigger = function(event, args) {
          event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
          event._args = args
          return this.each(function() {
              if (event.type in focus && typeof this[event.type] == "function") {
                  this[event.type]()
              } else if ('dispatchEvent' in this) {
                  this.dispatchEvent(event)
              } else {
                  $(this).triggerHandler(event, args)
              }
          })
      }
      $.fn.triggerHandler = function(event, args) {
          var e, result;
          this.each(function(i, element){
              e = createProxy(isString(event) ? $.Event(event) : event)
              e._args = args
              e.target = element
              $.each(findHandlers(element, event.type || event), function(i, handler){
                  result = handler.proxy(e)
                  if (e.isImmediatePropagationStopped()) {
                      return false
                  }
              })
          })
          return result
      }
      $.fn.bind = function(event, data, callback){
          return this.on(event, data, callback)
      }
      ;('focusin focusout focus blur load resize scroll unload click dblclick' + 'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave' + 'change select keydown keypress keyup error').split(' ').forEach(function(event) {
          $.fn[event] = function(callback) {
              return (0 in arguments) ? this.bind(event, callback) : this.trigger(event)
          }
      })
    })(Xepto);
    // 增加 ajax相关
    ;(function($) {
        /**
         * 一些变量
         * 1、jsonType:
         * 2、htmlType:
         * 3、originAnchor： 生成一个a元素，用于存放url数据
         * 4、blankRE： 匹配是否为空
         * 5、scriptTypeRE: 
         * 6、xmlTypeRE: 
         * 
         */
        var jsonType = 'aplication/json';
        var htmlType = 'text/html';
        var originAnchor = document.createElement('a'); 
            originAnchor.href = window.location.href;
        var blankRE = /^\s*$/;
        // (?:pattern)非获取匹配
        var scriptTypeRE = /^(?:text|application)\/javascript/i;
        var xmlTypeRE = /^(?:text|application)\/xml/i;
        var jsonpID = +new Date();
        /**
         * 一些方法函数
         * 1、empty函数：用于作为默认的回调函数
         * 2、ajaxStart: 触发全局的 ajaxStart 事件
         * 3、triggerGlobal：触发全局的 ajaxStart 事件
         * 4、triggerAndReturn：用来触发一个事件，并且如果该事件禁止浏览器默认事件时，返回 false
         * 5、serializeData方法：序列化请求参数, 这里更多的是基于请求方式调用不同的序列化函数
         * 6、appendQuery方法: 在 url 后面拼接参数 url?key=value&key2=value
         * 7、serialize方法: 序列化参数
         * 8、mimeToDataType方法: 返回dataType类型
         * 9、ajaxDataFilter方法: 过滤请求成功后的响应数据
         * 10、ajaxSuccess方法：
         * 11、ajaxError方法：
         * 12、ajaxComplete方法：
         * 13、ajaxBeforeSend方法：请求发出前，执行自己的函数逻辑(如果配置了的话)
         * 
         */
        function empty() {}
        function ajaxStart(settings) {
            if (settings.global && $.active++ === 0) { // i++会在语句执行完以后再自增
                triggerGlobal(settings, null, 'ajaxStart')
            }
        }
        function triggerGlobal(settings, context, eventName, data) {
          if (settings.global) {
            return triggerAndReturn(context || document, eventName, data)
          }
        }
        function triggerAndReturn(context, eventName, data) {
          var event = $.Event(eventName) // 可以创建一个新的事件，再用trigger触发他
          $(context).trigger(event, data)
          return !event.isDefaultPrevented()
        }
        function serializeData(options) {
          
          if (options.processData && options.data && $.type(options.data) != "string") {
            // traditional属性: 是否使用传统的浅层序列化方式序列化 data 参数，默认为 false，例如有 data 为 {p1:'test1', p2: {nested: 'test2'} ，在 traditional 为 false 时，会序列化成 p1=test1&p2[nested]=test2， 在为 true 时，会序列化成 p1=test&p2=[object+object]；
            options.data = $.param(options.data, options.traditional)
          }
          if (options.data && (!options.type || options.type.toUpperCase() == 'GET' || 'jsonp' == options.dataType)) {
            options.url = appendQuery(options.url, options.data),
            options.data = undefined
          }
        }
        function appendQuery(url, query) {
          if (query == '') return url
          return (url + '&' + query).replace(/[&?]{1,2}/, '?')
        }
        function serialize(params, obj, traditional, scope) {
          var type, array = $.isArray(obj), hash = $.isPlainObject(obj);
          $.each(obj, function(key, value) {
            type = $.type(value)
            if (scope) {
              key = traditional ? scope : scope + '[' + ((hash || type == 'object' || type == 'array') ? key : '') + ']'
            }
            if (!scope && array) {
              params.add(value.name, value.value)
            } else if (type == "array" || (!traditional && type == "object")) {
              serialize(params, value, traditional, key)
            } else {
              params.add(key, value)
            }
          })
        }
        function mimeToDataType(mime) {
          // 可能的一种情况是这样的： application/javascript; charset=UTF-8
          if (mime) mime = mime.split(';', 2)[0]
          return mime && (mime == htmlType ? 'html' : (mime == jsonType ? 'json' : ( scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml' ))) || 'text'
        }
        function ajaxDataFilter(data, type, settings) {
          if (settings.dataFilter == empty) return data
          var context = settings.context;
          return settings.dataFilter.call(context, data, type)
        }
        function ajaxSuccess(data, xhr, settings, deferred) {
          var context = settings.context, status = 'success';
          settings.success.call(context, data, status. xhr)
          if (deferred) {
            deferred.resolveWith(context, [data, status, xhr])
          }
          triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
          ajaxComplete(status, xhr, settings)
        }
        function ajaxError(error, type, xhr, settings, deferred) {
          var context = settings.context;
          settings.error.call(context, xhr, type, error)
          if (deferred) {
            deferred.rejectWith(context, [xhr, type, error])
          }
          triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
          ajaxComplete(type, xhr, settings)
        }
        function ajaxComplete(status, xhr, settings) {
          var context = settings.context;
          settings.complete.call(context, xhr, status)
          triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
          ajaxStop(settings)
        }
        function ajaxStop(settings) {
          // 如果 --$.active 不为0 就说明还有在执行的ajax，就不调用全局的关闭ajax的方法
          if (settings.global && !(--$.active)) {
            triggerGlobal(settings, null, 'ajaxStop')
          }
        }
        function ajaxBeforeSend(xhr, settings) {
          // settings.beforeSend：函数里调用可配置的回调函数，回调函数里的逻辑自己写，走不通就返回false，从而阻止了ajax请求的发出
          var context = settings.context;
          if (settings.beforeSend.call(context, xhr, settings) === false || triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false) {
            return false
          }
          triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
        }
        /**
         * 1、ajax方法:
         * 2、ajaxSettings: 保存ajax的默认配置
         * 3、active: 标记正在请求的 ajax 数量，初始时为 0
         * 4、param方法: param 方法用来序列化参数，内部调用的是 serialize 方法，并且在容器 params 上定义了一个 add 方法，供 serialize 调用
         * 5、ajaxJSONP方法: 
         * 6、
         * 7、
         * 8、
         * 9、
         */
        $.ajax = function(options) {
            var settings = $.extend({}, options || {}),
                deferred = $.deferred && $.deferred(), //需要deferred模块的引入，实现promise
                urlAnchor, hashIndex;
            for (key in $.ajaxSettings) {
                if (settings[key] === undefined) {
                    settings[key] = $.ajaxSettings[key]
                }
            }
            ajaxStart(settings)
            // 以下部分都在整理传参
            if (!settings.crossDomain) { // 如果设置了不能跨域，但实际情况下跨域了，就设置为可跨域
              urlAnchor = document.createElement('a');
              urlAnchor.href = settings.url
              urlAnchor.href = urlAnchor.href
              settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
            }

            if (!settings.url) {
              settings.url = window.location.toString() // 返回当前页面的完整url地址
            }
            // 如果请求地址包含 # (hash哈希值)，剔除 # 因为 hash 并不会传递给后端
            if ((hashIndex = settings.url.indexOf('#')) > -1) {
              settings.url = settings.url.slice(0, hashIndex)
            }
            serializeData(settings)

            var dataType = settings.dataType,
                // /\?.+=\?/用来匹配类似于： ?fdaffdfasfda=?； .+表示1个或多个任意字符
                hasPlaceholder = /\?.+=\?/.test(settings.url);
            if (hasPlaceholder) {
              dataType = 'jsonp'
            }
            // 通过加时间戳的方式，阻止浏览器请求的缓存
            if (settings.cache = false || (
              (!options || options.cache !== true) && ('script' == dataType || 'jsonp' == dataType)
            )) {
              settings.url = appendQuery(settings.url, '_=' + Date.now())
            }
            // 跨区请求时，给请求的链接增加一些占位符，用于jsonp的传参
            if ('jsonp' == dataType) {
              if (!hasPlaceholder) {
                // settings.jsonp: 请求时，携带回调函数名的参数名，默认为 callback
                settings.url = appendQuery(settings.url, settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
              }
              return $.ajaxJSONP(settings, deferred)
            }
            // 以下开始设置请求头信息
            var mine = settings.accepts[dataType],
                headers = {},
                setHeader = function(name, value) {
                  headers[name.toLowerCase()] = [name, value]
                },
                // \w- 等价于[A-Za-z0-9_-]， 的值为test匹配到的正则中()里的内容
                protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
                xhr = settings.xhr(),
                // setRequestHeader() 是设置HTTP请求头部的方法。此方法必须在  open() 方法和 send()   之间调用。如果多次对同一个请求头赋值，只会生成一个合并了多个值的请求头。
                nativeSetHeader = xhr.setRequestHeader,
                abortTimeout;
            if (deferred) {
              deferred.promise(xhr)
            }
            if (!settings.crossDomain) {
              setHeader('X-Requested-With', 'XMLHttpRequest')
            }
            setHeader('Accept', mime || '*/*')
            // mimeType: 覆盖响应的 MIME 类型，可以是 json、 jsonp、 script、 xml、 html、 或者 text
            if (mime = settings.mimeType || mime) {
              if (mime.indexOf(',') > -1) {
                // split方法的第二个参数指定返回数组的长度
                mime = mime.split(',', 2)[0]
              }
              // overrideMimeType 方法是指定一个MIME类型用于替代服务器指定的类型，使服务端响应信息中传输的数据按照该指定MIME类型处理,此方法必须在send方法之前调用方为有效。
              xhr.overrideMimeType && xhr.overrideMimeType(mime)
            }
            // settings.contentType: 设置 Content-Type 请求头
            if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET')) {
              setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')
            }
            // settings.headers: 设置 HTTP 请求头
            if (settings.headers) {
              for (name in settings.headers) {
                setHeader(name, settings.headers[name])
              }
            }
            xhr.setRequestHeader = setHeader;
            // 在浏览器响应过程中，每当 readyState 属性改变时，就会触发onreadystatechange事件
            xhr.onreadystatechange = function() {
              if (xhr.readyState == 4) {
                xhr.onreadystatechange = empty
                clearTimeout(abortTimeout)
                var result, error = false;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                  // 
                  dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
                  if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob') {
                    result = xhr.response
                  } else {
                    result = xhr.responseText
                    try {
                      result = ajaxDataFilter(result, dataType, settings)
                      if (dataType == 'script') {
                        // 用 (1, eval) ，而不是直接用 eval 呢，是为了确保 eval 执行的作用域是在 window 下
                        (1, eval)(result)
                      } else if (dataType == 'xml') {
                        result = xhr.responseXML
                      } else if (dataType == 'json') {
                        result = blankRE.test(result) ? null : $.parseJSON(result)
                      }
                    } catch (e) {
                      error = e
                    }
                    if (error) {
                      return ajaxError(error, 'parsererror', xhr, settings, deferred)
                    }
                  }
                  ajaxSuccess(result, xhr, settings, deferred)
                } else {
                  ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
                }
              }
            }
            if (ajaxBeforeSend(xhr, settings) === false) {
              // 如果该请求已被发出，XMLHttpRequest.abort() 方法将终止该请求。当一个请求被终止，它的 readyState 属性将被置为0
              xhr.abort()
              ajaxError(null, 'abort', xhr, settings, deferred)
              return xhr
            }
            var async = 'async' in settings ? settings.async : true
            xhr.open(settings.type, settings.url, async, settings.username, settings.password)
            // xhrFields 用来存放xhr的配置信息，实现可配置，默认是空的
            if (settings.xhrFields) {
              for (name in settings.xhrFields) {
                xhr[name] = settings.xhrFields[name]
              }
            }
            // 这里的nativeSetHeader = xhr.setRequestHeader
            for (name in headers) {
              nativeSetHeader.apply(xhr, headers[name])
            }
            if (settings.timeout > 0) {
              abortTimeout = setTimeout(function() {
                xhr.onreadystatechange = empty
                xhr.abort()
                ajaxError(null, 'timeout', xhr, settings, deferred)
              }, settings.timeout)
            }
            xhr.send(settings.data ? settings.data : null)
            return xhr
        }
        // 默认配置项
        $.ajaxSettings = {
            type: 'GET',
            beforeSend: empty, // 请求发出前调用的函数
            success: empty,
            error: empty,
            complete: empty,
            context: null, // 用于设置Ajax相关回调函数的上下文，默认为 window
            global: true, //请求将触发全局Ajax事件处理程序，设置为 false 将不会触发全局 Ajax 事件
            xhr: function() {
                return new window.XMLHttpRequest()
            },
            accepts: {
                script: 'text/javascript, application/javascript, application/x-javascript',
                json: jsonType,
                xml: 'application/xml, text/xml',
                html: htmlType,
                text: 'text/plain'
            },
            crossDomain: false, // 是否可以跨越
            timeout: 0,
            processData: true, // 对于非Get请求。默认将 data 转换为字符串
            cache: true, // 是否允许浏览器缓存 GET 请求，默认为 false
            dataFilter: empty // 指定一个函数，如何对响应数据进行过滤
        }
        $.active = 0;
        var escape = encodeURIComponent;
        $.param = function(obj, traditional) {
          var params = [];
          params.add = function(key, value) {
            if ($.isFunction(value)) {
              value = value()
            }
            if (value == null) {
              value = ""
            }
            this.push(escape(key) + '=' + escape(value))
          }
          serialize(params, obj, traditional)
          // %20代表 空格 ；
          return params.join('&').replace(/%20/g, '+')
        }
        // jsonp:实现跨域其实是利用了script可以请求跨域资源的特点，所以实现 jsonp 的基本步骤就是向页面动态插入一个 script 标签，在请求地址上带上需要传递的参数，以及给后端的回调函数callback，后端根据前端传参获得结果后，把数据当作回调函数的参数返回给前端callback({...})，前端调用回调函数进行解释
        $.ajaxJSONP = function(options, deferred) {
          if (!('type' in options)) return $.ajax(options)
          var _callbackName = options.jsonpCallback,
              callbackName = ($.isFunction(_callbackName) ? _callbackName() : _callbackName ) || ('Xepto' + (jsonpID++)),
              script = document.createElement('script'),
              originalCallback = window[callbackName],
              responseData,
              abort = function(errorType) {
                $(script).triggerHandler('error', errorType || 'abort')
              },
              xhr = {abort: abort},
              abortTimeout;
          if (deferred) {
            deferred.promise(xhr)
          }
          $(script).on('load error', function(e, errorType) {
            clearTimeout(abortTimeout)
            $(script).off().remove()
            if (e.type == 'error' || !responseData) {
              ajaxError(null, errorType || 'error', xhr, options, deferred)
            } else {
              ajaxSuccess(responseData[0], xhr, options, deferred)
            }

            window[callbackName] = originalCallback
            if (responseData && $.isFunction(originalCallback)) {
              originalCallback(responseData[0])
            }

            originalCallback = responseData = undefined
          })

          if (ajaxBeforeSend(xhr, options) === false) {
            abort('abort')
            return xhr
          }
          // 后端返回的数据就被当作参数传给这个回掉函数callback(arguments)
          window[callbackName] = function(){
            responseData = arguments
          }
          script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
          document.head.appendChild(script)

          if (options.timeout > 0) {
            abortTimeout = setTimeout(function(){
              abort('timeout')
            }, options.timeout)
          }
          //+? 为什么返回xhr? responseData如何放到success的回调里的？
          return xhr
        }
    })(Xepto);
    return Xepto
}))