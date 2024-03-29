const canvas = new OffscreenCanvas(0, 0);
const ctx = canvas.getContext('2d');
self.addEventListener('message', (ev) => {
    console.time('线程绘制耗时->');
    const { dpr, maps, width, height, row, column, isBlob = false } = ev.data;
    const hSize = height / row;
    const wSize = width / column;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.beginPath();
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 1;
    ctx.moveTo(1, 1);
    ctx.lineTo(width - 1, 1);
    ctx.lineTo(width - 1, height - 1);
    ctx.lineTo(1, height - 1);
    ctx.lineTo(1, 1);
    // 生成行
    for (let i = 1; i < row; i++) {
        const y = i * hSize;
        ctx.moveTo(1, y);
        ctx.lineTo(width - 1, y);
    }
    // 生成列
    for (let i = 1; i < column; i++) {
        const x = i * wSize;
        ctx.moveTo(x, 1);
        ctx.lineTo(x, height - 1);
    }
    // 生成障碍物
    ctx.fillStyle = '#FFF000';
    for (let x = 0; x < row; x++) {
        for (let y = 0; y < column; y++) {
            if (maps[x][y] === 1) {
                ctx.fillRect(x * wSize + 1, y * hSize + 1, wSize - 1, hSize - 1);
            }
        }
    }
    ctx.stroke();
    ctx.restore(); //绘制结束以后，恢复画笔状态
    console.timeEnd('线程绘制耗时->');
    console.time('线程转blob耗时->');
    canvas.convertToBlob().then((blob) => {
        console.timeEnd('线程转blob耗时->');
        postMessage({
            type: 'commit',
            blob
        });
    });
}, false);
