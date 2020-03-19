let appController = function (targetObj) {
    this.targetObj = targetObj;
    this.canvas = null;
    this.glPlayer = null;
    this.videoWidth = 0;
    this.videoHeight = 0;
    this.yLength = 0;
    this.uvLength = 0;
    //通道号
    this.channelNumber = 0;
    //是否播放中
    this.isRunning = false;
    //码流 0-主,1-子
    this.stream = 1;
    //是否选中
    this.checked = false;
    //参数
    this.options = null;
    this.init(this.targetObj);
    return this;
}

appController.prototype = {
    init: function (canvas) {
        let that = this;
        that.canvas = canvas;
        that.glPlayer = new WebGLPlayer(that.canvas, {});
        that.wsWorker = new Worker("assets/jsVideo/websocket.js");
        that.wsWorker.onmessage = function (env) {
            that.onmessage(env);
        }
    },
    start: function (args) {
        let that = this;
        if (![null, undefined, ""].includes(args))
            that.options = args;
        let req = {
            t: kReqAvStream,
            u: that.options.u,
            c: that.options.c,
            s: that.options.s,
            p: null,
            d: null
        };
        that.wsWorker.postMessage(req);
        that.isRunning = true;
    },
    stop: function () {
        let that = this;
        let req = {
            t: kStopVideoReq
        };
        that.wsWorker.postMessage(req);
        that.isRunning = false;
        that.glPlayer.clearRenderVideoFrame(that.videoWidth, that.videoHeight, that.yLength, that.uvLength);
    },
    onmessage: function (evt) {
        let that = this;
        if (!this.wsWorker) {
            console.log("[ER] Downloader not initialized!");
            return;
        }
        let objData = evt.data;
        switch (objData.t) {
            case kSendAudioData:
                self.ws.sendAudioData(objData.d);
                break;
            case kVideoFrame:
                if (that.isRunning) {
                    that.videoWidth = objData.w;
                    that.videoHeight = objData.h;
                    that.yLength = that.videoWidth * that.videoHeight;
                    that.uvLength = (that.videoWidth / 2) * (that.videoHeight / 2);
                    let data = new Uint8Array(objData.d);
                    this.glPlayer.renderFrame(data, that.videoWidth, that.videoHeight, that.yLength, that.uvLength);
                }
                break;
            default:
                console.info("Unsupport messsage " + objData.t);
        }
    },
}