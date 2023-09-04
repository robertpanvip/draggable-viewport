const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')!

export function getPathBounds(path: Path2D) {
    ctx.save();
    // 将Path2D对象绘制到临时的Canvas上
    ctx.stroke(path);
    // 获取绘制的图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

// 初始化边界框的最小和最大值
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

// 分析图像数据，找到路径的最小矩形边界框
    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];

        if (alpha > 0) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor(i / 4 / canvas.width);

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
    }

// 计算边界框的宽度和高度
    const width = maxX - minX;
    const height = maxY - minY;

// 创建边界框对象
    const bounds = {
        x: minX,
        y: minY,
        width,
        height
    };
    ctx.restore();
    return bounds
}