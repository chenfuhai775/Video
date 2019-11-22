self.Module = {
    onRuntimeInitialized: function () {
        onWasmLoaded();
    }
};
function onWasmLoaded() {
    if (self.decoder) {
        self.decoder.onWasmLoaded();
    } else {
        console.log("[ER] No decoder!");
    }
}
self.importScripts("common.js");
self.importScripts("AvCore.js");

class AvDecoder {
    constructor() {
        this.logger = new Logger("AvDecoder");
        this.coreLogLevel = 0;
        this.wasmLoaded = false;
        this.tmpReqQue = [];
        this.cacheBuffer = [];
        this.decodeTimer = null;
        this.avCore = null;
        this.videoCallback = null;
        this.audioCallback = null;
        this.chunkSize = 1024*1024*10;
		this.avCore=[];
		this.stream=[];
		
		for(var chn=0; chn<64; chn++)
		{
			this.avCore[chn] = null;
			this.stream[chn] = 1;
			this.cacheBuffer[chn] = null;
		}
    }  
	
    initDecoder(chn, stream) {
		var ret = -1;
		console.log("initDecoder ++++++++++++chn = %s, stream = %s", chn, stream);
		if((chn<0)||(chn>63)) return ;
		if((stream != 0)&&(stream != 1)) return;
		
		if(null == this.avCore[chn])
		{
			this.avCore[chn] = new Module.CAvCore();
			
			this.videoCallback = Module.addFunction(function (chn, buff, size, timestamp, videoWidth, videoHeight) {
				var outArray = Module.HEAPU8.subarray(buff, buff + size);
				var data = new Uint8Array(outArray);
				var objData = {
					t: kVideoFrame,
					s: timestamp,
					d: data,
					w: videoWidth,
					h: videoHeight,
					chn: chn
				};
		
				self.postMessage(objData, [objData.d.buffer]);
			});
			
			this.audioCallback = Module.addFunction(function (chn, buff, size) {
				var outArray = Module.HEAPU8.subarray(buff, buff + size);
				var data = new Uint8Array(outArray);
				var objData = {
					t: kAudioFrame,
					d: data,
					chn: chn
				};
				console.log("this.audioCallback[0]----");
				self.postMessage(objData, [objData.d.buffer]);
			});

			ret = this.avCore[chn].InitCb(chn, this.videoCallback, this.audioCallback);
			console.log("case 0: ret = %s", ret);		
		}
		else
			ret = 0;
		
		if (this.cacheBuffer[chn] != null) {
            Module._free(this.cacheBuffer[chn]);
            this.cacheBuffer[chn] = null;
        }
		
		if (null == this.cacheBuffer[chn]) {
			console.log("initDecoder this.chunkSize = %s " + this.chunkSize);
			this.cacheBuffer[chn] = Module._malloc(this.chunkSize);
		}
		
        console.log("initDecoder return " + ret + ".");
        
        var objData = {
            t: kInitDecoderRsp,
            e: ret,
			chn:chn,
			stream:stream
        };
		
        self.postMessage(objData);
    }
	
    uninitDecoder(chn, stream) {        
        console.log("Uninit ffmpeg decoder return ");
        if (this.cacheBuffer[chn] != null) {
            Module._free(this.cacheBuffer[chn]);
            this.cacheBuffer[chn] = null;
        }
    }   
	
    closeDecoder(chn, stream) {
        this.logger.logInfo("closeDecoder.");
        ///if (this.decodeTimer) {
        ///    clearInterval(this.decodeTimer);
        ///    this.decodeTimer = null;
        ///    this.logger.logInfo("Decode timer stopped.");
        ///}
        var ret =0;
        this.logger.logInfo("Close ffmpeg decoder return " + ret + ".");
        var objData = {
            t: kCloseDecoderRsp,
            e: 0,
			chn: chn, 
			stream: stream
        };
        self.postMessage(objData);
    }    
    sendData(chn, stream, data) {
        if(null != this.cacheBuffer[chn])
        {
            var typedArray = new Uint8Array(data);
            Module.HEAPU8.set(typedArray, this.cacheBuffer[chn]);
            ///console.log("sendData =========this.cacheBuffer = %s", this.cacheBuffer[chn]);
            this.avCore[chn].PushAvData(this.cacheBuffer[chn], typedArray.length);
        }
    }
	
    processReq(req) {
    ///    this.logger.logInfo("processReq " + req.t + ".");
	///	console.log("processReq" + req.t);
        switch (req.t) {
            case kInitDecoderReq:
                this.initDecoder(req.chn, req.stream);
                break;
            case kUninitDecoderReq:
                this.uninitDecoder(req.chn, req.stream);
                break; 
            case kCloseDecoderReq:
                this.closeDecoder(req.chn, req.stream);
                break;
            case kFeedDataReq:
                this.sendData(req.chn, req.stream, req.d);
                break;                  
            default:
                this.logger.logError("Unsupport messsage " + req.t);
        }
    }
    cacheReq(req) {
        if (req) {
            this.tmpReqQue.push(req);
        }
    }
    onWasmLoaded() {
        this.logger.logInfo("Wasm loaded.");
        this.wasmLoaded = true; 
		
		var objData = {
            t: kDecoderStatusReq,
            e: 0,
			chn: 0, 
			stream: 0
        };
        self.postMessage(objData);
       /*
        while (this.tmpReqQue.length > 0) {
            var req = this.tmpReqQue.shift();
            this.processReq(req);
        }
        */
    }
}

self.decoder = new AvDecoder;

self.onmessage = function (evt) {
	///console.log("AvDecoder onmessage");
	///console.log("AvDecoder onmessage" + evt.data.t);
    if (!self.decoder) {
        console.log("[ER] AvDecoder not initialized!");
        return;
    }
	
    var req = evt.data;
    if (!self.decoder.wasmLoaded) {
        self.decoder.cacheReq(req);
        self.decoder.logger.logInfo("Temp cache req " + req.t + ".");
        return;
    }
	
    self.decoder.processReq(req);
};
