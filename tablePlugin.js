// 属性  editor 代表是否可手动输入  值为"text" 为可编辑列

function tablePlugin (options){
    this.options = options;
    // this.$el = options.$el;   // 挂载的table元素
    this.el = options.el;       // 挂载的元素
    this.columns = options.columns  // 表头数据
    this.theadrow = options.theadrow || false;   // 是否表头行合并  默认不合并
    this.theadcol = options.theadcol || false;   // 是否表头列合并  默认不合并
    this.data = options.data;       // data 数据
    this.fixedcol = options.fixedcol;     // 固定列的数组
    this.editFocusInputHun = options.editFocusInputHun;  // 可编辑input 聚焦 
    this.editBlurInputHun = options.editBlurInputHun;  // 可编辑input 失焦
    this.init();
};
// 初始化表格插件
tablePlugin.prototype.init = function(){
    this.setTheadModel();   // 构造一个简单的表头
    this.setTbodyModel();   // 构造一个简单的表体
    this.setTableStyle();   // 构造表格单元格的简单样式
    this.setEditCol();      // 构造可编辑列
    this.setFixedCol();     // 构造固定列
    this.inputFocusAndBlurStyle();      //  再可编辑input 中聚焦时样式问题
}
// 构造一个简单的表头
tablePlugin.prototype.setTheadModel = function(){
    if(!this.theadrow && !this.theadcol){   // 简单的没有合并的表头
        var $thead = `<thead><tr></tr></thead>`
        document.querySelector(this.el).innerHTML = $thead
        this.columns.forEach((item,index) => {
            var $tds = `<td field = ${item.field} editor = ${item.editor} style="width:${item.width}px;min-width:${item.width}px;text-align:${item.align}">${item.title}</td>`;
            document.querySelector(`${this.el} thead tr`).innerHTML += $tds
        });
    }

}

// 构造一个简单的表体
tablePlugin.prototype.setTbodyModel = function(){
    var $tbody = `<tbody></tbody>`
    document.querySelector(this.el).innerHTML += $tbody;
    this.data.forEach((item,index) => {
        // 遍历对象添加 td
        var $tds = ``;
        for(var key in item){
            $tds += `<td field=${key}>${item[key]}</td>`
        }
        var $trs = `<tr>${$tds}</tr>`;
        document.querySelector(`${this.el} tbody`).innerHTML += $trs
    })
}

// 构造表格单元格的简单样式
tablePlugin.prototype.setTableStyle = function(){
    var thTds = document.querySelectorAll(`${this.el} thead td`);
    thTds.forEach((itemTh,indexTh)=>{
        var tbTds = document.querySelectorAll(`${this.el} tbody td`);
        tbTds.forEach((itemTb,indexTb)=>{
            // 如果 表体中的 td 与 表头的 td  一样的 field  就代表是一列 需要设置一样的宽度与位置显示
            if(thTds[indexTh].getAttribute('field') == tbTds[indexTb].getAttribute('field')){
                tbTds[indexTb].style.textAlign = thTds[indexTh].style.textAlign;
                tbTds[indexTb].style.width = thTds[indexTh].style.width;
            }
        })
    })
}

//  构造可编辑列
tablePlugin.prototype.setEditCol = function(){
    var thTds = document.querySelectorAll(`${this.el} thead td`);
    thTds.forEach((itemTh,indexTh)=>{
        var tbTds = document.querySelectorAll(`${this.el} tbody td`);
        tbTds.forEach((itemTb,indexTb)=>{
            if(thTds[indexTh].getAttribute('editor') == 'text' && thTds[indexTh].getAttribute('field') == tbTds[indexTb].getAttribute('field')){
                $itemTbInput = `<input value="${tbTds[indexTb].innerHTML} "\>`;
                tbTds[indexTb].innerHTML =  $itemTbInput
            }
        })
    })
}

//  再可编辑input 中聚焦与失焦时样式问题
tablePlugin.prototype.inputFocusAndBlurStyle = function($td){
    var tdInputs = document.querySelectorAll(`${this.el} tbody td input`);
    tdInputs.forEach((itemInput,indexInput)=>{
        // 1. 聚焦
        itemInput.addEventListener('focus',(e)=>{
            if(this.editFocusInputHun && this.editFocusInputHun(this,e)){
                this.editFocusInputHun(this,itemInput,e)
            }
        })
        // 2. 失焦
        itemInput.addEventListener('blur',(e)=>{
            if(this.editBlurInputHun && this.editBlurInputHun(this,e)){
                this.editBlurInputHun(this,itemInput,e)
            }
        })
    })
}

//  构造固定列
tablePlugin.prototype.setFixedCol = function(){
    if(this.fixedcol && this.fixedcol.length > 0){
        // 构造新的table 用于遮罩固定列
        var hidTable = `<table class="hidTable" cellspacing="0" cellpadding="0"></table>`;
        var showTab = document.querySelector(this.el);   // 原本存在的table
        showTab.parentNode.parentNode.innerHTML+= hidTable;         // 将新的table 存放到页面中
        // document.querySelector(`${this.el}`).nextElementSibling;  // 获取已经存放到页面中的用于遮罩的元素
        var newThead = document.querySelector(`${this.el} thead`).cloneNode(true); // 克隆新的表头节点
        var newTbody = document.querySelector(`${this.el} tbody`).cloneNode(true); // 克隆新的表体节点
        document.querySelector(`${this.el}`).parentNode.nextElementSibling.appendChild(newThead); // 将克隆的新的表头节点放入到新的 table 中
        document.querySelector(`${this.el}`).parentNode.nextElementSibling.appendChild(newTbody); // 将克隆的新的表体节点放入到新的 table 中
        debugger
        // 这里的遍历是为了给固定的td 添加上标识
        this.fixedcol.forEach((itemFix,indexFix)=>{
            document.querySelector(`${this.el}`).parentNode.nextElementSibling.querySelectorAll('td').forEach((itemTd,indexTd)=>{
                if(itemFix == itemTd.getAttribute('field')){
                    itemTd.setAttribute('showClass',true) 
                }
            })
        });
        // 这里的遍历是为了突出做标记的td 删除没有标记的
        document.querySelector(`${this.el}`).parentNode.nextElementSibling.querySelectorAll('td').forEach((itemTd,indexTd)=>{
            if(!itemTd.getAttribute('showClass')){
                itemTd.remove()
            }
        })
    }
}
