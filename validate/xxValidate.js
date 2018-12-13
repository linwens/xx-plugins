/**
 * GitHub地址：
 * 
 * 参考资料: https://github.com/jquery-validation/jquery-validation/blob/master/src/core.js ,
 *          https://github.com/chriso/validator.js ,
 *          js高级程序设计14章--表单脚本 ,
 *          https://wangchujiang.com/validator.js/ ,
 *          https://github.com/WLDragon/SMValidator ,
 *          
 * 
 * 
 * 思路：
 * 
 * 设计模式：策略模式
 * 
 * 关键方法：strategies[strategy].apply(dom, ary)
 * 
 * 调用方式：(dom, [{ strategy:'name[: other arg]', errMsg:'' }]),错误提示出现顺序依据调用顺序为准
 * 
 * 实现功能: 1. 不需要form表单,走ajax提交,每个input元素增加独立的校验;
 *          2. 可设置错误提示的样式;(需要硬性规定dom结构?);
 *          3. 最终返回一个Boolean值,确定是否校验通过(类似elementui的校验函数),参数是一个回调函数;
 *          4. 可自行扩展校验规则;---ok
 *          5. checkbox/radio校验;---ok
 *          6. 设置校验的时间（blur,change,提交时统一校验）
 *          7. 
 **/
;(function(window, document){
    //预先定义好(各种校验规则)策略，替换N个if判断
    var strategies = {
        // 是否为空
        isNoEmpty: function( val, errMsg){
            if( val === '' || val.length==0){
                return errMsg;
            }
        },
        //最大长度
        maxLen:function( val, max, errMsg){
            if(val.length>max){
                return errMsg;
            }
        },
        //最小长度
        minLen:function( val, min, errMsg){
            if(val.length<min){
                return errMsg;
            }
        },
        //校验手机号
        isMobile: function( val, errMsg){
            if(!/(^1[3|5|8][0-9]{9}$)/.test( val )){
                return errMsg;
            }
        },
    };
    //一些工具函数
    //判断对象是否包含某个属性
    var hasOwn = Object.prototype.hasOwnProperty;
    //合并对象的方法（遍历赋值）
    var assignObj = function(tar, rs){
        //如果支持Object.assign就用原生方法
        if(Object.assign){
            return Object.assign({},tar,rs);
        }else{//---------------------/可以写个方法替代ES6的Object.assign
            for(var k in rs){
                //if(!hasOwn.call(tar,k)){//可以增加但是不能覆盖原有的
                    tar[k] = rs[k] 
                //}
            }
            return tar;
        }
    }
    //判断数据类型
    var checkType = function(data){
        //我想直接返回类型的字符串
        const str = Object.prototype.toString.call(data)
        return /^\[object (.*)\]$/.exec(str)[1]
    };
    //自定义事件绑定函数
    var on = function(tar, type, fn){
        if(addEventListener){
            tar.addEventListener(type,fn);
        }else{
            tar.attachEvent("on"+type, fn);
        }
    };
    //判断是否是checkbox
    var isChcekbox = function(input){
        if(input.length){//如果是一组多选框
            return input[0].type === "checkbox"
        }else{
            return input.type === "checkbox";
        }
    };
    //判断是否是radio
    var isRadio = function(input){
        if(input.length){//如果是一组多选框
            return input[0].type === "radio"
        }else{
            return input.type === "radio";
        }
    };
    //检查元素是否存在/重复。。。该方法要优化，比如filter的回调函数提取出来给调用者
    var isRepeat = function isRepeat(arr, name){
        var newArr = [];
        newArr = arr.filter(function(item){
            return item.dom.name == name
        });
        return newArr.length;
    };
    //定义Validator工具类
    var Validator = function(){
        this.cache = []; //保存校验规则
    };
    var _proto = Validator.prototype;
    //增加自定义校验函数，扩展strategies
    _proto.moreStrat = function(newOpt){
        if(checkType(newOpt)==="Array"){
            for(var i=0,item;item=newOpt[i++];i<newOpt.length){
                if(!checkType(item)==="Object"){
                    continue;
                }else{
                    strategies = assignObj(strategies, item)
                }
            }
            //strategies.concat(newOpt);
        }
        if(checkType(newOpt)==="Object"){//如果是个对象就遍历赋值
            strategies = assignObj(strategies, newOpt)
        }
        if(checkType(newOpt)!=="Object"){
            console.error('新增校验规则未生效，参数不对')
        }
        console.log(strategies);
    },
    //生成消息提示dom
    _proto.insertHtml = function(tar, m){
        //判断是否radio
        if(tar.length&&tar.length>1){
            tar = tar[tar.length-1]
        }
        
        var tipsDom = tar.nextElementSibling;
        if(tipsDom){
            if(m){
                tipsDom.innerText = m;
            }else{
                tar.parentNode.removeChild(tar.nextElementSibling); //如果错误提示为空，把dom删掉
            }
        }else{
            if(m){ // 只有有错误信息的时候才生成提示dom
                var msg = document.createElement('span');
                msg.innerText = m;
                tar.parentNode.insertBefore(msg, tar.nextElementSibling) //找到目标元素的下一个元素（如果不存在就加在目标元素的后面），然后替换成消息提示dom;
            }
        }
        
    };
    //保存校验规则的函数
    _proto.add = function(dom, rules){
        var _self = this;
        for(var i=0, rule; rule=rules[i++];){
            (function(rule){//通过闭包预存rule, 不然push的时候会有问题,而且访问不到rule变量
                var ary = rule.strategy.split(':');
                var errMsg = rule.errMsg;
                
                _self.cache.push(function(){
                    var strategy = ary.shift(); // shift()把数组的第一个元素从其中删除，并返回第一个元素的值.
                    if(isChcekbox(dom)){//如果是多选框，val是一个存储多个多选框的数组
                        var val = [];
                        dom.name = dom[0].name;//给dom增加name字段，方便后面start函数里走进判断，生成错误提示
                        for(var i=0,item;item=dom[i++];i<dom.length){
                            if(item.checked){
                                val.push(item.value);
                            }
                        }
                        ary.unshift(val)
                    }else if(isRadio(dom)){
                        dom.name = dom[0].name;
                        ary.unshift(dom.value);
                    }else{
                        ary.unshift(dom.value); //数组首部存入value
                        //绑定事件
                    }
                    ary.push(errMsg); // 数组尾部存入errMsg
                    msg = strategies[strategy].apply(dom, ary); // 绑定this,返回函数
                    return {"dom":dom,"msg":msg};
                })
            })(rule)
        }
    };
    //启动校验的函数
    _proto.start = function(){
        var valid = [];//用于存储返回结果
        var domCache = [];
        for(var i=0, validateFunc; validateFunc = this.cache[i++];){ // 遍历缓存的校验规则, 执行校验获取返回信息
            var inst = validateFunc();
            if(inst){//存在错误信息
                if(inst.msg){
                    valid.push(inst);
                }else{
                    if(isRepeat(valid,inst.dom.name)<1){//当前dom已存在，提示信息不删除
                        //removeTips(inst.dom)
                        this.insertHtml(inst.dom,inst.msg)
                    }
                }
                var k = valid.indexOf(inst);
                if(k>-1){//长度大于1
                    if((isRepeat(valid,inst.dom.name)>1)){
                        continue;
                    }else{
                        this.insertHtml(inst.dom,inst.msg)
                        //createTips(inst.dom,inst.msg)
                    }
                }
            }
        }
        console.log('-----valid----');
        console.log(valid)
        if(valid.length==0){ // 如果存在返回信息说明校验没通过
            return true;
        }else{
            return false;
        }
    };

    // //暴露给用户的方法
    // var validateFunc = function(dom){
    //     var validator = new Validator();
    //     //增加校验规则(不能自动化)
    //     validator.add(dom.userName, 'isNoEmpty', '用户名不能为空');
    //     validator.add(dom.pwd, 'minLen:6', '密码长度不能少于 6 位');
    //     validator.add(dom.phoneNumber,'isMobile', '手机号码格式不正确');
    //     //获得校验结果
    //     var errorMsg = validator.start();
    //     //返回校验结果
    //     return errorMsg;
    // };

    //对外暴露函数接口
    //window.xxValid = validateFunc;
    window.xxValid = Validator;

})(window, document);