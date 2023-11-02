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
