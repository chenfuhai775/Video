//Decoder states.
const decoderStateIdle = 0;
const decoderStateInitializing = 1;
const decoderStateReady = 2;
const decoderStateFinished = 3;

//Player states.
const playerStateIdle = 0;
const playerStatePlaying = 1;
const playerStatePausing = 2;

//Constant.
const maxVideoFrameQueueSize = 16;
const downloadSpeedByteRateCoef = 1.5;

self.Module = {
    onRuntimeInitialized: function () {
        onWasmLoaded();
    }
};

function onWasmLoaded() {
    console.log("Wasm loaded.");
}

class Player {
    constructor() {
        this.pcmPlayer = null;
        this.canvas = null;
        this.webglPlayer = null;
        this.callback = null;

        this.duration = 0;
        this.videoWidth = 0;
        this.videoHeight = 0;
        this.yLength = 0;
        this.uvLength = 0;

        this.decoderState = decoderStateIdle;
        this.playerState = playerStateIdle;
        this.decoding = false;
        this.displaying = false;
        this.decodeInterval = 5;
        this.audioQueue = [];
        this.videoQueue = [];
        this.videoRendererTimer = null;

        this.downloadTimer = null;
        this.chunkInterval = 200;

        this.timeLabel = null;
        this.timeTrack = null;
        this.trackTimer = null;
        this.trackTimerInterval = 500;
        this.displayDuration = "00:00:00";
        this.logger = new Logger("Player");
        this.isInitDecoder = false;

        this.chnNum = 0;
        this.streamType = 1;

        this.initWsWorker();
        ///this.initAvDecodeWorker();
    }

    initWsWorker() {
        var self = this;
        this.wsWorker = new Worker("assets/jsVideo/websocket.js");
        this.wsWorker.onmessage = function (evt) {
            var objData = evt.data;
            switch (objData.t) {
                case kReqAvStreamRsp:
                    self.onReqAvStreamRsp();
                    break;
                case kRecvAvData:
                    self.onRecvAvData(objData.d);
                    break;
            }
        };
    }

    initAvDecodeWorker() {
        this.AvDecodeWorker = null;
    }

    padStr(num, n) {
        var len = num.toString().length;
        while (len < n) {
            num = "0" + num;
            len++;
        }
        return num;
    }

    initPlayer(canvas, wAvDecoder) {
        if (!canvas) {
            ret = {
                e: -2,
                m: "Canvas not set"
            };
            success = false;
            this.logger.logError("[ER] playVideo error, canvas empty.");
            return 0;
        }

        this.canvas = canvas;
        this.AvDecodeWorker = wAvDecoder;

        this.startTrackTimer();
        this.webglPlayer = new WebGLPlayer(this.canvas, {
            preserveDrawingBuffer: false
        });

        this.videoWidth = this.canvas.width;
        this.videoHeight = this.canvas.height;
        this.yLength = this.videoWidth * this.videoHeight;
        this.uvLength = (this.videoWidth / 2) * (this.videoHeight / 2);

        this.clearRenderVideoFrame();
        console.log(this.webglPlayer);
        this.initPcmPlay();
    }

    initPcmPlay(){
        if (this.pcmPlayer == null) {
            var sampleFmt = 1;
            var channels = 1;
            var sampleRate = 8000;
            var encoding = "16bitInt";
            switch (sampleFmt) {
                case 0:
                    encoding = "8bitInt";
                    break;
                case 1:
                    encoding = "16bitInt";
                    break;
                case 2:
                    encoding = "32bitInt";
                    break;
                case 3:
                    encoding = "32bitFloat";
                    break;
                default:
                    this.logger.logError("Unsupported audio sampleFmt " + sampleFmt + "!");
            }
            this.logger.logInfo("Audio encoding " + encoding + ".");
            this.pcmPlayer = new PCMPlayer({
                encoding: encoding,
                channels: channels,
                sampleRate: sampleRate,
                flushingTime: 5000
            });

            this.audioTimeOffset = this.pcmPlayer.getTimestamp();
        }
    }

    playInner(url, chn, stream, callback, playType, startDateTime) {
        this.chnNum = chn;
        this.streamType = stream;
        console.log("Play " + url + ".");
        var ret = {
            e: 0,
            m: "Success"
        };
        var success = true;
        do {
            if (this.playerState == playerStatePausing) {
                ret = this.resume();
                break;
            }
            if (this.playerState == playerStatePlaying) {
                break;
            }
            if (!url || !url.match(/^wss?:\/\//)) {
                ret = {
                    e: -1,
                    m: "Invalid url"
                };
                success = false;
                this.logger.logError("[ER] playVideo error, url empty.");
                break;
            }

            if (!this.AvDecodeWorker) {
                ret = {
                    e: -4,
                    m: "Decoder not initialized"
                };
                success = false;
                this.logger.logError("[ER] Decoder not initialized.");
                break;
            }
            if (!this.wsWorker) {
                ret = {
                    e: -3,
                    m: "Downloader not initialized"
                };
                success = false;
                this.logger.logError("[ER] Downloader not initialized.");
                break;
            }

            this.callback = callback;
            var req = {
                t: kReqAvStream,
                u: url,
                c: chn,
                s: stream,
                p: playType,
                d: startDateTime
            };
            this.wsWorker.postMessage(req);
            this.playerState = playerStatePlaying;
        } while (false);
        return ret;
    }

    stop() {
        this.logger.logInfo("Stop.");
        if (this.playerState == playerStateIdle) {
            var ret = {
                e: -1,
                m: "Not playing"
            };
            return ret;
        }
        if (this.videoRendererTimer != null) {
            clearTimeout(this.videoRendererTimer);
            this.videoRendererTimer = null;
            this.logger.logInfo("Video renderer timer stopped.");
        }
        this.stopTrackTimer();
        this.fileInfo = null;
        ////this.canvas = null;
        ///this.webglPlayer = null;
        this.clearRenderVideoFrame();
        this.callback = null;
        this.duration = 0;
        this.pixFmt = 0;
        this.videoWidth = 0;
        this.videoHeight = 0;
        this.yLength = 0;
        this.uvLength = 0;
        this.audioTimeOffset = 0;
        this.decoderState = decoderStateIdle;
        this.playerState = playerStateIdle;
        this.decoding = false;
        this.displaying = false;

        this.videoQueue = [];
        if (this.pcmPlayer) {
            this.pcmPlayer.destroy();
            this.pcmPlayer = null;
            this.logger.logInfo("Pcm Player released.");
        }
        this.logger.logInfo("Closing ws.");

        var req = {
            t: kStopVideoReq
        };
        this.wsWorker.postMessage(req);

        //this.saveAudioDataToFile();
        this.audioQueue = [];
        return ret;
    }

    fullscreen() {
        if (this.webglPlayer) {
            this.webglPlayer.fullscreen();
        }
    }

    getState() {
        return this.playerState;
    }

    setTrack(timeTrack, timeLabel) {
        this.timeTrack = timeTrack;
        this.timeLabel = timeLabel;
        if (this.timeTrack) {
            var self = this;
            this.timeTrack.onchange = function () {
                self.logger.logInfo("track " + self.timeTrack.value);
            };
        }
    }

    onReqAvStreamRsp() {
        if (this.playerState == playerStateIdle) {
            return;
        }
        this.logger.logInfo("onReqAvStreamRsp");
        if (this.isInitDecoder == false) {
            var req = {
                t: kInitDecoderReq,
                chn: this.chnNum,
                stream: this.streamType
            };
            this.logger.logInfo("Initializing decoder...");
            this.AvDecodeWorker.postMessage(req);
        }
    }

    onRecvAvData(data) {
        if (this.playerState == playerStateIdle) {
            return;
        }

        var objData = {
            t: kFeedDataReq,
            chn: this.chnNum,
            stream: this.streamType,
            d: data
        };
        this.AvDecodeWorker.postMessage(objData, [objData.d]);
    }

    onInitDecoder(objData) {
        if (objData.e == 0) {
            this.isInitDecoder = true;
            if (this.playerState == playerStateIdle) {
                return;
            }
            this.decoderState = decoderStateReady;
        } else {
            this.isInitDecoder = false;
        }
        this.logger.logInfo("Init decoder response " + objData.e + ".");
    }

    saveAudioDataToFile() {
        var buffer = new ArrayBuffer(this.audioQueue.length * 320);
        var arr = new Uint8Array(buffer);
        var index = 0;
        for (var i = 0; i < this.audioQueue.length; i++) {
            var obj = this.audioQueue.shift();
            for (var j = 0; j < obj.length; j++) {
                arr[index++] = obj[j];
            }
        }
        var data = new Blob([arr], {type: "image/png"});
        var downloadUrl = window.URL.createObjectURL(data);
        var anchor = document.createElement("a");
        anchor.href = downloadUrl;
        anchor.download = "fsdfds.png";
        anchor.click();
        window.URL.revokeObjectURL(data);
    }

    onAudioFrame(frame) {
        //this.audioQueue.push(new Uint8Array(frame.d));        
        switch (this.playerState) {
            case playerStatePlaying: //Directly display audio.
                if (null == this.pcmPlayer) {
                    this.initPcmPlay();
                }
                this.pcmPlayer.play(new Uint8Array(frame.d));
                break;
            case playerStatePausing: //Temp cache.
                this.audioQueue.push(new Uint8Array(frame.d));
                break;
            default:
        }
    }

    onVideoFrame(frame) {
        if (this.playerState == playerStateIdle) {
            return;
        }
        if (this.playerState == playerStatePlaying) {
            this.videoWidth = frame.w;
            this.videoHeight = frame.h;
            this.yLength = this.videoWidth * this.videoHeight;
            this.uvLength = (this.videoWidth / 2) * (this.videoHeight / 2);
            this.displaying = true;
            this.displayVideoFrame(frame);
        } else {
            this.logger.logInfo("onVideoFrame not ready!");
        }
    }

    displayVideoFrame(frame) {
        var audioTimestamp = this.pcmPlayer ? this.pcmPlayer.getTimestamp() - this.audioTimeOffset : 0;
        var delay = frame.s - audioTimestamp;
        var data = new Uint8Array(frame.d);
        this.renderVideoFrame(data);
    }

    renderVideoFrame(data) {
        console.log("this.videoWidth = %s, this.videoHeight = %s, this.yLength = %s, this.uvLength = %s", this.videoWidth, this.videoHeight, this.yLength, this.uvLength);
        this.webglPlayer.renderFrame(data, this.videoWidth, this.videoHeight, this.yLength, this.uvLength);
    }

    clearRenderVideoFrame() {
        var raw_data = new Uint8Array(this.videoWidth * this.videoHeight + this.videoWidth * this.videoHeight / 2);
        raw_data.fill(0x00, 0, this.videoWidth * this.videoHeight);

        raw_data.fill(0x80, this.videoWidth * this.videoHeight, this.videoWidth * this.videoHeight + this.videoWidth * this.videoHeight / 2);

        this.webglPlayer.renderFrame(raw_data, this.videoWidth, this.videoHeight, this.yLength, this.uvLength);
    }

    delayRenderVideoFrame(data, delay) {
        var self = this;
        this.videoRendererTimer = setTimeout(function () {
            self.renderVideoFrame(data);
            self.videoRendererTimer = null;
        }, delay);
    }

    startTrackTimer() {
        var self = this;
        this.trackTimer = setInterval(function () {
            self.updateTrackTime();
        }, this.trackTimerInterval);
    }

    stopTrackTimer() {
        if (this.trackTimer != null) {
            clearInterval(this.trackTimer);
            this.trackTimer = null;
        }
    }

    updateTrackTime() {
        if (this.playerState == playerStatePlaying && this.pcmPlayer) {
            var currentPlayTime = this.pcmPlayer.getTimestamp();
            if (this.timeTrack) {
                this.timeTrack.value = 1000 * currentPlayTime;
            }
            if (this.timeLabel) {
                this.timeLabel.innerHTML = this.formatTime(currentPlayTime) + "/" + this.displayDuration;
            }
        }
    }

    formatTime(s) {
        var h = Math.floor(s / 3600) < 10 ? '0' + Math.floor(s / 3600) : Math.floor(s / 3600);
        var m = Math.floor((s / 60 % 60)) < 10 ? '0' + Math.floor((s / 60 % 60)) : Math.floor((s / 60 % 60));
        var s = Math.floor((s % 60)) < 10 ? '0' + Math.floor((s % 60)) : Math.floor((s % 60));
        return h + ":" + m + ":" + s;
    }

    reportPlayError(error, status, message) {
        var e = {
            error: error || 0,
            status: status || 0,
            message: message
        };
        if (this.callback) {
            this.callback(e);
        }
    }
}




































