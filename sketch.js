let emoji_0, emoji_64, emoji_128, emoji_192;
let uploadedImg = null;    // 用于存储用户上传的图片对象
let processedCanvas;       // 用于存储处理后的 900x900 图像缓冲区
const targetSize = 900;    // 目标处理尺寸

// ---------------------------
// 1. 预加载图像资源
// ---------------------------
function preload() {
    // 确保你的 PNG 文件名（包括大小写）与这里完全一致
    emoji_0 = loadImage("0.png");
    emoji_64 = loadImage("64.png");
    emoji_128 = loadImage("128.png");
    emoji_192 = loadImage("192.png");
}

// ---------------------------
// 2. 设置界面 (Setup)
// ---------------------------
function setup() {
    // 创建主画布
    createCanvas(targetSize, targetSize + 200); // 900x1100，留出顶部空间放控件
    background(255);
    
    // --- 解决 CSP 问题的核心修改 ---
    // 1. 创建标准的 HTML input[type="file"] 元素
    let fileInput = createInput('', 'file');
    // 2. 设置文件过滤，只接受图片
    fileInput.attribute('accept', 'image/*');
    // 3. 绑定标准 JavaScript 的 change 事件处理器
    fileInput.elt.onchange = handleFileChange; 
    // 4. 定位输入框
    fileInput.position(width / 2 - 150, 40); // 尝试居中放置
    
    // 创建保存按钮
    let saveButton = createButton('点击保存处理后的图片');
    saveButton.mousePressed(saveImage); 
    // 定位保存按钮
    saveButton.position(width / 2 + 50, 40);
    // ---------------------------------
    
    textAlign(CENTER, CENTER);
}

// ---------------------------
// 3. 处理上传的文件 (标准 JS 事件)
// ---------------------------
function handleFileChange(event) {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            // 当文件读取完成后，创建 p5.Image 对象
            uploadedImg = createImg(e.target.result, '');
            uploadedImg.hide();
            
            // 确保图片加载完成后再处理
            uploadedImg.elt.onload = () => {
                console.log("图片加载成功，开始处理...");
                processImage();
            };
        };
        
        reader.readAsDataURL(file);

    } else {
        uploadedImg = null;
        console.error('文件类型错误，请上传图片文件');
    }
}


// ---------------------------
// 4. 图片处理核心逻辑
// ---------------------------
function processImage() {
    if (uploadedImg === null) return;
    
    // 创建图形缓冲区用于处理 (900x900)
    processedCanvas = createGraphics(targetSize, targetSize);
    processedCanvas.pixelDensity(1); 
    
    let w, h;
    let ratio = uploadedImg.width / uploadedImg.height;
    
    // 计算等比例缩放和居中裁剪
    if (ratio > 1) { // 宽大于高，按高度缩放
        h = targetSize;
        w = uploadedImg.width * (targetSize / uploadedImg.height);
    } else { // 高大于宽，按宽度缩放
        w = targetSize;
        h = uploadedImg.height * (targetSize / uploadedImg.width);
    }

    // 绘制并缩放图片到临时画布（居中裁剪）
    processedCanvas.image(uploadedImg, (targetSize - w) / 2, (targetSize - h) / 2, w, h);
    
    // 开始像素处理
    processedCanvas.loadPixels();
    
    let grid = 10;
    let diameter = 10;
    
    processedCanvas.background(0); // 处理前清空，确保只留下表情符号
    
    for (let y = 0; y < processedCanvas.height; y += grid + 2) {
        for (let x = 0; x < processedCanvas.width; x += grid + 2) {
            
            let index = (x + y * processedCanvas.width) * 4; 
            
            if (index + 3 < processedCanvas.pixels.length) {
                // 读取 Red 分量 (0-255)
                let pix = processedCanvas.pixels[index]; 
                
                // 颜色分级替换
                let emoji;
                if (pix <= 64) {
                    emoji = emoji_0;
                } else if (pix <= 128) {
                    emoji = emoji_64;
                } else if (pix <= 192) {
                    emoji = emoji_128;
                } else {
                    emoji = emoji_192;
                }
                
                processedCanvas.image(emoji, x, y, diameter, diameter);
            }
        }
    }
    processedCanvas.updatePixels(); // 完成处理
    
    // 清除 uploadedImg 元素以释放内存
    uploadedImg.remove();
    uploadedImg = null;
}


// ---------------------------
// 5. 渲染和显示 (Draw)
// ---------------------------
function draw() {
    // 绘制主画布的背景和指导文字
    background(255); 
    fill(0);
    textSize(20);
    text('上传图片后，处理结果将在下方显示 (900x900)', width / 2, 120);
    
    // 如果处理完成，将结果显示在主画布上
    if (processedCanvas) {
        // 将处理后的图像从 processedCanvas 渲染到主画布
        // 放置在顶部区域下方
        image(processedCanvas, (width - targetSize) / 2, 200); 
    }
}

// ---------------------------
// 6. 保存功能
// ---------------------------
function saveImage() {
    if (processedCanvas) {
        save(processedCanvas, 'emojified_image', 'png');
    } else {
        alert('请先上传图片并等待处理完成！');
    }
}