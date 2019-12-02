"use strict";
self.importScripts("alawmulaw.js");
var recorder;

self.recorder = null;
self.onmessage = function (e) {
  switch (e['data']['command']) {
    case 'encode':
      if (recorder) {
        recorder.record(e['data']['buffers']);
      }
      break;
    case 'init':
      recorder = new WavePCM(e['data']);
      var objData = {
        message: 'ready'
      };
      self.postMessage(objData);
      break;
    default:
    // Ignore any unknown commands and continue recieving commands
  }
};


class WavePCM {
  constructor(config) {
    var config = Object.assign({
      wavBitDepth: 16
    }, config);
    if (!config['wavSampleRate']) {
      throw new Error("wavSampleRate value is required to record. NOTE: Audio is not resampled!");
    }
    if ([8, 16, 24, 32].indexOf(config['wavBitDepth']) === -1) {
      throw new Error("Only 8, 16, 24 and 32 bits per sample are supported");
    }
    this.bitDepth = config['wavBitDepth'];
    this.sampleRate = config['wavSampleRate'];
    this.recordedBuffers = [];
    this.bytesPerSample = this.bitDepth / 8;
    this.s32MaxBufferLen = 160 * 50;
    this.audioBuffers = new Uint8Array(this.s32MaxBufferLen);//音频缓存
    this.audioBuffersLen = 0;
  }
  downSampleBuffer(buffer, rate) {
    var sampleRate = 44100;
    if (rate == sampleRate) {
      return buffer;
    }
    if (rate > sampleRate) {
      throw "downsampling rate show be smaller than original sample rate";
    }
    var sampleRateRatio = Math.round(sampleRate / rate);
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Float32Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    while (offsetResult < result.length) {
      var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      var accum = 0,
        count = 0;
      for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }
  record(buffers) {
    var interleaved = buffers[0];
    buffers[0] = this.downSampleBuffer(interleaved, 8000);//降低采样率
    var int16Buffer = new Int16Array(buffers[0].length);
    for (var i = 0, len = buffers[0].length; i < len; i++) {
      if (buffers[0][i] < 0) {
        int16Buffer[i] = 0x8000 * buffers[0][i];
      } else {
        int16Buffer[i] = 0x7FFF * buffers[0][i];
      }
    }
    var array8 = alaw.encode(int16Buffer);//pcm to alaw    
    for (var j = 0; j < array8.length; j++) {
      if (this.audioBuffersLen > this.s32MaxBufferLen)
        this.audioBuffersLen = 0;
      this.audioBuffers[this.audioBuffersLen++] = array8[j];
    }
    while (this.audioBuffersLen >= 160) {//每次取160字节传输
      var arr = new Uint8Array(4 + 160);//海斯头0x00500100+160alaw   
      var nIndex = 0;
      arr[nIndex++] = 0x00; arr[nIndex++] = 0x01; arr[nIndex++] = 0x50; arr[nIndex++] = 0x00;
      for (var j = 0; j < 160; j++)
        arr[nIndex++] = this.audioBuffers[j];
      this.audioBuffers.copyWithin(0, 160, this.audioBuffersLen - 160);
      this.audioBuffersLen -= 160;
      var objData = {
        message: 'download',
        d: arr
      };
      self.postMessage(objData, [objData.d.buffer]);
    }
  }
  saveAudioDataToFile() {
    if (this.recordedBuffers[0]) {
      var bufferLength = this.recordedBuffers[0].length;
      var dataLength = this.recordedBuffers.length * bufferLength;
      var arr = new Uint8Array(dataLength);
      for (var i = 0; i < this.recordedBuffers.length; i++) {
        arr.set(this.recordedBuffers[i], i * bufferLength);
      }
      var objData = {
        message: 'download',
        d: arr
      };
      return objData;
    }
  }
}

