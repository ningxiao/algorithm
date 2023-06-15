"use strict";

var canvas = new OffscreenCanvas(0, 0);
var ctx = canvas.getContext('2d');
self.addEventListener('message', function (ev) {
  console.time('线程绘制耗时->');
  var _ev$data = ev.data,
      dpr = _ev$data.dpr,
      maps = _ev$data.maps,
      width = _ev$data.width,
      height = _ev$data.height,
      row = _ev$data.row,
      column = _ev$data.column,
      _ev$data$isBlob = _ev$data.isBlob,
      isBlob = _ev$data$isBlob === void 0 ? false : _ev$data$isBlob;
  var hSize = height / row;
  var wSize = width / column;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.beginPath();
  ctx.strokeStyle = '#CCC';
  ctx.lineWidth = 1;
  ctx.moveTo(1, 1);
  ctx.lineTo(width - 1, 1);
  ctx.lineTo(width - 1, height - 1);
  ctx.lineTo(1, height - 1);
  ctx.lineTo(1, 1); // 生成行

  for (var i = 1; i < row; i++) {
    var y = i * hSize;
    ctx.moveTo(1, y);
    ctx.lineTo(width - 1, y);
  } // 生成列


  for (var _i = 1; _i < column; _i++) {
    var x = _i * wSize;
    ctx.moveTo(x, 1);
    ctx.lineTo(x, height - 1);
  } // 生成障碍物


  ctx.fillStyle = '#FFF000';

  for (var _x = 0; _x < row; _x++) {
    for (var _y = 0; _y < column; _y++) {
      if (maps[_x][_y] === 1) {
        ctx.fillRect(_x * wSize + 1, _y * hSize + 1, wSize - 1, hSize - 1);
      }
    }
  }

  ctx.stroke();
  ctx.restore(); //绘制结束以后，恢复画笔状态

  console.timeEnd('线程绘制耗时->');
  console.time('线程转blob耗时->');
  canvas.convertToBlob().then(function (blob) {
    console.timeEnd('线程转blob耗时->');
    postMessage({
      type: 'commit',
      blob: blob
    });
  });
}, false);