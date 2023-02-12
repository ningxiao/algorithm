### 1 背景
### 2 简介
* 布隆过滤器（Bloom Filter）它实际上是一个很长的二进制向量和一系列随机映射函数，布隆过滤器可以用于检索一个元素是否在一个集合中。
* 对比传统 List、Set、Map 等数据结构，它更高效、占用空间更少。但布隆过滤器可以检查值 **"可能存在集合中"** 或者 **"绝对不在集合中"**。而这个 **"可能"** 表示有一定的概率，也就是说它会一定的误判率。
### 3 实现原理
* **HashMap问题**
讲述布隆过滤器的原理之前，我们先思考一下，通常你判断某个元素是否存在用的是什么？应该蛮多人回答 HashMap 吧，确实可以将值映射到 HashMap 的 Key，然后可以在 O(1) 的时间复杂度内返回结果，效率奇高。但是 HashMap 的实现也有缺点，例如存储容量占比高，考虑到负载因子的存在，通常空间是不能被用满的，而一旦你的值很多例如上亿的时候，那 HashMap 占据的内存大小就变得很可观了。
还比如说你的数据集存储在远程服务器上，本地服务接受输入，而数据集非常大不可能一次性读进内存构建 HashMap 的时候，也会存在问题。
* **数据结构**
布隆过滤器是一个 bit 向量或者说 bit 数组，长这样：
如果我们要映射一个值到布隆过滤器中，我们需要使用**多个不同的哈希函数**生成**多个哈希值**，并对每个生成的哈希值指向的 bit 位置 1，例如针对值 “baidu” 和三个不同的哈希函数分别生成了哈希值 1、4、7，则上图转变为：
Ok，我们现在再存一个值 “tencent”，如果哈希函数返回 3、4、8 的话，图继续变为：
值得注意的是，4 这个 bit 位由于两个值的哈希函数都返回了这个 bit 位，因此它被覆盖了。现在我们如果想查询 “dianping” 这个值是否存在，哈希函数返回了 1、5、8三个值，结果我们发现 5 这个 bit 位上的值为 0，说明没有任何一个值映射到这个 bit 位上，因此我们可以很确定地说 “dianping” 这个值不存在。而当我们需要查询 “baidu” 这个值是否存在的话，那么哈希函数必然会返回 1、4、7，然后我们检查发现这三个 bit 位上的值均为 1，那么我们可以说 “baidu” 存在了么？答案是不可以，只能是 “baidu” 这个值可能存在。
这是为什么呢？答案跟简单，因为随着增加的值越来越多，被置为 1 的 bit 位也会越来越多，这样某个值 “taobao” 即使没有被存储过，但是万一哈希函数返回的三个 bit 位都被其他值置位了 1 ，那么程序还是会判断 “taobao” 这个值存在。
* **实现代码**
```javascript
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
    constructor(bit) { //比特数组 并且全部赋值位0
        this.#bitSize = bit;
        this.#bitArray = new Uint8Array(bit);
    };
    set(index, value) {
        if (index > -1 && index < this.#bitSize) {
            this.#bitArray[index] = value;
        };
    };
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
    constructor(cap, seed) {
        //bitset容器
        this.#cap = cap;
        //哈希种子
        this.#seed = seed;
    };
    /**
     * hash函数，采用简单的加权和hash
     * @param {*} value
     * @returns
     */
    hash(value) {
        let result = 0;
        let size = value.length;
        for (let i = 0; i < size; i++) {
            result = this.#seed * result + value.codePointAt(i);
        };
        return (this.#cap - 1) & result;
    };

}
class BloomFilter {
    #bitSet;
    #hashFuns = new Set();
    static DEFAULT_SIZE = 1 << 24; //按位左移操作符后30位置补全为了其实就是生产一个大数
    static SEED_LIST = [3, 5, 7, 11, 13, 31, 37, 61];
    constructor() {
        /* 不同哈希函数的种子，一般应取质数 */
        this.#bitSet = new BitSet(BloomFilter.DEFAULT_SIZE);
        BloomFilter.SEED_LIST.forEach(seed => {
            this.#hashFuns.add(new SimpleHash(BloomFilter.DEFAULT_SIZE, seed));
        });
    };
    /**
     * 将字符串标记到bits中
     * @param {*} value
     */
    add(value) {
        this.#hashFuns.forEach(f => {
            this.#bitSet.set(f.hash(value), 1);
        });
    };
    /**
     * 判断字符串是否已经被bits标记
     * @param {*} key
     */
    contains(key) {
        if (key) {
            let result = true;
            this.#hashFuns.forEach(f => {
                result = result && this.#bitSet.get(f.hash(key));
            });
            return result;
        };
        return false;
    };
}
module.exports = BloomFilter;
```
```javascript
const BloomFilter = require('./bloomfilter');
const bloomFilter = new BloomFilter();
[
    'https://github.com/ningxiao',
    'https://github.com/liming',
    'https://github.com/zhangsan',
    'https://github.com/wangmaiz',
    'https://github.com/liergou'
].forEach(url => bloomFilter.add(url));
bloomFilter.contains();
console.log(bloomFilter.contains('https://github.com/ningxiao'));
console.log(bloomFilter.contains('https://github.com/meituan'));
console.log(bloomFilter.contains('https://github.com/ningxiao'));
```
### 4 Cellar应用
* 网页爬虫对URL去重，避免爬取相同的URL地址
* 反垃圾邮件，从数十亿个垃圾邮件列表中判断某邮箱是否垃圾邮箱
* Google Chrome 使用布隆过滤器识别恶意URL
* 解决数据缓存穿透的问题
>所谓的缓存穿透就是服务调用方每次都是查询不在缓存中的数据，这样每次服务调用都会到数据库中进行查询，如果这类请求比较多的话，就会导致数据库压力增大，这样缓存就失去了意义。


