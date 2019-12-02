//"use strict";

var AudioContext = window.AudioContext || window.webkitAudioContext;

// Constructor
class Recorder {
  constructor(cb, config) {
    if (!Recorder.isRecordingSupported()) {
      throw new Error("Recording is not supported in this browser");
    }
    if (!config)
      config = {};
    this.state = "inactive";
    this.config = Object.assign({
      bufferLength: 4096,
      encoderApplication: 2049,
      encoderFrameSize: 20,
      encoderPath: 'waveWorker.min.js',
      encoderSampleRate: 8000,
      maxFramesPerPage: 40,
      mediaTrackConstraints: true,
      monitorGain: 0,
      numberOfChannels: 1,
      recordingGain: 1,
      resampleQuality: 3,
      streamPages: false,
      reuseWorker: false,
      wavBitDepth: 16,
    }, config);
    this.encodedSamplePosition = 0;
    this.sendTalkDatacallback = cb;
  }
  // Instance Methods
  clearStream() {
    if (this.stream) {
      if (this.stream.getTracks) {
        this.stream.getTracks().forEach(function (track) {
          track.stop();
        });
      }
      else {
        this.stream.stop();
      }
      delete this.stream;
    }
    if (this.audioContext && this.closeAudioContext) {
      this.audioContext.close();
      delete this.audioContext;
    }
  }
  encodeBuffers(inputBuffer) {
    if (this.state === "recording") {
      var buffers = [];
      for (var i = 0; i < inputBuffer.numberOfChannels; i++) {
        buffers[i] = inputBuffer.getChannelData(i);
      }
      if (this.encoder)
        this.encoder.postMessage({
          command: "encode",
          buffers: buffers
        });
    }
  }
  initAudioContext(sourceNode) {
    if (sourceNode && sourceNode.context) {
      this.audioContext = sourceNode.context;
      this.closeAudioContext = false;
    }
    else {
      this.audioContext = new AudioContext();
      this.closeAudioContext = true;
    }
    return this.audioContext;
  }
  initAudioGraph() {
    // First buffer can contain old data. Don't encode it.
    this.encodeBuffers = function () {
      delete this.encodeBuffers;
    };
    this.scriptProcessorNode = this.audioContext.createScriptProcessor(this.config.bufferLength, this.config.numberOfChannels, this.config.numberOfChannels);
    this.scriptProcessorNode.connect(this.audioContext.destination);
    this.scriptProcessorNode.onaudioprocess = (e) => {
      this.encodeBuffers(e.inputBuffer);
    };
    this.monitorGainNode = this.audioContext.createGain();
    this.setMonitorGain(this.config.monitorGain);
    this.monitorGainNode.connect(this.audioContext.destination);
    this.recordingGainNode = this.audioContext.createGain();
    this.setRecordingGain(this.config.recordingGain);
    this.recordingGainNode.connect(this.scriptProcessorNode);
  }
  initSourceNode(sourceNode) {
    if (sourceNode && sourceNode.context) {
      return window.Promise.resolve(sourceNode);
    }
    return window.navigator.mediaDevices.getUserMedia({ audio: this.config.mediaTrackConstraints }).then((stream) => {
      this.stream = stream;
      return this.audioContext.createMediaStreamSource(stream);
    });
  }
  loadWorker() {
    if (!this.encoder) {
      this.encoder = new window.Worker(this.config.encoderPath);
    }
  }
  initWorker() {
    var onPage = (this.config.streamPages ? this.streamPage : this.storePage).bind(this);
    this.loadWorker();
    return new Promise((resolve, reject) => {
      var callback = (e) => {
        switch (e['data']['message']) {
          case 'ready':
            resolve();
            break;
          case 'page':
            this.encodedSamplePosition = e['data']['samplePosition'];
            onPage(e['data']['page']);
            break;          
          case 'download':
            onPage(e['data']['d']);
            break;
        }
      };
      this.encoder.addEventListener("message", callback);
      this.encoder.postMessage(Object.assign({
        command: 'init',
        originalSampleRate: this.audioContext.sampleRate,
        wavSampleRate: this.audioContext.sampleRate
      }, this.config));
    });
  } 
  setRecordingGain(gain) {
    this.config.recordingGain = gain;
    if (this.recordingGainNode && this.audioContext) {
      this.recordingGainNode.gain.setTargetAtTime(gain, this.audioContext.currentTime, 0.01);
    }
  }
  setMonitorGain(gain) {
    this.config.monitorGain = gain;
    if (this.monitorGainNode && this.audioContext) {
      this.monitorGainNode.gain.setTargetAtTime(gain, this.audioContext.currentTime, 0.01);
    }
  }
  async start(sourceNode) {
    if (this.state === "inactive") {
      this.initAudioContext(sourceNode);
      this.initAudioGraph();
      this.encodedSamplePosition = 0;
      const results = await Promise.all([this.initSourceNode(sourceNode), this.initWorker()]);
      this.sourceNode = results[0];
      this.state = "recording";
      this.onstart();
      this.sourceNode.connect(this.monitorGainNode);
      this.sourceNode.connect(this.recordingGainNode);
    }
  }
  stop() {
    if (this.state !== "inactive") {
      this.state = "inactive";
      this.monitorGainNode.disconnect();
      this.scriptProcessorNode.disconnect();
      this.recordingGainNode.disconnect();
      this.sourceNode.disconnect();
      this.clearStream(); 
      this.encoder.terminate();
      this.encoder = null;
    }
    return Promise.resolve();
  }
  destroyWorker() {
    if (this.state === "inactive") {
      if (this.encoder) {
        this.encoder.postMessage({ command: "close" });
        delete this.encoder;
      }
    }
  }
  storePage(page) {
    this.ondataavailable(page);
  }
  streamPage(page) {
    this.ondataavailable(page);
  }
  // Callback Handlers
  ondataavailable() { }
  onpause() { }
  onresume() { }
  onstart() { }
  onstop() { }
  // Static Methods
  static isRecordingSupported() {
    return AudioContext && window.navigator && window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia && window.WebAssembly;
  }
}