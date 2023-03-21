const OFF_SET_POINTS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
/**
 * 切比雪夫距离（Chebyshev distance）
 * 数学上，切比雪夫距离是将2个点之间的距离定义为其各坐标数值差的最大值。
 * @param {*} node
 * @param {*} goal
 * @returns
 */
const numpySum = (node, goal) => {
    const dx = Math.abs(node.x - goal.x);
    const dy = Math.abs(node.y - goal.y);
    return Math.max(dx, dy);
}
/**
 * 欧氏距离
 * 欧式距离是我们在直角坐标系中最常用的距离量算方法，例如小时候学的“两点之间的最短距离是连接两点的直线距离。”这就是典型的欧式距离量算方法。
 * 通常这这个距离的获取是基于我们熟悉的“勾股定理”，解算三角形斜边得到的。
 * @param {*} node
 * @param {*} goal
 * @param {*} weights
 * @returns
 */
const euclidean = (node, goal, weights = 1) => {
    return weights * Math.round(10 * Math.sqrt(Math.pow(node.x - goal.x, 2) + Math.pow(node.y - goal.y, 2)));
};
/**
 * 曼哈顿距离是与欧式距离不同的一种丈量方法，两点之间的距离不再是直线距离，而是投影到坐标轴的长度之和。
 * @param {*} node
 * @param {*} goal
 * @returns
 */
const manhattan = (node, goal) => {
    const dx = Math.abs(node.x - goal.x);
    const dy = Math.abs(node.y - goal.y);
    return dx + dy;
};

export const makeId = (x, y) => `${x}-${y}`;
export const getMinNode = (openList) => {//获取最佳节点
    let node;
    let min = 0;
    let maxF = openList[0].f;
    const size = openList.length;
    for (let i = 1; i < size; i++) {
        node = openList[i];
        if (node.f < maxF) {
            min = i;
            maxF = node.f;
        }
    }
    [node, openList[min]] = [openList[min], openList[size - 1]];
    openList.pop();
    return node;
};
export const getPoints = (maps, node) => {
    const points = [];
    const { x, y } = node;
    OFF_SET_POINTS.forEach(([dx, dy] = vo) => {
        const row = x + dx;
        const column = y + dy;
        if (maps[row] && maps[row][column] === 0) {
            points.push([row, column]);
        }
    });
    return points;
};
export const getAllPaths = (node) => {//获取完整路径
    const nodes = [];
    do {
        nodes.push(node);
    } while (node = node.p);
    return nodes.reverse();
};
export const costCalculation = (node, goal, type = false) => {
    switch (type) {
        case 'manhattan':
            return manhattan(node, goal);
        case 'euclidean':
            return euclidean(node, goal);
        default:
            return numpySum(node, goal);
    }
}

