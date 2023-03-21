class DrawMap extends EventTarget {
    #el;
    #ctx;
    #row;
    #maps;
    #column;
    #hSize;
    #wSize;
    #canvas;
    #gameBitmap;
    #workerOffscreencanvas;
    #nodes = [];
    #dpr = window.devicePixelRatio;
    static OFFSET_WIDTH = 650;
    static OFFSET_HEIGHT = 650;
    static MY_EVENT_CALCULATE_POINTS = 'my_event_calculate_points';
    constructor(el, maps) {
        super();
        const {
            OFFSET_WIDTH,
            OFFSET_HEIGHT
        } = DrawMap;
        this.#el = el;
        this.#maps = maps;
        this.#canvas = document.createElement('canvas');
        this.#canvas.style.cssText = `width: ${OFFSET_WIDTH}px;height: ${OFFSET_HEIGHT}px;background-size: 100% 100%;cursor:pointer`;
        this.#el.appendChild(this.#canvas);
        this.#ctx = this.#canvas.getContext('2d');
        this.#canvas.width = OFFSET_WIDTH * this.#dpr;
        this.#canvas.height = OFFSET_HEIGHT * this.#dpr;
        this.#ctx.scale(this.#dpr, this.#dpr);
        this.#row = this.#maps.length; // 行
        this.#column = this.#maps[0].length; // 列
        this.#hSize = OFFSET_HEIGHT / this.#row;
        this.#wSize = OFFSET_WIDTH / this.#column;
        this.#initOffscreencanvas();
        this.#gameLayout();
        this.#calculate();
    }
    #isObstacle(x, y) {
        return this.#maps[parseInt(x / this.#wSize)][parseInt(y / this.#hSize)] === 1;
    }
    #drawFillRect(x, y) {
        this.#ctx.fillRect(x * this.#wSize + 1, y * this.#hSize + 1, this.#wSize - 1, this.#hSize - 1);
    }
    #drawStartEnd(x, y) {
        const row = parseInt(x / this.#wSize);
        const column = parseInt(y / this.#hSize);
        this.#ctx.fillStyle = '#000000';
        this.#drawFillRect(row, column);
        return {
            x: row,
            y: column
        }
    }
    #calculate() {
        const {
            OFFSET_WIDTH,
            OFFSET_HEIGHT
        } = DrawMap;
        this.#canvas.addEventListener('click', ev => {
            ev.preventDefault();
            const {
                offsetX,
                offsetY
            } = ev;
            if (!this.#isObstacle(offsetX, offsetY)) {
                if (this.#nodes.length === 0) { // 第二次开始寻路清理地图
                    this.#ctx.clearRect(0, 0, OFFSET_WIDTH, OFFSET_HEIGHT);
                    // this.#ctx.drawImage(this.#gameBitmap, 0, 0, OFFSET_WIDTH, OFFSET_HEIGHT);
                }
                this.#nodes.push(this.#drawStartEnd(offsetX, offsetY));
                if (this.#nodes.length > 1) {
                    const [start, goal] = this.#nodes;
                    this.dispatchEvent(new CustomEvent(DrawMap.MY_EVENT_CALCULATE_POINTS, {
                        detail: {
                            start,
                            goal
                        }
                    }))
                    this.#nodes.length = 0;
                };
            }
        });
        this.#canvas.addEventListener('mousemove', ev => {
            ev.preventDefault();
            let cursor = 'pointer';
            if (this.#isObstacle(ev.offsetX, ev.offsetY)) {
                cursor = 'auto';
            }
            this.#canvas.style.cursor = cursor;
        });
    }
    #initOffscreencanvas() {
        const {
            OFFSET_WIDTH,
            OFFSET_HEIGHT
        } = DrawMap;
        this.#workerOffscreencanvas = new Worker("./src/workers/offscreencanvas.js");
        this.#workerOffscreencanvas.addEventListener('message', (ev) => {
            const { type, bitmap } = ev.data;
            if (type === 'commit') {
                this.#gameBitmap = bitmap;
                this.#ctx.drawImage(this.#gameBitmap, 0, 0, OFFSET_WIDTH, OFFSET_HEIGHT);
                this.#canvas.toBlob(blob => { // 使用二进制地址 清理URL.revokeObjectURL(url);
                    this.#canvas.style.backgroundImage = `url(${URL.createObjectURL(blob)})`;
                    window.requestAnimationFrame(() => {
                        this.#ctx.clearRect(0, 0, OFFSET_WIDTH, OFFSET_HEIGHT);
                    });
                });
            }
        });
    }
    #gameLayout() {
        this.#workerOffscreencanvas.postMessage(
            {
                maps: this.#maps,
                dpr: this.#dpr,
                row: this.#row,
                column: this.#column,
                width: DrawMap.OFFSET_WIDTH,
                height: DrawMap.OFFSET_HEIGHT
            }
        );
    }
    drawPaths(data) {
        let index = 0;
        const [nodes, paths] = data;
        const size = paths.length - 1;
        const drawRect = () => {
            const {
                x,
                y
            } = paths[index];
            this.#ctx.fillStyle = '#00ffba'; //FF0000
            if (index === 0 || index === size) {
                this.#ctx.fillStyle = '#000000';
            }
            this.#drawFillRect(x, y);
            if (index !== size) {
                index++;
                window.requestAnimationFrame(drawRect);
            }
        }
        window.requestAnimationFrame(() => {
            this.#ctx.fillStyle = '#FF0000';
            nodes.forEach(node => {
                const {
                    x,
                    y
                } = node;
                this.#drawFillRect(x, y);
            });
            window.requestIdleCallback(drawRect);
        });
    }
};
export default DrawMap;
