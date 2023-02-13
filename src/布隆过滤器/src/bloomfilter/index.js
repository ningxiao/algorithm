/**
 * 网络爬虫：URL去重策略之布隆过滤器算法
 * 默认数据 00000000000000000000
 *
 * 当我们对每个地址的每个字符哈希之后可以对应打入到每个点上
 * 对象A哈希值为 0，5，7     10000101000000000000
 * 对象B哈希值为 2，8，13    10100101100001000000
 * 对象C哈希值为 0，4，7     10101101100001000000
 * 其实就是将要对比的值哈希之后去比特数组里面对比是否每一位都是1如果是确定被使用过
 * 但是会存在部分误差数据 因为不同的元素经过哈希之后哈希值可能发生碰撞
 */
class BitSet {
    #bitSize;
    #bitArray;
    /**
     * 生成比特数组赋值0
     * @param {*} bitSize 数组长度
     */
    constructor(bitSize) {
        this.#bitSize = bitSize;
        this.#bitArray = new Uint8Array(bitSize);
    };
    /**
     * 进行bit数据查找
     * @param {*} index 索引值
     * @param {*} value
     */
    set(index, value) {
        // 校验下标越界,也可以用this.#bitSize[index]!== undefined;
        if (index > -1 && index < this.#bitSize) {
            this.#bitArray[index] = value;
        };
    };
    /**
     * 判断当前bit位是否被占用
     * @param {*} index
     * @returns
     */
    get(index) {
        return this.#bitArray[index] === 1; // 被占用
    };
    get bitArray() {
        return this.#bitArray;
    }
    get size() {
        return this.#bitSize;
    };
}
class SimpleHash {
    #cap;
    #seed;
    /**
     * 一个简单的哈希函数
     * @param {*} cap
     * @param {*} seed
     */
    constructor(cap, seed) {
        //bitset容器
        this.#cap = cap;
        //哈希种子
        this.#seed = seed;
    };
    /**
     * hash函数，采用简单的加权和hash然后存入bit数组
     * @param {*} value
     * @returns 一个索引值
     */
    hash(value) {
        let result = 0;
        let size = value.length;
        for (let i = 0; i < size; i++) {
            // 取整 避免js精度问题出现
            result = parseInt(this.#seed * result + value.codePointAt(i));
        };
        /**
         * 避免产生越界存储 this.#cap
         * console.log(parseInt(23).toString(2),parseInt(12).toString(2),23&12,parseInt(4).toString(2));
         * 10111
         *  1100
         *   100 -> 4
         */
        return (this.#cap - 1) & result;
    };
}
class BloomFilter {
    #bitSet;
    #hashFuns = new Set();
    static DEFAULT_SIZE = 1 << 24; //按位左移操作符后30位置补全为了其实就是生产一个大数
    static SEED_LIST = [1, 3, 5, 7, 8, 11, 13, 15];        // 不同哈希函数的种子，一般应取质数
    constructor() {
        this.#bitSet = new BitSet(BloomFilter.DEFAULT_SIZE);
        // 生成8个哈希函数,同一个数据执行8次哈希并将结果存储在bit数组（8个数据）
        BloomFilter.SEED_LIST.forEach(seed => {
            this.#hashFuns.add(new SimpleHash(BloomFilter.DEFAULT_SIZE, seed));
        });
    };
    /**
     * 将字符串标记到bit数组中（进行8次哈希函数，降低误判率）
     * @param {*} value
     */
    add(value) {
        this.#hashFuns.forEach(f => {
            this.#bitSet.set(f.hash(value), 1);
        });
    };
    /**
     * 判断字符串是否已经被bit数组标记
     * @param {*} key
     */
    contains(key) {
        if (key) {
            let result = true;
            // 将8个哈希函数结果进行执行判断
            this.#hashFuns.forEach(f => {
                result = result && this.#bitSet.get(f.hash(key));
            });
            return result;
        };
        return false;
    };
}
module.exports = BloomFilter;
