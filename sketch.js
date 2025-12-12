let emoji_0, emoji_64, emoji_128, emoji_192;
let uploadedImg = null; // 用于存储用户上传的图片
let processedCanvas;    // 用于存储处理后的 900x900 图像
const targetSize = 900; // 目标处理尺寸

// ---------------------------
// 1. 预加载图像资源
// ---------------------------
function preload() {
    emoji_0 = loadImage("0.png");
    emoji_64 = loadImage("64.png");
    emoji_128 = loadImage("128.png");
    emoji_192 = loadImage("192.png");
}

// ---------------------------
// 2. 设置界面
// ---------------------------
function setup() {
    // 创建一个较小的画布用于显示上传和处理结果
    createCanvas(1000, 1200);
    background(220);
    
    // 创建文件上传控件
    let fileInput = createFileInput(handleFile);
    fileInput.position(50, 50); // 调整位置
    
    // 创建保存按钮
    let saveButton = createButton('点击保存处理后的图片');
    saveButton.position(50, 100); // 调整位置
    saveButton.mousePressed(saveImage); // 绑定点击事件
    
    textAlign(CENTER, CENTER);
    textSize(24);
    text('请点击 "Browse..." 上传您的图片', width / 2, 200);
}

// ---------------------------
// 3. 处理上传的文件
// ---------------------------
function handleFile(file) {
    print(file);
    if (file.type === 'image') {
        // 创建一个 P5 图像对象
        uploadedImg = createImg(file.data, '');
        // 必须隐藏原始的 DOM 图像元素
        uploadedImg.hide();
        
        // 当图片上传成功后，立即进行处理
        processImage();
        
    } else {
        uploadedImg = null;
        text('文件类型错误，请上传图片文件', width / 2, 250);
    }
}

// ---------------------------
// 4. 图片处理核心逻辑 (在新画布上完成)
// ---------------------------
function processImage() {
    if (uploadedImg === null) return;
    
    // 创建一个临时的图形缓冲区（PGraphic）用于处理
    processedCanvas = createGraphics(targetSize, targetSize);
    processedCanvas.pixelDensity(1); 
    
    // 计算等比例缩放的尺寸
    let w, h;
    let ratio = uploadedImg.width / uploadedImg.height;
    
    if (ratio > 1) { // 宽大于高，按高度缩放，宽度超出裁剪
        h = targetSize;
        w = uploadedImg.width * (targetSize / uploadedImg.height);
    } else { // 高大于宽，按宽度缩放，高度超出裁剪
        w = targetSize;
        h = uploadedImg.height * (targetSize / uploadedImg.width);
    }

    // 绘制并缩放图片到临时画布
    // 居中裁剪逻辑：(targetSize - w) / 2 或 (targetSize - h) / 2 为负值
    processedCanvas.image(uploadedImg, (targetSize - w) / 2, (targetSize - h) / 2, w, h);
    
    // 像素处理循环
    processedCanvas.loadPixels();
    
    let grid = 10;
    let diameter = 10;
    
    // 每次处理前清空，确保只留下表情符号
    processedCanvas.background(0); 
    
    for (let y = 0; y < processedCanvas.height; y += grid + 2) {
        for (let x = 0; x < processedCanvas.width; x += grid + 2) {
            
            // 获取在原始缩放图上的像素位置
            let index = (x + y * processedCanvas.width) * 4; 
            
            // 确保索引在范围内
            if (index + 3 < processedCanvas.pixels.length) {
                // 读取 Red 分量
                let pix = processedCanvas.pixels[index]; 
                
                // 颜色分级替换
                if (pix <= 64) {
                    processedCanvas.image(emoji_0, x, y, diameter, diameter);
                } else if (pix > 64 && pix <= 128) {
                    processedCanvas.image(emoji_64, x, y, diameter, diameter);
                } else if (pix > 128 && pix <= 192) {
                    processedCanvas.image(emoji_128, x, y, diameter, diameter);
                } else if (pix > 192 && pix <= 255) {
                    processedCanvas.image(emoji_192, x, y, diameter, diameter);
                }
            }
        }
    }
    processedCanvas.updatePixels(); // 完成处理
}


// ---------------------------
// 5. 渲染和显示
// ---------------------------
function draw() {
    background(220); // 绘制主画布的背景
    
    // 渲染指导文字
    fill(0);
    textSize(20);
    text('上传图片后，处理结果将在下方显示 (900x900)', width / 2, 160);
    
    // 如果处理完成，将结果显示在主画布上
    if (processedCanvas) {
        // 将处理后的图像从 (processedCanvas) 渲染到主画布 (canvas)
        image(processedCanvas, (width - targetSize) / 2, 200); 
    }
}

// ---------------------------
// 6. 保存功能
// ---------------------------
function saveImage() {
    if (processedCanvas) {
        // p5.js 内置的 saveCanvas() 函数
        save(processedCanvas, 'emojified_image', 'png');
    } else {
        alert('请先上传图片并等待处理完成！');
    }
}