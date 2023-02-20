import Point from "./Point.js";
const OFF_SET_POINTS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
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
export const euclidean = (node, goal, weights = 1) => {
    return weights * Math.round(10 * Math.sqrt(Math.pow(node.x - goal.x, 2) + Math.pow(node.y - goal.y, 2)));
};
