self.importScripts("common.js");
self.importScripts("AvDecoder.js");
self.importScripts("AvCore.js");
class WSSource {
    constructor() {
        this.url = null;
        this.socket = null;
        this.param = null;
        this.stream = 1;
        this.playType = 0;
        this.decoder = null;
        this.hasInit = false;
        if (!this.decoder) {
            this.decoder = new AvDecoder();
        }
    }

    start(url, param, stream, playType, date) {
        if (null != this.socket)
            return;
        if (url != undefined)
            this.url = url;
        this.shouldAttemptReconnect = !!this.reconnectInterval;
        this.progress = 0;
        if (param != undefined)
            this.param = param;
        if (stream != undefined)
            this.stream = stream;
        if (playType != undefined)
            this.playType = playType
        if (date != undefined)
            this.date = date

        let para = this.param + "T" + this.stream;
        if (0 != this.playType)
            para += "T" + this.playType + "T" + this.date;
        this.socket = new WebSocket(this.url, para);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onerror = this.onError.bind(this);
        this.socket.onclose = this.onClose.bind(this);
    }

    stop() {
        clearTimeout(this.reconnectTimeoutId);
        this.shouldAttemptReconnect = false;
        if (this.socket) {
            this.socket.close();
            delete this.socket;
            this.socket = null;
        }
    }

    onOpen() {
    }

    onClose() {
        if (this.shouldAttemptReconnect) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = setTimeout(function () {
                this.start();
            }.bind(this), this.reconnectInterval * 1000);
        }
    }

    onError(event) {
        console.error("WebSocket error observed:", event);
    }

    sendAudioData(arrayBuffer) {
        if (null != this.socket)
            this.socket.send(arrayBuffer);
    }

    onMessage(ev) {
        let that = this;
        if (!that.hasInit) {
            that.decoder.initDecoder();
            that.hasInit = true;
        }
        // self.ws.decoder.sendData(0, 0, ev.data);
        this.decoder.sendData(ev.data);
    }
}

self.ws = new WSSource();

self.onmessage = function (evt) {
    if (!self.ws) {
        console.log("[ER] Downloader not initialized!");
        return;
    }

    let objData = evt.data;
    switch (objData.t) {
        case kReqAvStream:
            self.ws.start(objData.u, objData.c, objData.s, objData.p, objData.d);
            break;
        case kStopVideoReq:
            self.ws.stop();
            break;
        case kSendAudioData:
            self.ws.sendAudioData(objData.d);
            break;
        default:
            self.ws.logger.logError("Unsupport messsage " + objData.t);
    }
};