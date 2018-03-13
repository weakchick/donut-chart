/**
 * @description 创建环形图
 * @author yangCJ
 * @param {object} option 
 * @param {string} option.x 圆心横坐标 百分比
 * @param {string} option.y 圆心纵坐标 百分比
 * @param {string} radius 圆环半径 百分比
 * @param {string} lineWidth 圆环宽度 百分比
 * @param {number} startAngle 起始角度 0到360
 * @param {string} capType 圆弧拼接类型 "round"
 * @param {string} fontStyle 文本描述样式
 * @param {array} data 圆弧数据
 * @param {string} data[i].name 数据名称
 * @param {number} data[i].value 数据值
 * @param {object} selectedStyle 选中的圆弧样式
 * @param {string} selectedStyle.color 选中的圆弧边界颜色
 * @param {number} selectedStyle.borderWidth 选中的圆弧边界宽度
 * @param {array} color 圆弧的分配颜色
 */

function circularRing(canvasId, option) {
    this.option = option
    this.canvas = document.getElementById(canvasId);
    this.width = this.canvas.width
    this.height = this.canvas.height
    this.ctx = this.canvas.getContext('2d');
    this.circleX = formatPercent(option.x, "option.x") * this.width
    this.circleY = formatPercent(option.y, "option.x") * this.height
    this.lineWidth = formatPercent(option.lineWidth, 'option.lineWidth') * (this.width > this.height ? this.height : this.width)
    this.label = option.label
    this.radius = formatPercent(option.radius, 'option.radius') * (this.width > this.height ? this.height : this.width)
    this.data = option.data
    this.color = option.color
}
circularRing.prototype.drawArc = function (startAngle, endAngle, color, lineWidth) {

    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, angelToRadian(startAngle), angelToRadian(endAngle), false); // 坐标为90的圆，这里起始角度是0，结束角度是Math.PI*2
    if (lineWidth) {
        this.ctx.lineWidth = lineWidth
    }
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
    this.ctx.closePath();
};
circularRing.prototype.drawTitle = function (titleFlag) {
    if (this.option.title && !titleFlag) {
        // title 主标题
        if (!this.option.title.text.value) {
            return false;
        }
        this.ctx.beginPath();
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = this.option.title.text.color;
        this.ctx.font = this.option.title.text.fontSize + ' ' + this.option.title.text.fontFamily;
        // 副标题
        if (!this.option.title.secondText.value) {
            this.ctx.fillText(this.option.title.text.value, formatPercent(this.option.title.x) * this.width, formatPercent(this.option.title.y) * this.height);
            return false;
        }
        this.ctx.fillText(this.option.title.text.value, formatPercent(this.option.title.x) * this.width, formatPercent(this.option.title.y) * this.height - 2 * formatPx(this.option.title.text.fontSize, 'option.title.text.fontSize') / 3);
        this.ctx.beginPath();
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = this.option.title.secondText.color;
        this.ctx.font = this.option.title.secondText.fontSize + ' ' + this.option.title.secondText.fontFamily;
        this.ctx.fillText(this.option.title.secondText.value, formatPercent(this.option.title.x) * this.width, formatPercent(this.option.title.y) * this.height + 2 * formatPx(this.option.title.secondText.fontSize, 'option.title.secondText.fontSize') / 3);
    }
}
circularRing.prototype.drawTip = function (param) {
    if (!this.option.tooltip.show) {
        return false;
    }
    this.ctx.save()
    this.ctx.rotate(angelToRadian(90 + this.option.startAngle))
    this.ctx.beginPath();
    this.ctx.font = this.option.tooltip.fontSize + ' ' + this.option.tooltip.fontFamily
    this.ctx.rect(param.x - 5, param.y - 5, this.ctx.measureText(param.data.name).width + 10, 2.5 * formatPx(this.option.tooltip.fontSize) + 10);
    this.ctx.fillStyle = '#00000088'
    this.ctx.fill();
    this.ctx.fillStyle = this.option.tooltip.color;
    this.ctx.textAlign = "start";
    this.ctx.fillText(param.data.name, param.x, param.y + formatPx(this.option.tooltip.fontSize))
    this.ctx.fillText(param.data.value + '(' + param.data.percent + ')', param.x, param.y + 2.2 * formatPx(this.option.tooltip.fontSize))
    this.ctx.restore();
}
circularRing.prototype.drawLabel = function (param) {
    if(!this.option.label.show){
        return false;
    }
    // 添加字体
    this.ctx.save()
    this.ctx.rotate(angelToRadian(90 + this.option.startAngle))
    this.ctx.beginPath();
    this.ctx.fillStyle = this.label.firstTextStyle.color;
    this.ctx.font = this.label.firstTextStyle.fontSize + ' ' + this.label.firstTextStyle.fontFamily;
    this.ctx.textAlign = "center";
    this.ctx.fillText(param.name, 0, -2 * formatPx(this.label.firstTextStyle.fontSize, 'label.firstTextStyle.fontSize') / 3);

    this.ctx.beginPath();
    this.ctx.fillStyle = this.label.secondTextStyle.color;
    this.ctx.font = this.label.secondTextStyle.fontSize + ' ' + this.label.secondTextStyle.fontFamily;
    this.ctx.fillText(param.value, 0, 2 * formatPx(this.label.secondTextStyle.fontSize, 'label.secondTextStyle.fontSize') / 3);
    this.ctx.restore();
}
circularRing.prototype.init = function (callback, titleFlag) {
    if (callback && typeof callback != 'function') {
        throw 'init() 第一个参数必须是函数'
    }
    if (titleFlag && typeof titleFlag != 'boolean') {
        throw 'labelCoverTitle 必须是boolean'
    }
    this.canvas.width = this.canvas.width
    this.drawTitle(titleFlag)
    this.ctx.translate(this.circleX, this.circleY);

    this.ctx.rotate(angelToRadian(-90 + this.option.startAngle))
    this.ctx.lineWidth = this.lineWidth
    this.ctx.lineCap = this.option.capType
    var _this = this
    this.arcArray = []
    var total = 0
    this.data.forEach(function (item, index) {
        total += item.value
    })
    var lastAngel = 0
    this.data.forEach(function (item, index) {
        var arr = (item.value / total).toFixed(4).toString().slice(2).split('')
        arr.splice(2, 0, '.')
        var num = arr.join('')

        _this.arcArray[index] = {
            index: index,
            name: item.name,
            value: item.value,
            startAngle: lastAngel,
            endAngle: item.value / total * 360 + lastAngel,
            percent: num + '%'
        }
        lastAngel = _this.arcArray[index].endAngle
    })
    this.data.forEach(function (item, index) {
        _this.drawArc(_this.arcArray[index].startAngle, _this.arcArray[index].endAngle, _this.color[index])
    })
    for (var i = 0, l = this.data.length; i < l; i++) {
        if (this.data[i].value != 0) {
            this.drawArc(0, 0.05, this.color[i])
            break;
        }
    }

    // 绑定事件
    this.canvas.onmousemove = function (e) {

        var rate = _this.canvas[this.width > this.height ? "offsetHeight" : "offsetWidth"] / this[this.width > this.height ? "height" : "width"]

        var x = e.offsetX - this.offsetWidth / 2
        var y = e.offsetY - this.offsetHeight / 2
        var x2 = x * x
        var y2 = y * y

        // 选中圆环
        if (Math.sqrt(x2 + y2) > (_this.radius - _this.lineWidth) * rate && Math.sqrt(x2 + y2) < (_this.radius + _this.lineWidth) * rate) {
            var angle = Math.atan2(x, -y) / (Math.PI / 180) > 0 ? Math.atan2(x, -y) / (Math.PI / 180) : 360 + Math.atan2(x, -y) / (Math.PI / 180)
            // 选中某段，显示某段

            for (var i = 0, l = _this.arcArray.length; i < l; i++) {
                if (angle < _this.arcArray[i].endAngle) {
                    _this.init(callback, _this.option.labelCoverTitle)
                    _this.drawArc(_this.arcArray[i].startAngle, _this.arcArray[i].endAngle, _this.option.selectedStyle.color, _this.option.selectedStyle.borderWidth + _this.lineWidth)
                    _this.drawArc(_this.arcArray[i].startAngle, _this.arcArray[i].endAngle, _this.color[i], _this.lineWidth)

                    // show label
                    _this.drawLabel(_this.arcArray[i])
                    // show tip
                    _this.drawTip({
                        x: x,
                        y: y,
                        data: _this.arcArray[i]
                    })
                    callback(_this.arcArray[i])
                    break;
                }
            }


        } else {
            _this.init(callback)
        }

    }

}
// 百分比字符串转小数
function formatPercent(param, name) {
    if (typeof param == 'string' && param.indexOf('%') == param.length - 1) {
        return param.slice(0, -1) / 100
    }
    throw name + " 参数格式错误"
}
// 字体大小字符串去px
function formatPx(param, name) {
    if (typeof param == 'string' && param.indexOf('px') == param.length - 2) {
        return +param.slice(0, -2)
    }
    throw name + " 参数格式错误"
}
// 角度转弧度
function angelToRadian(param) {
    return param * Math.PI / 180
}