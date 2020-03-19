class AvDecoder {
    constructor() {
        this.videoCallback = null;
        this.audioCallback = null;
        this.chunkSize = 1024 * 1024 * 20;
        this.avCore = null;
        this.stream = 1;
        this.cacheBuffer = null;
        this.tempCache = [];
        this.packageNum = 0;
    }

    initDecoder() {
        let ret = -1;
        let chn = 0;
        this.avCore = new Module.CAvCore();
        this.videoCallback = Module.addFunction(function (chn, buff, size, timestamp, videoWidth, videoHeight) {
            let outArray = Module.HEAPU8.subarray(buff, buff + size);
            let data = new Uint8Array(outArray);
            let objData = {
                t: kVideoFrame,
                s: timestamp,
                d: data,
                w: videoWidth,
                h: videoHeight
            };
            postMessage(objData, [objData.d.buffer]);
        });

        this.audioCallback = Module.addFunction(function (chn, buff, size) {
            let outArray = Module.HEAPU8.subarray(buff, buff + size);
            let data = new Uint8Array(outArray);
            let objData = {
                t: kAudioFrame,
                d: data
            };
            console.log("this.audioCallback[0]----");
            postMessage(objData, [objData.d.buffer]);
        });

        ret = this.avCore.InitCb(chn, this.videoCallback, this.audioCallback);


        if (this.cacheBuffer != null) {
            Module._free(this.cacheBuffer);
            this.cacheBuffer = null;
        }

        if (null == this.cacheBuffer) {
            console.log("initDecoder this.chunkSize = %s " + this.chunkSize);
            this.cacheBuffer = Module._malloc(this.chunkSize);
        }

        console.log("initDecoder return " + ret + ".");

    }

    uninitDecoder() {
        console.log("Uninit ffmpeg decoder return ");
        if (this.cacheBuffer != null) {
            Module._free(this.cacheBuffer);
            this.cacheBuffer = null;
        }
    }

    sendData(data) {
        if (null != this.cacheBuffer) {
            let typedArray = new Uint8Array(data);

            // Module.HEAPU8.set(typedArray, this.cacheBuffer);
            // this.avCore.PushAvData(this.cacheBuffer, typedArray.length);


            if (this.packageNum < 2) {
                this.tempCache[this.packageNum] = typedArray;
                this.packageNum++;
            } else {
                let sendArray = [];
                this.tempCache.forEach((item, index, array) => {
                    sendArray = sendArray.length == 0 ? item : [...sendArray, ...item];
                });
                sendArray = [...sendArray, ...typedArray];
                let sendTemp = [];
                let length = 100000;
                let k = 0;
                for (let i = 0; i < sendArray.length; i++) {
                    sendTemp[k] = sendArray[i];
                    k++;
                    if ((i % length == 0 && 0 != i) || i == (sendArray.length - 1)) {
                        this.cacheBuffer = Module._malloc(sendTemp.length);
                        Module.HEAPU8.set(sendTemp, this.cacheBuffer);
                        this.avCore.PushAvData(this.cacheBuffer, sendTemp.length);
                        this.packageNum = 0;
                        Module._free(this.cacheBuffer);
                        k = 0;
                        sendTemp.length = 0;
                    }
                }
                sendArray.length = 0;
                this.packageNum= 0;
            }


            // if (this.packageNum < 3)
            // {
            //     this.tempCache[this.packageNum] = typedArray;
            //     this.packageNum++;
            // }
            // else {
            //     let sendArray = [];
            //     this.tempCache.forEach((item, index, array) => {
            //         sendArray = sendArray.length == 0 ? item : [...sendArray, ...item];
            //     });
            //     sendArray = [...sendArray,...typedArray];
            //
            //     this.cacheBuffer = Module._malloc(sendArray.length);
            //     Module.HEAPU8.set(sendArray, this.cacheBuffer);
            //     this.avCore.PushAvData(this.cacheBuffer, sendArray.length);
            //     this.tempCache = [];
            //     this.packageNum = 0;
            //     Module._free(this.cacheBuffer);
            // }
        }
    }
}