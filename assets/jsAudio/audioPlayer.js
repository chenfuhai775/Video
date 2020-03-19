let m_strLocalJsPath = document.scripts;
m_strLocalJsPath = m_strLocalJsPath[m_strLocalJsPath.length - 1].src.substring(0, m_strLocalJsPath[m_strLocalJsPath.length - 1].src.lastIndexOf("/") + 1);

class audioPlayer {
    constructor() {
        this.recorder = null;
        this.wsWorker = null;
        this.avCore = null;
        this.cacheBuffer = null;
        this.chunkSize = 1024 * 1024 * 10;
        this.pcmPlayer = null;
        this.videoCallback = null;
        this.audioCallback = null;
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
                encoderPath: m_strLocalJsPath + "alawEncoder.js",
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
            this.initPcmPlay();
            this.initAudioPlay();
            let url = 'ws://' + g_oCommon.m_szHostName + ':8083/';
            let req = {
                t: kReqAvStream,
                u: url,
                c: 0,
                s: 1,
                p: 2,
                d: new Date().Format("yyyy-MM-dd")
            };
            this.wsWorker.postMessage(req);
        }
    }

    //发送语言
    sendTalkData(typedArray) {
        var strLen = this.padStr(typedArray.length, 4);
        var arrBuffer = new Uint8Array(8 + typedArray.length);
        var nIndex = 0;

        arrBuffer[nIndex++] = 0x55;
        arrBuffer[nIndex++] = 0xaa;
        arrBuffer[nIndex++] = typedArray.length;
        nIndex++;
        arrBuffer[nIndex++] = 0x00;
        arrBuffer[nIndex++] = 0x00;
        arrBuffer[nIndex++] = 0x08;
        arrBuffer[nIndex++] = 0x90;
        for (let j = 0; j < typedArray.length; j++) {
            arrBuffer[nIndex++] = typedArray[j];
        }
        let dataBlob = new Blob([arrBuffer], {type: 'audio/wav'});
        let req = {
            t: kSendAudioData,
            d: dataBlob
        };
        this.wsWorker.postMessage(req);
    }

    //启websocket线程
    initWsWorker() {
        let self = this;
        this.wsWorker = new Worker("assets/jsVideo/websocket.js");
        this.wsWorker.onmessage = function (evt) {
            let objData = evt.data;
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

    //初始化编解码器,给回调函数
    onReqAvStreamRsp() {
        let self = this;
        let ret = -1;
        let chn = 1;
        this.avCore = new Module.CAvCore();
        this.videoCallback = Module.addFunction(function (chn, buff, size, timestamp, videoWidth, videoHeight) {
            let outArray = Module.HEAPU8.subarray(buff, buff + size);
            let data = new Uint8Array(outArray);
        });
        this.audioCallback = Module.addFunction(function (chn, buff, size) {
            let outArray = Module.HEAPU8.subarray(buff, buff + size);
            let data = new Uint8Array(outArray);
            self.pcmPlayer.play(new Uint8Array(data));
            // var objData = {
            //     t: kAudioFrame,
            //     d: data,
            //     chn: chn
            // };
            // console.log("this.audioCallback[0]----");
            // self.postMessage(objData, [objData.d.buffer]);
        });
        ret = self.avCore.InitCb(chn, this.videoCallback, this.audioCallback);
        if (self.cacheBuffer != null) {
            Module._free(this.cacheBuffer);
            this.cacheBuffer = null;
        }
        if (null == self.cacheBuffer) {
            console.log("initDecoder this.chunkSize = %s " + self.chunkSize);
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