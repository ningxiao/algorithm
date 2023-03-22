import {
    Grid
} from './utils/grid.js';
import {
    dataSource,
    columns
} from './modules/index.js';
import createTree from './utils/tree.js';
let isTree = false;
const createGrid = () => {
    const grid = new Grid({
        columns,
        data: dataSource,
        height: 516
    });
    grid.render(document.getElementById('grid'));
};
const createG6 = () => {
    const container = document.getElementById('container');
    const width = container.scrollWidth;
    const height = container.scrollHeight || 500;
    const data = createTree(columns, dataSource);
    const graph = new G6.TreeGraph({
        container: 'container',
        width,
        height,
        linkCenter: true,
        modes: {
            default: [{
                type: 'collapse-expand',
                onChange: (item, collapsed) => {
                    const data = item.get('model');
                    data.collapsed = collapsed;
                    return true;
                },
            },
                'drag-canvas',
            ],
        },
        defaultNode: {
            size: 30,
            anchorPoints: [
                [0, 0.5],
                [1, 0.5]
            ],
        },
        defaultEdge: {
            type: 'cubic-vertical',
        },
        layout: {
            type: 'dendrogram',
            direction: 'TB', // H / V / LR / RL / TB / BT
            nodeSep: 50,
            rankSep: 80,
        },
    });
    graph.node((node) => {
        let rotate = 0;
        let position = 'right';
        let label = node.id;
        if (!node.children) {
            position = 'bottom';
            rotate = Math.PI / 2;
            label = `${node.id}（${node.isOpen ? '打球' : '不打球'}）`;
        }
        return {
            label,
            labelCfg: {
                position,
                offset: 5,
                style: {
                    rotate,
                    textAlign: 'start',
                },
            },
        };
    });
    graph.data(data);
    graph.render();
    graph.fitView();
    window.onresize = () => {
        if (!graph || graph.get('destroyed')) return;
        if (!container || !container.scrollWidth || !container.scrollHeight) return;
        graph.changeSize(container.scrollWidth, container.scrollHeight);
    };
};
createGrid();
document.querySelector('#create_tree').addEventListener('click', (ev) => {
    const el = document.querySelector('#verify_data');
    ev.target.disabled = true;
    if (!isTree) {
        createG6();
        el.disabled = false;
        el.addEventListener('click', () => {

        });
        isTree = true;
    }
});
