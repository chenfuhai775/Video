function VideoSetting() {
    this._lxdVideoSetting = null;  ///VideoSetting.xml
}

var curResultIndex = 0;
var tryGetResultNum = 0;
var tryGetResultMaxNum = 0;
var searchType = 0; 			   /// 0 onvif  1 private
var checkCfgStatusCount = 0;
var m_iIpcCfgTimerID = -1;
var m_szIpcType = 0;
var curResultIndexSel = 0;

VideoSetting.prototype = {
	///主页面初始化函数	
	initPage: function () {
		getMenuList();							///加载菜单列表等文本
		///getLogList(5,'lTypeAlarm');				///获取报警记录
		var szLanguage = $.cookie("language");
		translator.initLanguageSelect(szLanguage);
		
		if(1 == g_oCommon.m_bDecodeCfg)
		{
			this._lxdVideoSetting = translator.getLanguageXmlDoc("VideoSetting");
			translator.translatePage(this._lxdVideoSetting, document);
			this.InitChnList(g_oCommon.m_iAnalogChannelNum + g_oCommon.m_iDigitalChannelNum,"chnSel1");
			this.InitChnList(g_oCommon.m_iAnalogChannelNum + g_oCommon.m_iDigitalChannelNum,"chnSel2");
			this.channelSel("0");
			this.videoLossSel("0");
			this.getEncode();
			g_oVideoSetting.syncMsg();
			setInterval("g_oVideoSetting.syncMsg()", 2000);
		}
		else
			document.getElementById("decodeCfg").innerHTML = "";
	},

	channelSel: function (chn) {
		var json = {};
		json.Cmd=1501;
		json.Id="web";
		json.User=123;
		json.Def="JSON_VIDEO_LIST";	
		var jsonStr = JSON.stringify(json);
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&"+Base64.encode(jsonReqStr)+"&",
			async: !0,
            timeout: 15e3,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", 0);
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
            success: function(data) {
				console.log("channelSel data = %s \n", data);
				var json = $.parseJSON(data);
				if(json.Ask == 0)
				{
					for(var Index=0; Index<json.L.length(); Index++)
					{
						if(json.L[chn].C == chn)
						{
							var jsonChnEnable = json.L[chn].E;
							var jsonTimeSync = json.L[chn].T;
							var jsonProtocolType = json.L[chn].S;
							var jsonDomain = json.L[chn].I;
							var jsonPort = json.L[chn].Port;
							var jsonUserName = json.L[chn].U;
							var jsonUserPwd = json.L[chn].W;
							
							if("0"==jsonProtocolType)
							{
								$("#domain1").prop("disabled", !0);
								$("#port1").prop("disabled", !0);
							}
							else 
							{
								$("#domain1").prop("disabled", !1);
								$("#port1").prop("disabled", !1);
							}
							
							if(0 == jsonChnEnable) $("#IsChnEnable1").prop("checked", !1);
							else $("#IsChnEnable1").prop("checked", !0);
							
							if(0 == jsonTimeSync) $("#IsTimeSync1").prop("checked", !1);
							else $("#IsTimeSync1").prop("checked", !0);
							
							//$("#protocolType").val(jsonProtocolType);
							$("#protocolType1").find("option[value="+jsonProtocolType+"]").attr("selected",true);
							$("#domain1").val(jsonDomain);
							$("#port1").val(jsonPort);
							console.log("jsonUserName = %s", jsonUserName);
							$("#userName1").val(jsonUserName);
							$("#userPwd1").val(jsonUserPwd);
						}
					}
					
				}
            },
			
            error: function(e) {  
            }
        })
    },
	
	videoLossSel: function (chn) {
		var json = {};
		json.Cmd=8001;
		json.Id="web";
		json.User=123;
		json.Def="JSON_VIDEO_LOST";	
		var jsonStr = JSON.stringify(json);
		$.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&"+Base64.encode(jsonReqStr)+"&",
			async: !0,
			timeout: 15e3,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", 0);
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
            success: function(data) {
				var json = $.parseJSON(data);
				console.log("data = %s \n", data);
				if(json.Ask == 0)
				{
					var jsonTriggerDelay = json.TriggerDelay;
					var jsonTimerLink = json.TimerLink;
					var jsonArmLink = json.ArmLink;
					var jsonBell = json.Bell;
					var jsonEmail = json.Email;
					var jsonBeep = json.Beep;
					var jsonUploadCms = json.UploadCms;
					
					$("#triggerDelay").val(jsonTriggerDelay);
					
					if(0 == jsonTimerLink) $("#timerLink").prop("checked", !1);
					else $("#timerLink").prop("checked", !0);
					
					if(0 == jsonArmLink) $("#armLink").prop("checked", !1);
					else $("#armLink").prop("checked", !0);
					
					if(0 == jsonBell) $("#bell").prop("checked", !1);
					else $("#bell").prop("checked", !0);
					
					if(0 == jsonEmail) $("#email").prop("checked", !1);
					else $("#email").prop("checked", !0);
					
					if(0 == jsonBeep) $("#beep").prop("checked", !1);
					else $("#beep").prop("checked", !0);
					
					if(0 == jsonUploadCms) $("#uploadCms").prop("checked", !1);
					else $("#uploadCms").prop("checked", !0);
				}
            },
			
            error: function(e) {  
            }
        })
	},
	
	//搜索onvif协议设备
	onvifSearchClick: function(){
		var that = this;
		searchType = 0;
		document.getElementById('newDevice').innerHTML = "";
		$("#privateSearch").prop("disabled", !0);
		$("#oneKey").prop("disabled", !0);
		$('#onvifSearch').attr('data-am-loading', "{spinner: 'circle-o-notch', loadingText: '"+g_oCommon.getNodeValue('laDevSearch')+"'}");
		$('#onvifSearch').button('loading');
		startSearchFlag = 1;
		
		var jsonReq = {};
			jsonReq.Cmd=1505;
			jsonReq.Id="web";
			jsonReq.User=123;
			jsonReq.Def="JSON_VIDEO_SEARCH_S";
						
		var jsonReqStr = JSON.stringify(jsonReq);
		
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&"+Base64.encode(jsonReqStr)+"&",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (data) {
				console.log("data = %s \n", data);
				var Ask = $.parseJSON(data).Ask;	//将返回结果转换成JSON对象		
				if(Ask==0){
					tryGetResultNum = 0;
					tryGetResultMaxNum = 60;
					curResultIndex = 0;
					setTimeout(function(){
						that.tryGetCameraSearch();
					}, 1000);
				}
			},

			timeOut: function (data){
				alert("请求数据超时");
			}
		})
	},
	
	/// 搜索私有协议设备
	privateSearchClick: function(){
		var that = this;
		searchType = 1;
		document.getElementById('newDevice').innerHTML = "";
		$("#onvifSearch").prop("disabled", !0);
		$("#oneKey").prop("disabled", !0);
		$('#privateSearch').attr('data-am-loading', "{spinner: 'circle-o-notch', loadingText: '"+g_oCommon.getNodeValue('laDevSearch')+"'}");
		$('#privateSearch').button('loading');
		startSearchFlag = 1;
		
		var jsonReq = {};
			jsonReq.Cmd=1506;
			jsonReq.Id="web";
			jsonReq.User=123;
			jsonReq.Def="JSON_VIDEO_SEARCH_E";
						
		var jsonReqStr = JSON.stringify(jsonReq);
		
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&"+Base64.encode(jsonReqStr)+"&",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (data) {
				console.log("data = %s \n", data);
				var Ask = $.parseJSON(data).Ask;	/// 将返回结果转换成JSON对象		
				if(Ask==1){
					tryGetResultNum = 0;
					tryGetResultMaxNum = 60;
					curResultIndex = 0;
					setTimeout(function(){
						that.tryGetCameraSearch();
					}, 1000);
					
				}
			},

			timeOut: function (data){
				AMUI.dialog.tip({
					tip: g_oCommon.getNodeValue('DataTimeout'),
					timeout:1000
				});
			}
		})
	},
	//循环搜索
	tryGetCameraSearch: function() {
		var that=this;
		console.log("tryGetCameraSearch -------------------- \n");
		tryGetResultNum ++;
		if(tryGetResultNum >= tryGetResultMaxNum){
			$('#onvifSearch').button('reset');
			$('#privateSearch').button('reset');
			$("#onvifSearch").prop("disabled", !1);
			$("#privateSearch").prop("disabled", !1);
			$("#oneKey").prop("disabled", !1);
			return ;
		} 
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/paraCfg/tryGetSerchResult&ResultIndex="+curResultIndex+"&",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (data) {				
				console.log("tryGetCameraSearch data = %s \n", data);
				var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象		
				if(statusCode==1){
					var json = $.parseJSON(data);
					var itemNum = json.itemNum;
					var newDeviceList="";
					var index,i,ipAddr,staIpAddr,channel,port,protical;
					for(index=0; index<itemNum; index++){
						i = json.item[index].index;
						ipAddr = json.item[index].ipAddr;
						staIpAddr = " ";///json.item[index].staIpAddr;
						channel = json.item[index].channel;
						port = json.item[index].port;
						var strStatus;
						
						if(0 === json.item[index].status)
							strStatus = g_oCommon.getNodeValue("strConnect");
						else
							strStatus = g_oCommon.getNodeValue("strDisConnect");

						if(0 === json.item[index].protical)
							protical = "Onvif";
						else if(1 === json.item[index].protical)
							protical = "Private";
						else if(2 === json.item[index].protical)
							protical = "Cms";
						else
							protical = "Private";
						newDeviceList +="<tr>";
						newDeviceList +="	<td>"+i+"</td>";
						newDeviceList +="	<td>"+ipAddr+"</td>";
						newDeviceList +="	<td>"+staIpAddr+"</td>";
						newDeviceList +="	<td>"+channel+"</td>";
						newDeviceList +="	<td>"+port+"</td>";
						newDeviceList +="	<td>"+protical+"</td>";
						newDeviceList +="	<td>"+strStatus+"</td>";
						newDeviceList +="	<td><div class='am-btn-toolbar'><div class='am-btn-group am-btn-group-sm'><button class='am-btn am-btn-default am-btn-sm am-text-secondary devAdd' onclick='g_oVideoSetting.addoneIpc(\""+i+"\",\""+staIpAddr+"\",\""+ipAddr+"\")'><span class='am-icon-plus'></span> "+g_oCommon.getNodeValue('btnAdd')+"</button></div></div></td>";
						newDeviceList +="</tr>";
					};
					
					curResultIndex += itemNum;
					if((curResultIndex > 0)&&(60 == tryGetResultMaxNum))
					{
						tryGetResultMaxNum = tryGetResultNum + 5;
					}
					
					document.getElementById('newDevice').innerHTML += newDeviceList;
				}
				console.log("setTimeout ++++++++++++++++++++++ \n");
				setTimeout(function(){
					that.tryGetCameraSearch();
				}, 1000);
			},
			
			timeOut: function (data){
				AMUI.dialog.tip({
					tip: g_oCommon.getNodeValue('DataTimeout'),
					timeout:1000
				});
			}
		})
	},
	
	oneKeyClick: function() {
			$("#onvifSearch").prop("disabled", !0);
			$("#privateSearch").prop("disabled", !0);
			$("#oneKey").prop("disabled", !0);
			var url = g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/paraCfg/oneKeyCfg?" + Math.random();
			$.get(url, function (data) {
			if (!isTimeout(data)) {
				AMUI.dialog.tip({
					tip: g_oCommon.getNodeValue('DataTimeout'),
					timeout:1000
				});
			}else{
				var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象		
				if(statusCode==1){
					$("#onvifSearch").prop("disabled", !1);
					$("#privateSearch").prop("disabled", !1);
					$("#oneKey").prop("disabled", !1);
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('optOK'),
						timeout:1000
					});
				}
			}
		});
    },
	
	//获取通道列表
	InitChnList: function(chnNum,SelectID){
		var chnNo;
		document.getElementById(SelectID).length=0;
		for(var i=0; i<chnNum; i++)
		{
			var szChannelName="";
			chnNo = i+1;
			if(szChannelName == "") {
				szChannelName = "chn"+chnNo;
			}
			var oOption = document.createElement("option");
			document.getElementById(SelectID).options.add(oOption);
			oOption.value = i;
			oOption.innerText = szChannelName;
			
		}
	},
	checkIpcCfgStatus: function() {
		var that = this;
		checkCfgStatusCount ++;
		if(checkCfgStatusCount >= 90) 
		{
			clearInterval(m_iIpcCfgTimerID);
			alert("time out");
			return ;
		}
		
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/paraCfg/WifiSuitConfigStatus?"+ Math.random(),
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (data) {
				console.log("WifiSuitConfigStatus data = %s \n", data);
				var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象	
				var cfgStatus = $.parseJSON(data).Status;
				if(statusCode==1){
					if(1 == cfgStatus)
					{
						checkCfgStatusCount = 0;
						clearInterval(m_iIpcCfgTimerID);
						m_iIpcCfgTimerID = -1;
						//弹出模态框设置
						$('#my-prompt').modal({
							relatedTarget: this,
							closeOnConfirm: false,
							closeOnCancel: false,
							onConfirm: function(e) {
								that.setChannelCfg();
								console.log("setChannelCfg --------------------------- \n");
							},
							onCancel: function(e) {
								console.log("close --------------------------- \n");
								this.close();
							}
						});
						console.log("that.getChannelCfg(%s)------------ \n", curResultIndexSel);
						that.getChannelCfg(curResultIndexSel);
					}
					else if(2 == cfgStatus)
					{
						checkCfgStatusCount = 0;
						clearInterval(m_iIpcCfgTimerID);
						m_iIpcCfgTimerID = -1;
						alert("time out");
					}	
				}
			},

			timeOut: function (data){
				alert("请求数据超时");
			}
		})
	},
	getChannelCfg: function (IpcIndexSel) {
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/paraCfg/GetSerchInfoByIndex&ResultIndex="+IpcIndexSel+"&",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (dataRcv) {
				console.log("dataRcv = %s \n", dataRcv);
				var json = $.parseJSON(dataRcv);
				var statusCode = json.statusCode;	//将返回结果转换成JSON对象		
				if(statusCode==1){
					var jsonIpAddr = json.IpAddr;;
					var jsonPort = json.Port;
					var jsonProtical = json.Protical;
					var jsonUserName = json.UserName;
					var jsonUserPwd = json.UserPwd;
					var jsonChgChn = json.CfgChn;
					
					$("#chnSel").find("option[value="+jsonChgChn+"]").attr("selected",true);
					$("#domain").prop("disabled", !0);
					$("#port").prop("disabled", !0);
					$("#IsChnEnable").prop("checked", !1);
					$("#IsTimeSync").prop("checked", !1);

					$("#protocolType").val(jsonProtical);
					$("#domain").val(jsonIpAddr);
					$("#port").val(jsonPort);
					$("#userName").val(jsonUserName);
					$("#userPwd").val(jsonUserPwd);			
				}
			},
			
			timeOut: function (data){
				asert("请求数据超时");
			}
		})
    },
	addoneIpc: function(curRowIndex,staIpAddr,ipAddr){
		var that=this;
		that.InitChnList(g_oCommon.m_iAnalogChannelNum + g_oCommon.m_iDigitalChannelNum, "chnSel");
		console.log("searchType=%s,curRowIndex=%s,staIpAddr=%s,ipAddr=%s\n", searchType,curRowIndex,staIpAddr,ipAddr);
		if(1 == searchType)
		{
			curResultIndexSel = curRowIndex;
			m_szIpcType = 1;
			m_iIpcCfgTimerID = -1;
			$.ajax({
				type: "get",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/paraCfg/WifiSuitConfigIpc?ResultIndex="+curRowIndex+"&",
				async: !0,
				timeout: 15e3,
				beforeSend: function (xhr) {
				},
				success: function (data) {
					console.log("data = %s \n", data);
					var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象		
					if(statusCode==1){
						checkCfgStatusCount = 0;
						m_iIpcCfgTimerID = setInterval(function () {that.checkIpcCfgStatus()}, 1000);
						
						///// 这里需要加一个模态框，保证配置时不可以点击
					}
				},

				timeOut: function (data){
					asert("请求数据超时");
				}
			})
		}
		else{
			m_szIpcType = 0;
			$('#my-prompt').modal({
				relatedTarget: this,
				closeOnConfirm: false,
				closeOnCancel: false,
				onConfirm: function(e) {
					
					that.setChannelCfg();

				},
				onCancel: function(e) {

					this.close();

				}
			});
			
			that.getChannelCfg(curRowIndex);
		}
	},
	
	setChannelCfg:function(){
		var json = {};
		json.Chn = $("#chnSel").val();
		
		if($("#IsChnEnable").prop("checked")) json.ChnEnable = 1;
		else json.ChnEnable = 0;
		
		if($("#IsTimeSync").prop("checked")) json.TimeSync = 1;
		else json.TimeSync = 0;
		
		json.ProtocolType = $("#protocolType").val();
		json.Domain = $("#domain").val();
		json.Port = $("#port").val();
		json.UserName = $("#userName").val();
		json.UserPwd = $("#userPwd").val();
		json.FromSerch = 1;
		
		var jsonStr = JSON.stringify(json);
		console.log("setChannelCfg jsonStr = %s \n", jsonStr);
		$.ajax({
			type: "PUT",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/paraCfg/setChannelPara",
			timeout: 15e3,
            async: !1,
            processData: !1,
			data: jsonStr,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("If-Modified-Since", 0);
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
		
			success: function(data) {
				var json_rcv = $.parseJSON(data);
				if(json_rcv.statusCode == 1)
				{	
					var jsonChnEnable_rcv = json_rcv.ChnEnable;
					var jsonPort_rcv = json_rcv.Port;
					if(0 == jsonChnEnable_rcv) $("#IsChnEnable").prop("checked", !1);
						else $("#IsChnEnable").prop("checked", !0);
			
					$("#port").val(jsonPort_rcv);
					
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('optOK'),
						timeout:1000
					});
					$('#my-prompt').modal('close');
				}
			},
			
			complete: function(t) {
				
			}
		
		})
	},
	
	saveChannelPara:function(){
		var json = {};
		json.Chn = $("#chnSel1").val();
		
		if($("#IsChnEnable1").prop("checked")) json.ChnEnable = 1;
		else json.ChnEnable = 0;
		
		if($("#IsTimeSync1").prop("checked")) json.TimeSync = 1;
		else json.TimeSync = 0;
		
		json.ProtocolType = $("#protocolType1").val();
		json.Domain = $("#domain1").val();
		json.Port = $("#port1").val();
		json.UserName = $("#userName1").val();
		json.UserPwd = $("#userPwd1").val();
		
		var jsonStr = JSON.stringify(json);
		console.log("saveChannelPara jsonStr = %s \n", jsonStr);
		$.ajax({
			type: "PUT",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/paraCfg/setChannelPara",
			timeout: 15e3,
            async: !1,
            processData: !1,
			data: jsonStr,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("If-Modified-Since", 0);
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
		
			success: function(data) {
				var json_rcv = $.parseJSON(data);
				if(json_rcv.statusCode == 1)
				{	
					var jsonChnEnable_rcv = json_rcv.ChnEnable;
					var jsonPort_rcv = json_rcv.Port;
					if(0 == jsonChnEnable_rcv) $("#IsChnEnable").prop("checked", !1);
						else $("#IsChnEnable").prop("checked", !0);
			
					$("#port").val(jsonPort_rcv);
					
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('optOK'),
						timeout:1000
					});
					$('#my-prompt').modal('close');
				}
			},
			
			complete: function(t) {
				
			}
		
		})
	},
	
	saveVideoLostInfo: function () {
        var json = {};	
		json.Chn = $("#chnSel").val();
		json.TriggerDelay = $("#triggerDelay").val();
		if($("#timerLink").prop("checked")) json.TimerLink = 1;
		else json.TimerLink = 0;
		
		if($("#armLink").prop("checked")) json.ArmLink = 1;
		else json.ArmLink = 0;
		
		if($("#bell").prop("checked")) json.Bell = 1;
		else json.Bell = 0;
		
		if($("#email").prop("checked")) json.Email = 1;
		else json.Email = 0;	
					
		if($("#beep").prop("checked")) json.Beep = 1;
		else json.Beep = 0;			
					
		if($("#uploadCms").prop("checked")) json.UploadCms = 1;
		else json.UploadCms = 0;			
		
		var jsonStr = JSON.stringify(json);
		
		$.ajax({
			type: "PUT",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/paraCfg/setVideoLostPara",
			timeout: 15e3,
			async: !1,
			processData: !1,
			data: jsonStr,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("If-Modified-Since", 0);
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
			
			success: function(data) {
				var json = $.parseJSON(data);
				if(json.statusCode != undefined)
				{	
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('optOK'),
						timeout:1000
					});
				}
			},
			
			complete: function(t) {
			   
			}
		
		})
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
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/getStatusInfo",
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
				}
			},
			timeOut: function (data){
				alert("操作超时");
			}
		})
	},
	getEncode: function () {
		let json = {};
		json.Cmd = 7037;
		json.Id = "web";
		json.User = 123;
		json.Def = "JSON_CMD_GET_ENCONDE";
		let jsonStr = JSON.stringify(json);
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
			timeout: 15e3,
			async: !1,
			processData: !1,
			dataType: "json",
			data: jsonStr,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("If-Modified-Since", 0);
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
			success: function (data) {
				if (0 == data.Ack) {
					$('#ddlMirror').val(data.Mirror);
					$("#ddlframeRate").val(data.FrameRate);
					$("#ddlResolution").val(data.Resolution);
					$("#ddlQuality").val(data.Quality);
					$("#ddlEncType").val(data.EncType);
					$("#ddlSubEncSwitch").val(data.SubEncSwitch);
					$("#ddlsubFrameRate").val(data.SubFrameRate);
					$("#ddlSubRes").val(data.SubRes);
					$("#ddlSubQuality").val(data.SubQuality);
					$("#ddlSubEncType").val(data.SubEncType);
				}
			},
			complete: function (t) {
			}
		})
	},

	setEncode: function () {
		let json = {};
		json.Cmd = 7038;
		json.Id = "web";
		json.User = 123;
		json.Def = "JSON_CMD_SET_ENCONDE";

		json.Mirror = $('#ddlMirror').val();
		json.FrameRate = 	$("#ddlframeRate").val();
		json.Resolution = $("#ddlResolution").val();
		json.Quality = $("#ddlQuality").val();
		json.EncType = $("#ddlEncType").val();
		json.SubEncSwitch = $("#ddlSubEncSwitch").val();
		json.SubFrameRate = $("#ddlsubFrameRate").val();
		json.SubRes = $("#ddlSubRes").val();
		json.SubQuality = $("#ddlSubQuality").val();
		json.SubEncType = $("#ddlSubEncType").val();

		let jsonStr = JSON.stringify(json);
		$.ajax({
			type: "put",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
			timeout: 15e3,
			async: !1,
			processData: !1,
			dataType: "json",
			data: jsonStr,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("If-Modified-Since", 0);
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
			success: function (data) {
				if (0 == data.Ack) {
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('Success1'),
						timeout: 1000
					});
				}
			},
			complete: function (t) {
			}
		})
	}
}
var g_oVideoSetting= new VideoSetting();