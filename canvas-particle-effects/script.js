/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Ga1axy_z
 * @Date: 2022-10-23 15:34:24
 * @LastEditors: Ga1axy_z
 * @LastEditTime: 2022-10-24 10:32:09
 */

// 首先找到 <canvas> 元素，下面第一句代码用于 VS Code canvas 语法的自动补全
/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("canvas");

// 设置画布大小铺满全屏
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 创建 context 对象，getContext("2d") 对象是内建的 HTML5 对象，拥有多种绘制路径、矩形、圆形、字符以及添加图像的方法
let ctx = canvas.getContext("2d");

let particles = []      // 存放粒子的数组
let numbers = []        // 存放每一个像素点，也就是粒子的最终位置（相对于画布中心的极坐标）
let character = ['你','真','的','懂','唯','一','的','定','义']
let times = [50, 35, 35, 45, 40, 150, 35, 35, 300]
let time = 100

let count = 0           // 计数器，用来调整每个字符显示之间的时间延迟
// let index = 10          // particles[] 的索引，这里用于存放十一个数字，0-10
let index = 0          // particles[] 的索引，这里用于存放九个汉字，0-8

class Particle{         // 粒子类
    constructor(d,r) {  // 参数为粒子的极坐标，（角度，距离）
        this.init_d = Math.random() * Math.PI * 3    // 初始角度随机，后面乘的数越大粒子运动幅度越大
        this.init_r = 0                              // 初始距离为 0
        this.target_d = d     // 最终角度
        this.target_r = r     // 最终距离
    }
    update() {          // 更新粒子的位置
        this.init_d += (this.target_d - this.init_d) / 6       // 除以的数值可以调整粒子移动的速度
        this.init_r += (this.target_r - this.init_r) / 6       // 每次移动的距离越来越短
    }
    draw() {            // 将极坐标转换为直角坐标，同时加上将其移动到画面中心的修正值
        let x = this.init_r * Math.cos(this.init_d) + canvas.width / 2          // 非线性运动，运动距离越来越小，每一次运动时间不变，速度越来越慢
        let y = this.init_r * Math.sin(this.init_d) + canvas.height / 2
        ctx.beginPath()
        // 每次获取新的位置作为圆（也就是单个粒子）的圆心
        // ctx.arc(x, y, 3, 0, 2 * Math.PI)    // 参数分别为 圆心坐标（这里就是粒子坐标），圆的半径（这里就是粒子大小），起始角度（极坐标），结束角度（极坐标）（角度设置 0-2π，绘制一个完整的圆作为单个粒子）
        ctx.arc(x, y, 1.6, 0, 2 * Math.PI)    // 参数分别为 圆心坐标（这里就是粒子坐标），圆的半径（这里就是粒子大小），起始角度（极坐标），结束角度（极坐标）（角度设置 0-2π，绘制一个完整的圆作为单个粒子）
        ctx.fillStyle = "rgba(81, 202, 76)"
        ctx.fill()      // 绘制实心的圆，stroke() 可以绘制空心的圆
    }
}

function RandomColor() {            // 随机 RGBA，暂时未使用
    let r, g, b, a
    r = Math.floor(Math.random() * 256)
    g = Math.floor(Math.random() * 256)
    b = Math.floor(Math.random() * 256)
    a = 0.1
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
}

function initNumbers() {
    for (let i=0; i<=10; i++) {                     // 0 到 10 共 11 个字符
        // ctx.font = "1.4rem Microsoft YaHei"
        ctx.font = "3rem Microsoft YaHei"

        let span = document.createElement("span")   // 将数字先放入 span 标签内，再获取标签的尺寸，以获得更精确的字符占用宽高的尺寸
        // span.style.fontSize = "1.4rem"
        span.style.fontSize = "3rem"
        span.style.fontFamily = "Microsoft YaHei"
        span.style.color = "white"
        span.innerHTML = character[i]
        document.body.appendChild(span)
        let real_width = span.offsetWidth           // offsetWidth 属性用于获取元素的宽度，包含内边距（padding）和边框（border），不包含外边距（margin）
        let real_height = span.offsetHeight
        span.remove()                               // 移除掉 span 标签

        ctx.fillText(character[i], 0, real_height-6)           // 后两个参数指定文字左下角的坐标，显示中文时必须加一个偏移量，否则获取像素不全？

        // 通过 ImageData 对象将数字对应的文本字符转换为相应的坐标点信息，并将其保存到数组中
        let data = ctx.getImageData(0, 0, real_width, real_height).data
        // getImageData() 方法前两个参数是开始复制的位置，后两个参数是复制区域的宽高，该方法返回一个 ImageData 对象
        // ImageData 对象不是图像，它指定了画布上的一个部分（矩形），并保存了该矩形内每个像素的信息
        // 对于 ImageData 对象中的每个像素，都存在着四方面的信息，即 RGBA 值，这些信息以数组形式按顺序存储于 ImageData 对象的 data 属性中
        let len = data.length           // 共 len/4 个像素点（透明 + 不透明）
        let finalPos = []               // 存放最终不透明的所有像素点相对于画布中心的极坐标位置
        // 通过判断对应的像素点是否透明（即通过读取 RGBA 中的 A 值）来决定是否把 该像素点的坐标 写入数组
        for (let j=0; j<len/4; j++){    // j 表示这是所有像素点中的第几个，j % real_width 和 j / real_width 表示该像素点位于原像素区域的相对位置，即第几行第几列
            if (data[j*4+3] != 0) {     // data[j*4+3] 表示第 j 个像素点的 A 值，data 数组中每四个值表示一个像素点的信息，这四个值依次为 RGBA
                // let x = (j % real_width | 0) * 20 + (canvas.width - real_width * 20) / 2      // 将获取到的坐标放大（放大操作刚好产生了有间隔的点阵效果）
                // let y = (j / real_width | 0) * 20 + (canvas.height - real_height * 20) / 2    // 并挪到画面的中央
                let x = (j % real_width | 0) * 5 + (canvas.width - real_width * 5) / 2      // 将获取到的坐标放大（放大操作刚好产生了有间隔的点阵效果）
                let y = (j / real_width | 0) * 5 + (canvas.height - real_height * 6) / 2    // 并挪到画面的中央
                // real_width * 20 是新字符像素区域一行的总宽度，加上 (canvas.width - real_width * 20) / 2 的偏移值就画面居中了
                // 以上得到的 x 和 y 就是最终该像素（也就是表示它的粒子）的直角坐标位置

                // 接下来将该 相对于画布左上角的直角坐标 转换为 相对画布中心的极坐标 ，以传入该粒子的构造函数中，作为其最终位置参数
                // Math.atan2() 返回从原点(0,0) 到 (x,y) 点的线段与 x 轴正方向之间的平面角度(弧度值)
                // 两个全等三角形，分别是以 (0,0)-(该 atan2 方法参数中的点) 和 (x,y)-(画布中心点) 为斜边的两个直角三角形
                let target_d = Math.atan2(      // 得到该点 (x,y) 与画布中心点的连线相对于 x 轴正方向的度数
                    (canvas.height / 2 - y),
                    (canvas.width / 2 - x)
                ) + Math.PI
                let target_r = Math.sqrt(       // 通过两直角边得到斜边长度，即该点与画布中心点的距离
                    Math.pow((canvas.width / 2 - x), 2) + 
                    Math.pow((canvas.height / 2 - y), 2)
                )
                finalPos.push([target_d,target_r])          // 每次循环 finalPos 都收集表示当前数字字符的所有不透明像素点的极坐标位置
            }
        }
        numbers.push(finalPos)                              // numbers 数组用来收集所有数字的像素点位置数组
        ctx.clearRect(0,0,real_width,real_height)           // 每处理完一个数字，就重置清空画布，否则所有字符都会叠加在一起，影响后序字符处理
    }
}

function initParticles(index) {                   // 初始化某个字符的所有像素点（即粒子）
    for (let particle of numbers[index]) {          // numbers[index] 里面是单个字符的全部像素点，每次取其中一个像素点
        particles.push(new Particle(particle[0],particle[1]))       // 用该像素点的位置信息初始化对应粒子，并加入到粒子数组中
    }
}

function animation() {
    if (count == 0) {               // 当倒计时为 0 时，切换显示下一个字符
        particles = []              // 清空当前粒子数组
        initParticles(index)        // 将用来显示新字符的粒子塞入粒子数组
        time = times[index]
    }

    // 半透明覆盖制作拖尾效果（此处取消了拖尾，因为实际上会留下一些之前运动的痕迹，还挺明显的）
    ctx.fillStyle = "rgba(37, 37, 45, 1)"                // 每次更新粒子位置的间隙插入一个黑色的覆盖层
    ctx.fillRect(0, 0, canvas.width, canvas.height)     // 绘制图形的合成的默认设置是将新图像覆盖在原有图像上

    for (let particle of particles) {       // 更新每个粒子的位置，执行 animation() 的频率就是更新粒子的频率
        particle.update();
        particle.draw();                    
    }
}

initNumbers()       // 初始化所有字符的像素粒子

setInterval(function (){
    animation()
    count++
    if (count == time) {
        count = 0
        index++
        if (index == 9) {
            index = 0
        }
    }
}, 1000 / time)          // 1 秒执行 120 次更新动画，也就是 120 帧每秒