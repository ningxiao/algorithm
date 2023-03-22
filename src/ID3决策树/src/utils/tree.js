const config = {
    rows: [],
    columns: [],
    allEntropy: 1,
}
/**
 * 计算信息熵
 * @param {*} data
 * @returns
 */
const calcEntropy = (data) => {
    let entropy = 0.0;
    const groupby = new Map();
    const typeSize = data.length;
    const index = data[0].length - 1;
    data.forEach(vo => {
        const type = vo[index];
        groupby.set(type, (groupby.get(type) || 0) + 1);
    });
    groupby.forEach(sum => {
        const prob = sum / typeSize;
        entropy -= prob * Math.log2(prob);
    });
    return {
        entropy,
        groupby,
        typeSize
    };
};
/**
 * 计算特征条件熵
 * @param {*} data
 * @param {*} index
 * @returns
 */
const calcSelectEntropy = (data, index) => {
    let entropys = 0.0;
    const group = new Map();
    const typeMap = new Map();
    const dataSize = data.length;
    const columnType = config.columns[index];
    data.forEach(vo => {
        const type = vo[index];
        if (!typeMap.has(type)) {
            typeMap.set(type, []);
        }
        typeMap.get(type).push(vo);
    });
    console.log('%s，属性', columnType, Array.from(typeMap.keys()));
    typeMap.forEach((value, key) => {
        const { groupby, typeSize, entropy } = calcEntropy(value);
        console.log('%s，信息熵', key, entropy);
        group.set(key, groupby);
        entropys += (typeSize / dataSize) * entropy;
    });
    console.log('%s，条件熵', columnType, entropys);
    return {
        group,
        entropys,
    };
};
/**
 * 生成ID3算法决策树
 * @param {*} columns
 * @param {*} rows
 * @param {*} tree
 * @returns
 */
const calcDecisionTree = (columns, rows, tree) => {
    let maxKey;
    let maxGroup;
    let maxGain = -1;
    let maxIndex = 0;
    const size = columns.length - 1;
    console.log(`--------------列分类`, columns.filter(vo => vo !== null), '--------------');
    //获取信息增益率最大属性（列里面的全量属性）
    for (let index = 0; index < size; index++) {
        if (columns[index]) {
            // 获取条件熵
            const { entropys, group } = calcSelectEntropy(rows, index);
            // 计算信息增益
            const gain = config.allEntropy - entropys;
            console.log('%s，信息增益', columns[index], gain);
            if (gain > maxGain) {
                maxGain = gain;
                maxGroup = group;
                maxIndex = index;
                maxKey = columns[index];
            }
        }
    }
    if (maxGroup) {
        tree.id = maxKey;
        columns[maxIndex] = null;//使用过属性进行清理
        console.log(`--------------最大信息增益`, maxKey, maxGain, '--------------');
        if (maxGroup) {
            tree.children = [];
            maxGroup.forEach((vo, key) => {
                const child = { id: key };
                console.log(key)
                if (vo.size === 1) {//结论已经单一化
                    child.isOpen = vo.has('Y');
                    console.log(`${maxKey}->结论单一化`, key);
                } else {
                    const nextChild = {};
                    child.children = [nextChild];
                    calcDecisionTree(columns, config.rows.filter(vo => vo[maxIndex] === key), nextChild);
                }
                tree.children.push(child);
            });
        }
    }
    return tree;
};
/**
 *
 * @param {*} columns
 * @param {*} rows
 * @returns
 */
const createTree = (columns, rows) => {
    const tree = {};
    // 计算数据全量集合信息熵
    Object.assign(config, {
        rows,
        columns,
        allEntropy: calcEntropy(rows).entropy
    });
    console.log('全量集合信息熵', config.allEntropy);
    return calcDecisionTree(columns, rows, {});
};
export default createTree;
