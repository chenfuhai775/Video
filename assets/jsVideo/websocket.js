self.importScripts("common.js");

class WSSource {
    constructor() {
        //console.log("WSSource init ---------- \n");
        this.url = null;
        this.socket = null;
        this.callbacks = {connect: [], data: []};
        this.destination = null;
        this.reconnectInterval = 5;
        this.shouldAttemptReconnect = !!this.reconnectInterval;
        this.completed = false;
        this.established = false;
        this.progress = 0;
        this.reconnectTimeoutId = 0;
        this.onEstablishedCallback = null;
        this.onCompletedCallback = null; // Never used
        this.param = null;
        this.stream = 1;
        this.playType = 0;
        this.date = null;
    }

    connect(destination) {
        this.destination = destination;
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

    start(url, param, stream, playType, date) {
        if (null != this.socket)
            return;
        console.log("WSSource.prototype.start this.url = %s, url= %s, param = %s \n", this.url, url, param);
        if (url != undefined)
            this.url = url;
        this.shouldAttemptReconnect = !!this.reconnectInterval;
        this.progress = 0;
        this.established = false;
        if (param != undefined)
            this.param = param;
        if (stream != undefined)
            this.stream = stream;
        if (playType != undefined)
            this.playType = playType
        if (date != undefined)
            this.date = date
        console.log("WSSource.prototype.start this.url = %s, url= %s, param = %s \n", this.url, url, param);
        let para = this.param + "T" + this.stream;
        if (1 == this.playType)
            para += "T" + this.playType + "T" + this.date;
        // para += this.param + "T" + this.stream ;
        this.socket = new WebSocket(this.url, para);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onopen = this.onOpen.bind(this);
        //this.socket.onerror = this.onError.bind(this);
        this.socket.onerror = this.onClose.bind(this);
        this.socket.onclose = this.onClose.bind(this);
    }

    resume(secondsHeadroom) {
        // Nothing to do here
    }

    onOpen() {
        let objData = {
            t: kReqAvStreamRsp
        };
        self.postMessage(objData);
        this.progress = 1;
        ///if(this.param)
        ////this.socket.send(this.param);
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

    onMessage(ev) {
        let isFirstChunk = !this.established;
        this.established = true;
        if (isFirstChunk && this.onEstablishedCallback) {
            this.onEstablishedCallback(this);
        }
        let objData = {
            t: kRecvAvData,
            d: ev.data
        };
        self.postMessage(objData, [objData.d]);
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
            console.log("objData.u = %s, objData.c = %s", objData.u, objData.c);
            self.ws.start(objData.u, objData.c, objData.s, objData.p, objData.d);
            break;
        case kStopVideoReq:
            self.ws.stop();
            break;

        default:
            self.ws.logger.logError("Unsupport messsage " + objData.t);
    }
};
