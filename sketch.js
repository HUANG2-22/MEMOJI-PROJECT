let cam;
let emoji_0, emoji_64, emoji_128, emoji_192;

// 预加载所有图像资源
function preload() {
    // 确保你的项目文件夹中存在这四个 PNG 文件
    emoji_0 = loadImage("0.png");
    emoji_64 = loadImage("64.png");
    emoji_128 = loadImage("128.png");
    emoji_192 = loadImage("192.png");
}

function setup() {
    // 创建画布，尺寸和原始 Processing 代码保持一致
    createCanvas(1920, 1080);
    
    // 初始化摄像头捕获
    // VIDEO 参数表示请求视频输入
    // ready 标志用于确保在图像加载之前不调用 cam.read()
    cam = createCapture(VIDEO);
    
    // 隐藏实际的视频元素，因为它会被用作源，而不是直接显示
    cam.hide();
    
    // 可选：如果希望画布尺寸与视频源尺寸匹配，可以使用 cam.size() 获取
    // 这里我们保持 createCanvas 的固定尺寸 1920x1080
    
    // 设置像素密度为 1，确保 loadPixels() 正常工作
    pixelDensity(1); 
}

function draw() {
    background(0);
    
    // 检查摄像头是否准备就绪，并确保它正在捕获帧
    if (cam.loadedmetadata) {
        
        // p5.js 中，通过 loadPixels() 和 updatePixels() 处理摄像头数据
        cam.loadPixels(); 
        
        let grid = 10;
        let diameter = 10;
        
        // 遍历摄像头像素，使用 cam.width/cam.height
        for (let y = 0; y < cam.height; y += grid + 2) {
            for (let x = 0; x < cam.width; x += grid + 2) {
                
                // p5.js 像素数组是 [R, G, B, A, R, G, B, A, ...] 结构
                // loc 现在是像素数组中的索引，我们需要乘以 4 (R, G, B, A)
                let index = (x + y * cam.width) * 4; 
                
                // 取 Red (红色) 分量进行灰度判断
                // cam.pixels[index] 是 R
                let pix = cam.pixels[index]; 

                // 颜色分级替换为对应的表情符号
                if (pix <= 64) {
                    image(emoji_0, x, y, diameter, diameter);
                } else if (pix > 64 && pix <= 128) {
                    image(emoji_64, x, y, diameter, diameter);
                } else if (pix > 128 && pix <= 192) {
                    image(emoji_128, x, y, diameter, diameter);
                } else if (pix > 192 && pix <= 255) {
                    image(emoji_192, x, y, diameter, diameter);
                }
            }
        }
    }
}