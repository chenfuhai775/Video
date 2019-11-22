function IndexPage() {
    this._lxdIndexPage = null;  //IndexPage.xml
	this.m_bChannelPlay = [];  //通道是否在预览
	this.m_bChannelRecord = [];  //通道是否在录像
	this.m_bSound = [];  //通道声音是否打开
	this.m_iChannelStream = [];//通道的码流，0主码流，1子码流
	this.player = [];
	this.m_iCurChn = 0;  //// 从 1 开始
	this.m_iCurWndNum = 4;
	this.m_bAllPlay = false;
	///this.m_bAllRecord = false;
	for(var i = 0; i < 16; i++) {
		this.m_bSound[i] = 0;
		this.m_bChannelPlay[i] = 0;
		///this.m_bChannelRecord[i] = 0;
		this.m_iChannelStream[i] = 1;
		
		this.player[i] = null;
	}
	
	///this.m_bIsDiskFreeSpaceEnough = true;
	this.m_iTotalPageNum = 0;  		 ///总的页数
	this.m_iCurrentPageNum = 0;  	 ///当前页面数
	this.m_bIsSupportPage = false;   ///是否支持分页
	this.m_oSliderPtzSpd = null;     ///PTZ速度滑动条


	this.m_oSliderBright = null;     ///亮度滑动条
	this.m_oSliderContrast = null;   ///对比度滑动条
	this.m_oSliderSaturation = null; ///饱和度滑动条
	this.m_oSliderHue = null;  		 ///色度滑动条

	this.m_iBright = 0;  			  ///当前亮度
	this.m_iContrast = 0;  			  ///当前对比度
	this.m_iSaturation = 0;  		  ///当前饱和度
	this.m_iHue = 0;  				  ///当前色度

	this.m_iBrightMin = 0;  		 ///最小亮度
	this.m_iBrightMax = 255;  		 ///最大亮度
	this.m_iContrastMin = 0;         ///最小对比度
	this.m_iContrastMax = 255;  	 ///最大对比度
	this.m_iSaturationMin = 0;  	 ///最小饱和度
	this.m_iSaturationMax = 255;  	 ///最大饱和度
	this.m_iHueMin = 0;  		     ///最小色度
	this.m_iHueMax = 255;  			 ///最大色度

	this.m_iBrightDefault = 128;  ///默认亮度
	this.m_iContrastDefault = 129;  ///默认对比度
	this.m_iSaturationDefault = 132;  ///默认饱和度
	this.m_iHueDefault = 153;  ///默认色度
	
	this.m_bVideoExpand = false;  ///视频栏是否伸展
	this.m_oSelectPreset = null;  ///选中行的对象
	this.m_iSelectPatrolPreset = -1;  ///路径中选中的预置点
	this.m_iOperateMode = 0;  ///弹出编辑路径窗口后的操作  0 - 添加 1 - 修改
	this.m_oOperated = null;  ///被操作修改值的对象
	this.m_iProtocolType = 0;  ///取流方式，默认为RTSP
	
	this.m_worker = null;
	this.m_wasmLoaded = 0;
}

IndexPage.prototype = {
	//主页面初始化函数	
	initPage: function () {
		getMenuList();//加载菜单列表等文本
		this._getDeviceInfo();
		this.InitChnFrame(g_oCommon.m_iAnalogChannelNum + g_oCommon.m_iDigitalChannelNum);
		this.InitChnList(g_oCommon.m_iAnalogChannelNum + g_oCommon.m_iDigitalChannelNum);
		this.InitOptAreaSel();
		g_oIndexPage.syncMsg();
		setInterval("g_oIndexPage.syncMsg()", 2000);
		setTimeout(g_oIndexPage.initVideo(), 1);
	},
	initVideo: function (){
		this.wAvDecoder = new Worker("assets/jsVideo/AvDecoder.js");
        this.wAvDecoder.onmessage = function (evt) {
            var objData = evt.data;
			var chn=parseInt(objData.chn, 10);
			
			if((null != g_oIndexPage.player[chn])&&(undefined != g_oIndexPage.player[chn]))
			{
				switch (objData.t) {
					case kInitDecoderRsp:
						g_oIndexPage.player[chn].onInitDecoder(objData);
						break;
						
					case kVideoFrame:
						g_oIndexPage.player[chn].onVideoFrame(objData);
						break;
						
					case kAudioFrame:
						g_oIndexPage.player[chn].onAudioFrame(objData);
						break;
						
					case kDecoderStatusReq:
						g_oIndexPage.m_wasmLoaded = 1;
						break;
				}
			}
        };
		
		for(var iChn=1; iChn<=4; iChn++)
		{
			this.player[iChn-1] = new Player();
			console.log("aaaaaaaaaaaa");
			if(this.player[iChn-1])
			{
				console.log("bbbbbbbbbbbb");
				var canvas = document.getElementById('myCanvas'+iChn);
				console.log(canvas);
				this.player[iChn-1].initPlayer(canvas, this.wAvDecoder);
				console.log("dddddddddddddddd");
			}
		}
	},
	//获取设备信息
	_getDeviceInfo: function () {
		var szLanguage = $.cookie("language");
		translator.initLanguageSelect(szLanguage);
		this._lxdIndexPage = translator.getLanguageXmlDoc("IndexPage");
		translator.translatePage(this._lxdIndexPage, document);
		$("#btAway").attr("title", g_oCommon.getNodeValue("status0"));
		$("#btDisarm").attr("title", g_oCommon.getNodeValue("status1"));
		$("#btHome").attr("title", g_oCommon.getNodeValue("status2"));
		$("#btAlarmCancel").attr("title", g_oCommon.getNodeValue("status3"));
		$("#laZoomout").attr("title", g_oCommon.getNodeValue("laZoomout"));
		$("#laZoomin").attr("title", g_oCommon.getNodeValue("laZoomin"));
		$("#laFocusout").attr("title", g_oCommon.getNodeValue("laFocusout"));
		$("#laFocusin").attr("title", g_oCommon.getNodeValue("laFocusin"));
		$("#laIrisout").attr("title", g_oCommon.getNodeValue("laIrisout"));
		$("#laIrisin").attr("title", g_oCommon.getNodeValue("laIrisin"));
		$("#btnPlay").attr("title", g_oCommon.getNodeValue("btnPlay"));
		$("#btnCapture").attr("title", g_oCommon.getNodeValue("btnCapture"));
		$("#btnRecord").attr("title", g_oCommon.getNodeValue("btnRecord"));
		$("#btnEzoom").attr("title", g_oCommon.getNodeValue("btnEzoom"));
		$("#btnSound").attr("title", g_oCommon.getNodeValue("btnSound"));
		$("#btnIntercom").attr("title", g_oCommon.getNodeValue("btnIntercom"));
		$("#btnFullscreen").attr("title", g_oCommon.getNodeValue("btnFullscreen"));
		$("#btnOneScreen").attr("title", g_oCommon.getNodeValue("btnOneScreen"));
		$("#btnFourScreen").attr("title", g_oCommon.getNodeValue("btnFourScreen"));
		$("#btnNineScreen").attr("title", g_oCommon.getNodeValue("btnNineScreen"));
	},
	//获取区域列表
	InitOptAreaSel:function(){
		var that = this;
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/getAreaList",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("If-Modified-Since", 0);
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
			success: function (data) {
				console.log("data = %s \n", data);
				var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象		
				if(statusCode==1){
					var json = $.parseJSON(data);
					var areaNum = json.AreaNum;
					var index,areaNo,areaName;
					
					for(index=0; areaNum>index; index++){
						areaNo = json.item[index].AreaNo;
						areaName = json.item[index].AreaName;						
						var oOption = document.createElement("option");
						document.getElementById("optAreaSel").options.add(oOption);
						oOption.value = areaNo;
						oOption.innerText = areaName;
					}
					$("#optAreaSel").val("1");
					that.changeAreaSelect(1);
				}
			},

			timeOut: function (data){
				alert("请求数据超时");
			}
		})
	},
	InitChnFrame: function(chnNum)
	{
		var strHtml = "";
		if(1 == chnNum)
		{
			strHtml = "<canvas id=\"myCanvas1\" class=\"previewVideo\"></canvas>";
		}else if(4 == chnNum){
			for(var chn=1; chn<=4; chn++)
			{
				strHtml +=	"<canvas id=\"myCanvas"+chn+"\" class=\"previewVideo4 am-u-sm-6\"></canvas>"
			}
		}else if(9 == chnNum){
			for(var chn=1; chn<=9; chn++)
			{
				strHtml +=	"<canvas id=\"myCanvas"+chn+"\" class=\"previewVideo9 am-u-sm-8\"></canvas>"
			}
		}
		else if(16 == chnNum){
			for(var chn=1; chn<=16; chn++)
			{
				strHtml +=	"<canvas id=\"myCanvas"+chn+"\" class=\"previewVideo16 am-u-sm-10\"></canvas>"
			}
		}
		$("#chnFrame").html(strHtml);
	},
	//获取通道列表
	InitChnList: function(chnNum){
		var innerHTML=$("#ChnList").html();
		var chnNo;
		for(var i=0; i<chnNum; i++)
		{
			var szChannelName="";
			chnNo = i+1;
			if(szChannelName == "") {
				if(i<9) {
					szChannelName = "Camera 0"+chnNo;
				} else {
					szChannelName = "Camera "+chnNo;
				}
			}
			innerHTML += "<li>";
			innerHTML += "    <img src='assets/img/sub_stream.png' id='Stream"+chnNo+"Img' onclick='g_oIndexPage.switchStream(" + chnNo + ")'/>";
			innerHTML += "    <img src='assets/img/Camera_1.png' id='Camera"+chnNo+"Img' onclick='g_oIndexPage.StartRealPlay(" + chnNo + ")'/>";
			innerHTML += "<span style='cursor:pointer;color:#000000;-moz-user-select:none;' id='Selected"+chnNo+"color'  onClick='g_oIndexPage.SetFontColor("+chnNo+")' onDblClick='g_oIndexPage.StartRealPlay("+chnNo+")' onselectstart='return false;' title='"+szChannelName+"'>&nbsp;"+szChannelName+"</span>";
			innerHTML += "</li>";
		}

		$("#ChnList").html(innerHTML);
		for(var chn=1; chn<=chnNum; chn++)
		{
			var szId = "#Stream" + chn + "Img";
			$("#Camera"+(chn)+"Img").attr("title", parent.translator.translateNode(this._lxdIndexPage, "jsPreview"));
			if(this.m_iChannelStream[chn - 1] === 0) {
				$(szId).attr("title", parent.translator.translateNode(this._lxdIndexPage, "mainStream"));
			} else {
				$(szId).attr("title", parent.translator.translateNode(this._lxdIndexPage, "subStream"));
			}	
		}
	},
	//触发设备类别下拉选择框
	changeAreaSelect:function(AreaNo){
		var that = this;
		var AreaNo = $('#optAreaSel option:selected').val();
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/getAreaAttr?areaNo="+AreaNo+"",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (data) {
				console.log("data = %s \n", data);
				var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象		
				if(statusCode==1){
					var strStatus = "status"+$.parseJSON(data).areaStatus;
					var strStatusText = translator.translateNode(that._lxdIndexPage, strStatus);
					console.log("strStatusText = %s strStatus = %s\n", strStatusText, strStatus);
					$("#sysStatus").text(strStatusText);
				}
			},

			timeOut: function (data){
				alert("请求数据超时");
			}
		})
	},
	//系统布撤防操作函数
	AreaOpt: function (opt) {
		var that = this;
		var areaNo = $("#optAreaSel").val();
		$.ajax({
			type: "get",
			url: "/smart/areaOpt?optType="+opt+"&AreaNo="+areaNo+"",
			async: !0,
			timeout: 15000,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", "0");
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
			success: function (data){	
				var statusCode = $.parseJSON(data).statusCode;
				if(statusCode==1){
					var strMsg = opt + "Ok";
					var strStatus = "status"+$.parseJSON(data).updateStatus;
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue(strMsg),
						timeout:2000
					});
					//updateArmStatus(json.AreaStatus);
					$("#sysStatus").text(translator.translateNode(that._lxdIndexPage, strStatus));
					console.log("$.parseJSON(data).updateStatus = %s\n", $.parseJSON(data).updateStatus);
				}
			},
			error: function(xhr, textStatus, errorThrown) {
			}
		});	
	},
	//更新图标显示状态
	updateArmStatus: function(mode){
		if(mode == 1){
			if($("#btDisarm").hasClass("icon-alarm-disable"))
			{
				$("#btDisarm").removeClass("icon-alarm-disable");
				$("#btDisarm").addClass("icon-alarm-disable-sel");
			}
		}else{
			if($("#btDisarm").hasClass("icon-alarm-disable-sel"))
			{
				$("#btDisarm").removeClass("icon-alarm-disable-sel");
				$("#btDisarm").addClass("icon-alarm-disable");
			}
		}
		
		if(mode == 2){
			if($("#btHome").hasClass("icon-alarm-in"))
			{
				$("#btHome").removeClass("icon-alarm-in");
				$("#btHome").addClass("icon-alarm-in-sel");
			}
		}else{
			if($("#btHome").hasClass("icon-alarm-in-sel"))
			{
				$("#btHome").removeClass("icon-alarm-in-sel");
				$("#btHome").addClass("icon-alarm-in");
			}
		}
		if(mode == 3){
			if($("#btAway").hasClass("icon-alarm-out"))
			{
				$("#btAway").removeClass("icon-alarm-out");
				$("#btAway").addClass("icon-alarm-out-sel");
			}
		}else{
			if($("#btAway").hasClass("icon-alarm-out-sel"))
			{
				$("#btAway").removeClass("icon-alarm-out-sel");
				$("#btAway").addClass("icon-alarm-out");
			}
		}
	},
	ptzControl: function(action,para0,para1){
		var that = this;
		if(that.m_iCurChn > (g_oCommon.m_iAnalogChannelNum + g_oCommon.m_iDigitalChannelNum) || that.m_iCurChn <= 0) {
			return;
		}
		var iChannel = that.m_iCurChn;
		if(iChannel <= 0) {
			return;
		}
		var jsonReq = {};
			jsonReq.Cmd=7117;
			jsonReq.Id="web";
			jsonReq.User=123;
			jsonReq.Def="JSON_CMD_SET_PTZ";
			jsonReq.Ch = parseInt(iChannel, 10);
			jsonReq.Action = parseInt(action, 10);
			jsonReq.Time = 0;
			jsonReq.Arg1 = parseInt(para0, 10);
			jsonReq.Arg2 = parseInt(para1, 10);
	
		var jsonReqStr = JSON.stringify(jsonReq);
		$.ajax({
			type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&"+Base64.encode(jsonReqStr)+"&",
			async: !0,
            timeout: 15e3,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", "0");
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
			error:function(xhr, textStatus, errorThrown) {
				that.setState(xhr);
			}
		});
	},
	ptzLeftUp: function(){
		// PTZ_LEFT_UP = 5
		ptzControl(5,0,0);
	},
	ptzUp: function(){
		// PTZ_UP = 3
		ptzControl(3,0,0);
	},
	ptzRightUp: function(){
		// PTZ_RIGHT_UP = 7
		ptzControl(7,0,0);
	},
	ptzLeft: function(){
		// PTZ_LEFT = 1
		ptzControl(1,0,0);
	},
	ptzAuto: function(){
		// PTZ_STOP = 0
		// PTZ_AUTO_SCAN = 19
		ptzControl(0,0,0);
	},
	ptzRight: function(){
		// PTZ_RIGHT = 2
		ptzControl(2,0,0);
	},
	ptzLeftDown: function(){
		// PTZ_LEFT_DOWN = 6
		ptzControl(6,0,0);
	},
	ptzDown: function(){
		// PTZ_DOWN = 4
		ptzControl(4,0,0);
	},
	ptzRightDown: function(){
		// PTZ_RIGHT_DOWN = 8
		ptzControl(8,0,0);
	},
	ptzZoomOut: function(){
		// PTZ_ZOOM_WIDE  = 40
		ptzControl(40,0,0);
	},
	ptzZoomIn: function(){
		// PTZ_ZOOM_TELE = 39
		ptzControl(39,0,0);
	},
	ptzFocusOut: function(){
		// PTZ_FOCUS_FAR = 35
		ptzControl(35,0,0);
	},
	ptzFocusIn: function(){
		// PTZ_FOCUS_NAER = 36
		ptzControl(36,0,0);
	},
	ptzIriOut: function(){
		// PTZ_IRIS_OPEN = 37
		ptzControl(37,0,0);
	},
	ptzIriIn: function(){
		// PTZ_IRIS_CLOSE = 38
		ptzControl(38,0,0);
	},
	switchStream: function(chn){
		var szId = "#Stream" + chn + "Img";
		this.m_iChannelStream[chn - 1] = (this.m_iChannelStream[chn - 1] === 1 ? 0:1);
		if (this.m_bChannelPlay[chn - 1]) {
			////this.StopRealPlay(chn);
			///this.StartRealPlayForce(chn);
		}
		if(this.m_iChannelStream[chn - 1] === 0) {
			$(szId).attr("src", "assets/img/main_stream.png").attr("title", parent.translator.translateNode(this._lxdIndexPage, "mainStream"));
		} else {
			$(szId).attr("src", "assets/img/sub_stream.png").attr("title", parent.translator.translateNode(this._lxdIndexPage, "subStream"));
		}	
	},
	StartRealPlay: function(iChn){
		var that = this;
		if(0 == that.m_wasmLoaded)
		{
			alert("wasm loading");
			return ;
		}
		console.log("StartRealPlay -------- +++ iChannelNum = %s\n", iChn);
		if(iChn > (g_oCommon.m_iAnalogChannelNum+g_oCommon.m_iDigitalChannelNum)){return;}
		
		var ObjImg=document.getElementById("Camera"+(iChn)+"Img");
		console.log("StartRealPlay ----that.m_bChannelPlay[iChn-1] = %s \n", that.m_bChannelPlay[iChn-1]);
		if(that.m_bChannelPlay[iChn-1]==0) {
			var szURL = "";
			var streamType = 0;
			if(iChn <= (g_oCommon.m_iAnalogChannelNum+g_oCommon.m_iDigitalChannelNum)) {
				szURL = g_oCommon.m_szHostName;

				if (0 == that.m_iChannelStream[iChn - 1]) {  //主码流
					streamType = 0;  //[能力可以得到支持那种封装]这里最后以为暂时使用RTP流
				} else if (1 == that.m_iChannelStream[iChn - 1]) {  //子码流
					streamType = 1;
				}						
			}
			
			var playRet;
			if(this.player[iChn-1])
			{
				var url = 'ws://' + g_oCommon.m_szHostName +':8082/';
				this.player[iChn-1].playInner(url, iChn-1, this.m_iChannelStream[iChn - 1]); 
			}			
			playRet = 0;
	
			if(0 == playRet) {
				ObjImg.src = "assets/img/Camera_2.png";
				ObjImg.title = parent.translator.translateNode(that._lxdIndexPage, 'stoppreview');
				that.m_bChannelPlay[iChn-1]=1;
				///that.m_bChannelRecord[iChn-1]=0;
	
				that.m_iCurChn = iChn;

				if(!that.m_bAllPlay) {
					that.m_bAllPlay=true;
					$("#btPriew").html("<i class=\"icon-stop\"></i>");
					$("#btPriew").attr("title", parent.translator.translateNode(that._lxdIndexPage, 'stoppreview'));
				}
			} else {
				that.m_bChannelPlay[iChn-1]=0;
				that.m_bChannelRecord[iChn-1]=0;
				alert(parent.translator.translateNode(that._lxdIndexPage, 'previewfailed'));
			}
		}
		else 
			that.StopRealPlay(iChn);
	},
	StopRealPlay:function(iChn){
		var that = this;
		var playRet;
		///if(that.m_bChannelRecord[iChn-1]==1)	{
		///	that.StopRecord(iChn);
		///}
		if(null != this.player[iChn-1])
		{
			this.player[iChn-1].stop();
		}
		console.log("StopRealPlay -------- +++ iChannelNum = %s\n", iChn);
		playRet = 0;///g_oCommon.m_PreviewOCX.HWP_Stop(iChn-1);

		if(0 != playRet){
			alert(parent.translator.translateNode(that._lxdIndexPage, 'previewfailed'));
			return;
		}
		document.getElementById("Camera"+(iChn)+"Img").src="assets/img/Camera_1.png";
		document.getElementById("Camera"+(iChn)+"Img").title=parent.translator.translateNode(that._lxdIndexPage, 'jsPreview');
		that.m_bChannelPlay[iChn-1]=0;
		that.m_bChannelRecord[iChn-1]=0;

		if(that.m_bSound[iChn-1]) {
			$("#btnSound").html("<i class=\"icon-sound-off\"></i>");
			$("#btnSound").attr("title",parent.translator.translateNode(that._lxdIndexPage, 'jsOpensound'));
		}
		
		that.m_bSound[iChn-1]=0;
		
		if(iChn == that.m_iCurChn) {  //如果关闭的是当前窗口的预览，去掉视频参数显示
			that.m_iCurChn = -1;     
		}
		for(var i = 0; i < (g_oCommon.m_iAnalogChannelNum+g_oCommon.m_iDigitalChannelNum); i++) {
			if(that.m_bChannelPlay[i] ==  0) {
				continue;
			}
			return;
		}
		that.m_bAllPlay = false;
		$("#btnPlay").html("<i class=\"icon-play\"></i>");
		$("#btnPlay").attr("src","assets/img/RealPlayAll.png");
	},
	SetFontColor: function(iChn){
		for(var j=0;j<(g_oCommon.m_iAnalogChannelNum+g_oCommon.m_iDigitalChannelNum);j++) {
			if((j+1)==iChn) {
				document.getElementById("Selected"+(j+1)+"color").style.color="#FF0000";
			} else {
				document.getElementById("Selected"+(j+1)+"color").style.color="#000000";
			}
		}
	},
	RealPlayAll: function(){
		var that = this;
		if(0 == that.m_wasmLoaded)
		{
			alert("wasm loading");
			return ;
		}
		if(that.m_bAllPlay) {
			//全部停止预览
			that.StopRealPlayAll();
		} else {
			//全部开始预览
			var iPlayNumber = 0;
			if ((g_oCommon.m_iAnalogChannelNum+g_oCommon.m_iDigitalChannelNum) <= that.m_iCurWndNum) {
				iPlayNumber = (g_oCommon.m_iAnalogChannelNum+g_oCommon.m_iDigitalChannelNum);
			} else {
				iPlayNumber = that.m_iCurWndNum;
			}
			for(var i = 0; i < iPlayNumber; i++) {
				that.StartRealPlay(i+1);
			}
		}
		for(var i = 0 ;i < 256; i++) {
			that.m_bSound[i] = 0;
		}

		$("#btnSound").html("<i class=\"icon-sound-off\"></i>");
		$("#btnSound").attr("title",parent.translator.translateNode(that._lxdIndexPage, 'jsOpensound'));
	},
	//全部停止预览
	StopRealPlayAll:function () {
		var that = this;
		for(var j = 0; j < (g_oCommon.m_iAnalogChannelNum+g_oCommon.m_iDigitalChannelNum); j++) {
			//if(that.m_bChannelPlay[j] == 1) {
				//var iChn = j + 1;
				///if(that.m_bChannelRecord[j]==1) {  //如果正在录像，先停止
				///	var szRecord=parent.translator.translateNode(that.m_lxdPreview, 'jsRecord');	//录像
				///	var iRes = g_oCommon.m_PreviewOCX.HWP_StopRecord(j);
				///	if(0 == iRes) {
				///		document.getElementById("Record"+(iChn)+"Img").src="assets/img/record.png";
				///		document.getElementById("Record"+(iChn)+"Img").title=szRecord;
				///		window.parent.g_oMain.showTipsDiv("",parent.translator.translateNode(that.m_lxdPreview, ///'jsRecordSucc'));				
				//	}
				//}
				///if(0 != g_oCommon.m_PreviewOCX.HWP_Stop(iChn-1)) {
				///	continue;
				///}
				document.getElementById("Camera"+(iChn)+"Img").src="assets/img/Camera_1.png";
				document.getElementById("Camera"+(iChn)+"Img").title=parent.translator.translateNode(this.m_lxdPreview, 'jsPreview');
				that.m_bChannelPlay[j]=0;
				that.m_bChannelRecord[j]=0;
				if(that.m_bSound[j]) {
					$("#btnSound").html("<i class=\"icon-sound-off\"></i>");
					$("#btnSound").attr("title",parent.translator.translateNode(that.m_lxdPreview, 'jsOpensound'));
				}
				that.m_bSound[j]=0;
				if(iChannelNum == that.m_iCurChn) {
					that.m_iCurChn = -1;				
					////that.ResetVideoParam();
				}
			}
		//是否全部录像
		///that.m_bAllRecord = false;
		that.m_bAllPlay = false;
		$("#btPriew").attr("title",parent.translator.translateNode(that.m_lxdPreview, 'jsPreview'));
		$("#btPriew").html("<i class=\"icon-play\"></i>");
	},
	StartRealPlayForce:function (Chn) {
		var that = this;
		if(Chn > (g_oCommon.m_iAnalogChannelNum+g_oCommon.m_iDigitalChannelNum)){return;}

		var ObjImg=document.getElementById("Camera"+(Chn)+"Img");
		var szURL = "";
		var streamType = 0;

		var playRet;
		////
		if(0 == playRet) {
			ObjImg.src = "assets/img/Camera_2.png";
			ObjImg.title = parent.translator.translateNode(that._lxdIndexPage, 'stoppreview');
			that.m_bChannelPlay[Chn-1]=1;
			///that.m_bChannelRecord[Chn-1]=0;

			that.m_iCurChn = Chn;
		
			if(!that.m_bAllPlay) {
				that.m_bAllPlay=true;
				$("#btPriew").html("<i class=\"icon-stop\"></i>");
				$("#btPriew").attr("title",parent.translator.translateNode(that._lxdIndexPage, 'stoppreview'));
			}
		} else {
			that.m_bChannelPlay[Chn-1]=0;
			///that.m_bChannelRecord[Chn-1]=0;
			alert(parent.translator.translateNode(that._lxdIndexPage, 'previewfailed'));
		}
	},
	CapturePicture: function(){

	},
	RecordAll: function(){

	},
	btOpenVoice: function(){
		var that = this;
		if(that.m_iCurChn < 1)
			return ;

		if(that.m_bChannelPlay[that.m_iCurChn-1] == 1) {
			if(!that.m_bSound[that.m_iCurChn-1]) {
				for(var i = 0 ;i < 256; i++) {
					if(that.m_bSound[i]) {
						////g_oCommon.m_PreviewOCX.HWP_CloseSound();
						that.m_bSound[i] = 0;
					}
				}
				
				// if(0 == g_oCommon.m_PreviewOCX.HWP_OpenSound(that.m_iCurChn)) {
				if(1) {
					$("#btnSound").html("<i class=\"icon-sound-on\"></i>");
					$("#btnSound").attr("title", parent.translator.translateNode(that._lxdIndexPage, 'jsClosesound'));
					
					that.m_bSound[that.m_iCurChn-1]=1;
				} else {
					var iError = g_oCommon.m_PreviewOCX.HWP_GetLastError();
					if(25 == iError) {  //声音设备被占
						alert(parent.translator.translateNode(that._lxdIndexPage, 'jsOpenSoundFailed'));//提示语待
					}
				}
			} else {
				////g_oCommon.m_PreviewOCX.HWP_CloseSound();

				$("#btnSound").html("<i class=\"icon-sound-off\"></i>");
				$("#btnSound").attr("title", parent.translator.translateNode(that._lxdIndexPage, 'jsOpensound'));
				that.m_bSound[that.m_iCurChn-1]=0;
				$(window.parent.document.getElementById("volumeDiv")).hide();
			}
		}
	},
	displayLastMsg: function(){
		if(!($("#lastMsgLog").hasClass("am-dropdown-flip") && $("#lastMsgLog").hasClass("am-active")))
		{
			getLogList(5,'lTypeAlarm');
		}
	},
	syncMsg: function(){
		$.ajax({
				type: "get",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/syncMsgInfo",
				async: !0,
				timeout: 15e3,
				beforeSend: function (xhr) {
			},
			success: function (data) {
				var json = $.parseJSON(data);
				
				if(json.Ask==0){
					var eventNum = json.EventNum;
					
					if(!($("#lastMsgLog").hasClass("am-dropdown-flip") && $("#lastMsgLog").hasClass("am-active")))
						$("#alarmInfoNum").text(eventNum);
					
					var hddStatus = $.parseJSON(data).HddStatus;////1 连接正常  2 硬盘满  3 硬盘错误  4 未连接
					if(hddStatus==1){
						document.getElementById('statusSD').innerHTML = "<i class='am-icon-check text-success'></i>";
					}
					else {
						document.getElementById('statusSD').innerHTML = "<i class='am-icon-remove text-error'></i>";
					}
					
					var netStatus = $.parseJSON(data).NetStatus; ////  网络连接状态 0 未连接 1 连接
					if(netStatus==0){
						document.getElementById('statusInternet').innerHTML = "<i class='am-icon-remove text-error'></i>";
					}
					else {
						document.getElementById('statusInternet').innerHTML = "<i class='am-icon-check text-success'></i>";
					}
					
					var status4G = $.parseJSON(data).GprsStatus;  ////  GPRS 连接状态0 未连接 1 连接
					if(status4G==0){
						document.getElementById('status4G').innerHTML = "<i class='am-icon-remove text-error'></i>";
					}
					else{
						document.getElementById('status4G').innerHTML = "<i class='am-icon-check text-success'></i>";
					}
					
					var statusPower = $.parseJSON(data).AcStatus; ////  交流供电状态0 未连接 1 连接
					if(statusPower==0){
						document.getElementById('statusPower').innerHTML = "<i class='am-icon-remove text-error'></i>";
					}
					else {
						document.getElementById('statusPower').innerHTML = "<i class='am-icon-check text-success'></i>";
					}
					
					var statusPlatform = $.parseJSON(data).CmsStatus; //// 平台连接状态  1 正常连接 2 GPRS连接 3 未连接
					if(statusPlatform==3){
						document.getElementById('statusPlatform').innerHTML = "<i class='am-icon-remove text-error'></i>";
					}
					else {
						document.getElementById('statusPlatform').innerHTML = "<i class='am-icon-check text-success'></i>";
					}
				}
			},
			timeOut: function (data){
				alert("操作超时");
			}
		})
	},
}

var g_oIndexPage= new IndexPage();