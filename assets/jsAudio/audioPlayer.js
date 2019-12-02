class audioPlayer {
    constructor() {
        this.recorder = null;
        this.wsWorker = null;
        this.avCore = null;
        this.cacheBuffer = null;
        this.chunkSize = 1024 * 1024 * 10;
        this.pcmPlayer = null;
        this.audioTimeOffset = 0;
    }

    initPcmPlay() {
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
                    console.info("Unsupported audio sampleFmt " + sampleFmt + "!");
            }
            console.info("Audio encoding " + encoding + ".");
            this.pcmPlayer = new PCMPlayer({
                encoding: encoding,
                channels: channels,
                sampleRate: sampleRate,
                flushingTime: 5000
            });

            this.audioTimeOffset = this.pcmPlayer.getTimestamp();
        }
    }
    //初始化语言控件
    initAudioPlay() {
        if (!Recorder.isRecordingSupported()) {
            this.reportPlayError(0, 0, "Recording features are not supported in your browser.");
            return;
        }
        //创建连接
        this.initWsWorker();
        //创建获取语言设备信息
        if (this.recorder == null) {
            this.sendTalkDatacallback = this.sendTalkData;
            this.recorder = new Recorder(this, {
                monitorGain: 0,
                recordingGain: 1,
                numberOfChannels: 1,
                wavBitDepth: 16,
                encoderPath: m_strJsPath + "alawEncoder.js",
                encoderSampleRate: 8000
            });
            this.recorder.ondataavailable = function (typedArray) {
                this.sendTalkDatacallback.sendTalkData(typedArray);
            };
        }
        this.recorder.start().catch(function (e) {
            console.log('Error :', e.message);
        });
    }
    //停止语音
    stop() {
        if (null != this.pcmPlayer) {
            if (null != this.recorder)
                this.recorder.stop();
            this.pcmPlayer.destroy();
            this.pcmPlayer = null;
            let req = {
                t: kStopVideoReq,
                chn: 0,
                stream: 1
            };
            console.info("Initializing decoder...");
            this.wsWorker.postMessage(req);
        }
    }
    //开始语音
    start() {
        if (null == this.pcmPlayer) {
            // let url = 'ws://' + g_oCommon.m_szHostName + ':8083/';
            // let req = {
            //     t: kReqAvStream,
            //     u: url,
            //     c: 0,
            //     s: 1,
            //     p: 1,
            //     d: "2019-12-12"
            // };
            // this.wsWorker.postMessage(req);
            this.initPcmPlay();
            this.initAudioPlay();
        }
    }
    //发送语言
    sendTalkData(typedArray) {
        var strLen = this.padStr(typedArray.length, 4);
        var arrBuffer = new Uint8Array(8 + typedArray.length);
        var nIndex = 0;
        var a = 0xaa55;
        arrBuffer[nIndex++] = 0x55;
        arrBuffer[nIndex++] = 0xaa;
        arrBuffer[nIndex++] = typedArray.length;
        arrBuffer[nIndex++] = 0x00;
        arrBuffer[nIndex++] = 0x08;
        arrBuffer[nIndex++] = 0x90;
        arrBuffer[nIndex++] = 0x00;
        arrBuffer[nIndex++] = 0x00;
        for (var j = 0; j < typedArray.length; j++) {
            arrBuffer[nIndex++] = typedArray[j];
        }
        let dataBlob = new Blob([arrBuffer], {type: 'audio/wav'});
    }
    //启websocket线程
    initWsWorker() {
        this.wsWorker = new Worker("assets/jsVideo/websocket.js");
        this.wsWorker.onmessage = function (evt) {
            let objData = evt.data;
            switch (objData.t) {
                case kReqAvStreamRsp:
                    this.onReqAvStreamRsp();
                    break;
                case kRecvAvData:
                    this.onRecvAvData(objData.d);
                    break;
            }
        };
    }
    //初始化编解码器,给回调函数
    onReqAvStreamRsp() {
        let ret = -1;
        let avCore = new Module.CAvCore();
        this.audioCallback = Module.addFunction(function (chn, buff, size) {
            var outArray = Module.HEAPU8.subarray(buff, buff + size);
            var data = new Uint8Array(outArray);

            this.pcmPlayer.play(new Uint8Array(data.d));

            // var objData = {
            //     t: kAudioFrame,
            //     d: data,
            //     chn: chn
            // };
            // console.log("this.audioCallback[0]----");
            // self.postMessage(objData, [objData.d.buffer]);
        });
        ret = avCore.InitCb(chn, this.videoCallback, this.audioCallback);
        console.log("case 0: ret = %s", ret);

        if (this.cacheBuffer != null) {
            Module._free(this.cacheBuffer);
            this.cacheBuffer = null;
        }

        if (null == this.cacheBuffer) {
            console.log("initDecoder this.chunkSize = %s " + this.chunkSize);
            this.cacheBuffer = Module._malloc(this.chunkSize);
        }

    }
    //收到数据
    onRecvAvData(data) {
        let typedArray = new Uint8Array(data);
        Module.HEAPU8.set(typedArray, this.cacheBuffer);
        ///console.log("sendData =========this.cacheBuffer = %s", this.cacheBuffer[chn]);
        this.avCore.PushAvData(this.cacheBuffer, typedArray.length);
    }
    //编码
    padStr(num, n) {
        var len = num.toString().length;
        while (len < n) {
            num = "0" + num;
            len++;
        }
        return num;
    }
}