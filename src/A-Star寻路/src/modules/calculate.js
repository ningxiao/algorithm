import Point from "./Point.js";
import { makeId, euclidean, getPoints, getMinNode, getAllPaths } from "./tools.js";
export default {
    aStarSearch: (maps, start, goal) => {
        const openList = [];
        const closedList = [];
        const tempNodeMap = new Map();
        const GOAL_ID = makeId(goal.x, goal.y) //终点的唯一值
        let minNode, tempg, tempNode;
        openList.push(new Point(null, start.x, start.y)); //追加启始点
        while (openList.length) {
            minNode = getMinNode(openList); //取最优点
            if (minNode.i !== GOAL_ID) { //若不是终点
                // 获取临接的8个点
                getPoints(maps, minNode).forEach(([x, y] = point) => {
                    const id = makeId(x, y); //获取临点ID
                    if (tempNodeMap.has(id)) { //如果存在此点
                        tempNode = tempNodeMap.get(id);
                        tempg = minNode.g + euclidean(tempNode, minNode); //计算当前点到此临点的G值
                        //如果此G值小于此临点的G值那么把这个临点抢过来。。。然后重新初始化一些参数
                        if (tempg < tempNode.g) {
                            tempNode.p = minNode;
                            tempNode.g = tempg;
                            tempNode.f = tempg + tempNode.h;
                        }
                    } else { //如果没有查过
                        //创建点对象.放到openList表.放到关联组
                        tempNode = new Point(minNode, x, y);
                        //计算代价值，估价值，总值
                        tempNode.i = id; //计算唯一标识
                        tempNode.g = minNode.g + euclidean(tempNode, minNode);
                        tempNode.h = euclidean(tempNode, goal);
                        tempNode.f = tempNode.g + tempNode.h;
                        openList.push(tempNode);
                        tempNodeMap.set(id, tempNode);
                    }
                });
                closedList.push(minNode);//放入closedList表
            } else {
                return [closedList,getAllPaths(minNode)]; //已经找到最优路径.返回完整路径
            }
        }
        return [];
    }
};
