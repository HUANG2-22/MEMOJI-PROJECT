let emoji_0, emoji_64, emoji_128, emoji_192;
let uploadedImg = null;    
let processedCanvas;       
const targetSize = 900;    

// ---------------------------
// 纹理控制参数
// ---------------------------
const grid = 12;            // 网格间距 (决定emoji中心点的位置)
const maxDiameter = grid;   // emoji 的最大尺寸 (略小于 grid + 2，避免过度重叠)
const minDiameter = 2;      // emoji 的最小尺寸 (亮区)

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
// 2. 设置界面 (Setup)
// ---------------------------
function setup() {
    createCanvas(targetSize, targetSize + 200); 
    background(255);
    
    // 【CSP 修复】: 使用标准 JS 处理文件输入
    let fileInput = createInput('', 'file');
    fileInput.attribute('accept', 'image/*');
    fileInput.elt.onchange = handleFileChange; 
    fileInput.position(width / 2 - 150, 40); 
    fileInput.style('width', '180px'); 
    
    // 创建保存按钮
    let saveButton = createButton('点击保存处理后的图片');
    saveButton.mousePressed(saveImage); 
    saveButton.position(width / 2 + 50, 40);
    
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
            uploadedImg = createImg(e.target.result, '');
            uploadedImg.hide();
            
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
// 4. 图片处理核心逻辑 (修复了尺寸读取和像素清空问题)
// ---------------------------
function processImage() {
    if (uploadedImg === null) return;
    
    // 获取真实的图片尺寸
    const originalWidth = uploadedImg.elt.naturalWidth || uploadedImg.width;
    const originalHeight = uploadedImg.elt.naturalHeight || uploadedImg.height;

    // A. 临时画布：用于缩放和存储原始图片的像素数据 (900x900)
    let tempCanvas = createGraphics(targetSize, targetSize);
    tempCanvas.pixelDensity(1); 
    
    // B. 计算等比例缩放和居中裁剪
    let w, h;
    let ratio = originalWidth / originalHeight;

    if (ratio > 1) { 
        h = targetSize;
        w = originalWidth * (targetSize / originalHeight);
    } else { 
        w = targetSize;
        h = originalHeight * (targetSize / originalWidth);
    }

    // 绘制图片到 tempCanvas
    tempCanvas.image(uploadedImg, (targetSize - w) / 2, (targetSize - h) / 2, w, h);
    tempCanvas.loadPixels(); // 加载原图像素数据
    
    // C. 最终画布：用于绘制马赛克表情符号
    let finalCanvas = createGraphics(targetSize, targetSize);
    finalCanvas.background(255); // 使用白色背景，以便小点时能看到留白
    
    // D. 遍历原图像素并绘制表情符号
    for (let y = 0; y < tempCanvas.height; y += grid) { // 网格间距使用 grid
        for (let x = 0; x < tempCanvas.width; x += grid) { // 网格间距使用 grid
            
            let index = (x + y * tempCanvas.width) * 4; 
            
            if (index + 3 < tempCanvas.pixels.length) {
                let pix = tempCanvas.pixels[index]; // 读取 Red 像素值 (0-255)
                
                // ------------------------------------
                // *** 策略一：基于亮度的尺寸缩放 ***
                // ------------------------------------
                let currentDiameter;

                // 1. 将 0-255 反转为 255-0 (暗 -> 高值)
                let reversedPix = 255 - pix;
                
                // 2. 将反转后的值映射到 minDiameter-maxDiameter
                // 暗区 (reversedPix: 255) -> maxDiameter
                // 亮区 (reversedPix: 0)   -> minDiameter
                currentDiameter = map(reversedPix, 0, 255, minDiameter, maxDiameter);
                
                // 确保尺寸不会溢出网格
                currentDiameter = constrain(currentDiameter, minDiameter, maxDiameter);
                
                // 保持 emoji 类型基于亮度等级不变
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
                
                // 绘制到最终画布 finalCanvas 上
                // 为了让点居中，需要根据动态直径调整绘制位置
                finalCanvas.image(
                    emoji, 
                    x + (grid / 2 - currentDiameter / 2), // X 居中偏移
                    y + (grid / 2 - currentDiameter / 2), // Y 居中偏移
                    currentDiameter, 
                    currentDiameter
                );
            }
        }
    }
    
    processedCanvas = finalCanvas; 
    
    // 清除 uploadedImg 元素
    uploadedImg.remove();
    uploadedImg = null;
}


// ---------------------------
// 5. 渲染和显示 (Draw)
// ---------------------------
function draw() {
    background(255); 
    fill(0);
    textSize(20);
    text('上传图片后，处理结果将在下方显示 (900x900)', width / 2, 120);
    
    if (processedCanvas) {
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