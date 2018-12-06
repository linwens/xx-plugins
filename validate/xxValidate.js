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
 *          2. 可设置错误提示出现位置;(需要硬性规定dom结构?);
 *          3. 最终返回一个Boolean值,确定是否校验通过(类似elementui的校验函数),参数是一个回调函数;
 *          4. 可自行扩展校验规则;
 *          5. 
 **/
;(function(window, document){
    //预先定义好(各种校验规则)策略，替换N个if判断
    var strategies = {
        // 是否为空
        isNoEmpty: function( val, errMsg){
            if( val === '' ){
                //if(cb){cb(this, errMsg)}
                return errMsg;
            // }else{
            //     removeTips(this)
            }
        },
        //最大长度
        maxLen:function( val, max, errMsg){
            //console.log(arguments)
            if(val.length>max){
                //if(cb){cb(this, errMsg)}
                return errMsg;
            // }else{
            //     removeTips(this)
            }
        },
        //最小长度
        minLen:function( val, min, errMsg){
            if(val.length<min){
                //if(cb){cb(this, errMsg)}
                return errMsg;
            //}else{
            //    removeTips(this)
            }
        },
        //校验手机号
        isMobile: function( val, errMsg){
            if(!/(^1[3|5|8][0-9]{9}$)/.test( val )){
                //if(cb){cb(this, errMsg)}
                return errMsg;
            //}else{
            //    removeTips(this)
            }
        },
    };
    //一些工具函数
    //给目标元素后面增加元素用于存放提示信息
    var removeTips = function(t){
        for(var i=0, cn; cn=t.parentNode.childNodes[i++];){
            if(cn.attributes&&cn.attributes['prop']&&cn.attributes['prop'].nodeValue==='msgbox'){
            //     //NodeList不是数组，所以不能用splice方法
            //     if(m){
            //         cn.innerText = m;
            //     }else{
                     t.parentNode.removeChild(cn);
            //     }
            //     return;
            }
        }
    };
    var createTips = function(t,m){
        // console.log(t);
        // console.log(m);
        for(var i=0, cn; cn=t.parentNode.childNodes[i++];){
            if(cn.attributes&&cn.attributes['prop']&&cn.attributes['prop'].nodeValue==='msgbox'){
                //NodeList不是数组，所以不能用splice方法
                if(m){
                    cn.innerText = m;
                }else{
                    t.parentNode.removeChild(cn);
                }
                return;
            }
        }
        var msg = document.createElement('span');
        msg.setAttribute('prop','msgbox');
        msg.innerText = m;
        t.parentNode.appendChild(msg);
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
    //保存校验规则的函数
    Validator.prototype.add = function(dom, rules){
        var _self = this;
        for(var i=0, rule; rule=rules[i++];){
            (function(rule){//通过闭包预存rule, 不然push的时候会有问题,而且访问不到rule变量
                var ary = rule.strategy.split(':');
                var errMsg = rule.errMsg;
                
                _self.cache.push(function(){
                    var strategy = ary.shift(); // shift()把数组的第一个元素从其中删除，并返回第一个元素的值.
                    ary.unshift(dom.value); //数组首部存入value
                    ary.push(errMsg); // 数组尾部存入errMsg
                    // var cb = function(t,m){ //校验时执行的回调
                    //     createTips(t,m)
                    // }
                    // ary.push(cb);
                    msg = strategies[strategy].apply(dom, ary); // 绑定this,返回函数
                    return {"dom":dom,"msg":msg};
                })
            })(rule)
        }
    };
    //启动校验的函数
    Validator.prototype.start = function(){
        var valid = [];//用于存储返回结果
        var domCache = [];
        for(var i=0, validateFunc; validateFunc = this.cache[i++];){ // 遍历缓存的校验规则, 执行校验获取返回信息
            var inst = validateFunc();
            console.log(inst)
            if(inst){//存在错误信息
                if(inst.msg){
                    valid.push(inst);
                }else{
                    if(isRepeat(valid,inst.dom.name)<1){//当前dom已存在，提示信息不删除
                        removeTips(inst.dom)
                    }
                }
                //for(var j=0,item;item=valid[j++];){
                var k = valid.indexOf(inst);
                if(k>-1){//长度大于1
                    if(isRepeat(valid,inst.dom.name)>1){
                        continue;
                    }else{
                        createTips(inst.dom,inst.msg)
                    }
                }
                
                
                // if(k>-1&&valid[k].dom.name===inst.dom.name){
                //     console.log('这个dom有了');
                //     console.log(domCache[k])
                //     continue;
                // }else{
                //     //domCache.push(inst.dom);
                //     createTips(inst.dom,inst.msg)
                // }
                //}
            }
            // if(valid.length==0){ // 如果存在返回信息说明校验没通过
            //     return true;
            // }else{
            //     return false;
            // }
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