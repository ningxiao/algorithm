const assert = require('assert');
const BloomFilter = require('../src/bloomfilter');
const bloomFilter = new BloomFilter();
[
    'https://github.com/ningxiao',
    'https://github.com/liming',
    'https://github.com/zhangsan',
    'https://github.com/wangmaiz',
    'https://github.com/liergou'
].forEach(url => bloomFilter.add(url));
describe('#测试已使用URL', () => {
    it('test url https://github.com/ningxiao', done => {
        if (bloomFilter.contains('https://github.com/ningxiao')) {
            done();
        } else {
            done(new Error('过滤器存在异常'));
        }
    });
});
describe('#测试未使用URL', () => {
    it('test url https://github.com/meituan', done => {
        if (bloomFilter.contains('https://github.com/meituan')) {
            done(new Error('过滤器存在异常'));
        } else {
            done();
        }
    });
});
