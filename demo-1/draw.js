function Draw(obj) {
    this.canvasId = obj.canvasId || 'myCanvas'; //canvas的Id
    this.c = obj.c || null; //canvas对象
    this.ctx = obj.ctx || null; //画笔对象
    this.canvas_width = obj.canvas_width || 600; //画布宽度
    this.canvas_height = obj.canvas_height || 400; //画布高度
    this.origin_x = obj.origin_x || 300; //中心点横坐标
    this.origin_y = obj.origin_y || 200; //中心点纵坐标

    this.circle = obj.circle || { //圆的参数
        x: this.origin_x, //圆心横坐标
        y: this.origin_y, //圆心纵坐标
        r: 150 //圆半径
    };
    this.polygon = obj.polygon || { //多角形参数
        n: 5, //图形顶点个数
        type: 0, //图形类型
    };

    this._init = function (obj) { //初始化
        this._createCanvas();//创建canvas对象
        this._setStyle(obj)//设置画笔样式
        this._drawPolygon(obj);//绘制多角星形
        this._drawText(obj);//绘制文本
        this._createGradient(obj);//绘制渐变
        // this._toDataURL({quality:0.5});
    };

    this._createCanvas = function (id) { //获取canvas对象，创建绘制2d图像画笔
        this.c = document.getElementById(id || this.canvasId);
        this.ctx = this.c.getContext("2d");
    };

    this._drawCircle = function (obj) { //画圆函数
        var ctx = obj.ctx || this.ctx;
        var x = obj.x || this.origin_x;
        var y = obj.y || this.origin_y;
        var r = obj.r || 150;
        var start_angle = obj.start_angle || 0;
        var end_angle = obj.end_angle || 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(x, y, r, start_angle, end_angle);
    };

    this._drawPolygon = function (obj) { //绘制多角形或者多边形函数
        // var obj = obj || this.polygon;
        var ctx = obj.ctx || this.ctx;
        //设置图形参数
        var start_x = obj.x || this.circle.x;
        var start_y = obj.y || this.circle.y;
        var zoom = obj.r || this.circle.r;
        var n = obj.n || this.polygon.n || 5; //顶点的个数
        var type = obj.type || this.polygon.type || 0; //绘制多边形还是多角星形,1 为多边形，0 为多角星形

        var z = this._fibo(n); //求转角个数
        var ratio = type ? 2 / n : z / n * 2; //顶点旋转系数

        this._clearRect({}); //先清除画布
        !type && this._drawCircle(this.circle); //根据是不是多角形，判断是否执行画圆操作

        ctx.moveTo(start_x, start_y - zoom); //移动到初始位置
        //绘制图形
        for (let i = 0; i < n + 1; i++) {
            var init_angle; //初始角度
            var move_angle = ratio * Math.PI * i; //移动角度
            init_angle = 1.5 * Math.PI;
            if (n % 4 == 2 && !type) {
                if (i >= n / 2) {
                    init_angle = 1.5 * Math.PI + 2 * Math.PI / n;
                }
                if (i == n / 2) {
                    ctx.closePath(); //在图形绘制一半时闭合原来的路径
                    // ctx.lineTo(start_x, start_y - zoom); //从新回到初始位置
                    ctx.moveTo(this._getXY(init_angle, 0, start_x, start_y, zoom).x, this._getXY(init_angle, 0, start_x, start_y, zoom).y); //移动到偏移位置
                }
            }
            var M = this._getXY(init_angle, move_angle, start_x, start_y, zoom); //获得新点坐标
            ctx.lineTo(M.x, M.y); //连接到新点
        };
        ctx.stroke();
        ctx.beginPath(); //绘制完成新开一个路径
    };

    this._fibo = function (n) { //求转换角个数的递归函数
        if (typeof n != "number" || n < 1) {
            console.log(n)
            return;
        } else if (n === 1 || n === 2) {
            return 0;
        }
        return this._fibo(n - 2) + 1;
    };

    this._getXY = function (init_angle, move_angle, start_x, start_y, zoom) { //以原点求顶点坐标，zoom 为半径，init_angle 为初始角度，move_angle 为移动角度, start_ 初始点坐标
        return {
            x: zoom * Math.cos(init_angle + move_angle) + start_x,
            y: zoom * Math.sin(init_angle + move_angle) + start_y
        }
    }

    this._setLine = function (obj) { //设置线条样式
        var ctx = obj.ctx || this.ctx;
        ctx.lineCap = obj.lineCap; // 线条的结束端点样式 butt|round|square
        ctx.lineWidth = obj.lineWidth; // 线宽 number
        ctx.lineJoin = obj.lineJoin; // 线条相交时的拐角类型 bevel|round|miter
        ctx.miterLimit = obj.miterLimit; // 最大斜接长度 number
        return {
            lineCap: ctx.lineCap,
            lineWidth: ctx.lineWidth,
            lineJoin: ctx.lineJoin,
            miterLimit: ctx.miterLimit
        }
    }

    this._drawRect = function (obj) { //绘制矩形
        var ctx = obj.ctx || this.ctx;
        var x = obj.x || this.origin_x;
        var y = obj.y || this.origin_y;
        var w = obj.w || 150;
        var h = obj.h || 100;
        if (obj.type != 'fill') {
            ctx.rect(x, y, w, h);
            // ctx.stroke();
        } else {
            ctx.fillRect(x, y, w, h);
        }

    }

    this._drawText = function (obj) { //绘制文字
        var ctx = obj.ctx || this.ctx;
        ctx.font = obj.font || "16px Arial"; //字体属性
        ctx.textAlign = obj.textAlign || "center"; // 当前对齐方式 center|end|left|right|start
        ctx.textBaseline = obj.textBaseline || "top"; // 当前文本基线 alphabetic|top|hanging|middle|ideographic|bottom
        ctx.fillStyle = obj.fillStyle || this.strokeStyle;
        if (obj.type != 'stroke') {
            ctx.fillText(obj.text || 'hello canvas', obj.x || 10, obj.y || 0);
        } else {
            ctx.strokeText(obj.text || 'hello canvas', obj.x || 0, obj.y || 0);
        }

    }

    this._setStyle = function (obj) { //设置样式
        var ctx = obj.ctx || this.ctx;
        ctx.fillStyle = obj.fillStyle; //填充绘画的颜色、渐变或模式 color|gradient|pattern
        ctx.strokeStyle = obj.strokeStyle; //笔触的颜色、渐变或模式 color|gradient|pattern
        ctx.shadowBlur = obj.shadowBlur; // 阴影的模糊级数 number
        ctx.shadowColor = obj.shadowColor; // 阴影的颜色 color
        ctx.shadowOffsetX = obj.shadowOffsetX; // 阴影与形状的水平距离 number
        ctx.shadowOffsetY = obj.shadowOffsetY; // 阴影与形状的垂直距离 number
        return {
            fillStyle: ctx.fillStyle,
            strokeStyle: ctx.strokeStyle,
            shadowBlur: ctx.shadowBlur,
            shadowColor: ctx.shadowColor,
            shadowOffsetX: ctx.shadowOffsetX,
            shadowOffsetY: ctx.shadowOffsetY
        }
    }

    this._createGradient = function (obj) { //创建渐变
        var ctx = obj.ctx || this.ctx;
        var type = obj.type || "linear"; //线性渐变还是环形渐变
        var x0 = obj.x0 || 0; //渐变起始点x 坐标
        var y0 = obj.y0 || 0;
        var x1 = obj.x1 || 100; //渐变结束点x 坐标
        var y1 = obj.y1 || 100;
        var r0 = obj.r0 || 1; //开始圆的半径
        var r1 = obj.r1 || 100;
        var grd = null; //渐变方式
        var colorStops = obj.colorStops || {
            0: "black",
            1: "white"
        }; //渐变对象中的颜色和位置组
        if (type == 'linear') {
            grd = ctx.createLinearGradient(x0, y0, x1, y1);
        } else {
            grd = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
        }
        for (var i in colorStops) {
            grd.addColorStop(i, colorStops[i]);
        }
        return grd;
    }

    this._createPattern = function (obj) { //在指定的方向内重复指定的元素
        var ctx = obj.ctx || this.ctx;
        var ele = obj.ele; //需要重复的元素
        var repeat = obj.repeat; //重复方式 "repeat|repeat-x|repeat-y|no-repeat"
        var pat = ctx.createPattern(ele, repeat);
        return pat;
    }

    this._clearRect = function (obj) { //清除画布
        var ctx = obj.ctx || this.ctx;
        var x = obj.x || 0;
        var y = obj.y || 0;
        var w = obj.w || this.c.width;
        var h = obj.h || this.c.height;
        ctx.clearRect(x, y, w, h)
    }

    this._isPointInPath = function (x, y) { //判断点是否在图形内
        var ctx = this.ctx;
        return ctx.isPointInPath(20, 50)
    }

    this._toDataURL = function(obj){//将画布保存为base64图片
        var c= obj.c || this.c;
        var type = obj.type || 'image/jpg';//图片类型
        var quality = obj.quality || 1;
        var dataURL = c.toDataURL(type,quality);
        console.log(dataURL);
        return dataURL;
    }

    this._save = function(ctx){//保存当前环境的状态
        var ctx = ctx || this.ctx;
        ctx.save();
    }

    this._restore = function(ctx){//返回之前保存过的路径状态和属性
        var ctx = ctx || this.ctx;
        ctx.restore();
    }

    this._createEvent = function(){//创建新的 Event 对象
        var ctx = ctx || this.ctx;
        ctx.createEvent();
    }

}

window.Draw = Draw;


function mousePosition(ev) { //获取鼠标在页面的位置
    if (ev.pageX || ev.pageY) {
        return {
            x: ev.pageX,
            y: ev.pageY
        };
    }
    return {
        x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        y: ev.clientY + document.body.scrollTop - document.body.clientTop
    };
}

function mouseMove(ev) {
    ev = ev || window.event;
    var mousePos = mousePosition(ev);
    // console.log(mousePos.x,mousePos.y)
}
document.onmousemove = mouseMove;