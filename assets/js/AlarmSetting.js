function AlarmSetting() {
    this._lxdAlarmSetting = null;  //AlarmSetting.xml
}
AlarmSetting.prototype = {
	
	//主页面初始化函数	
	initPage: function () {
		getMenuList();//加载菜单列表等文本
		///getLogList(5,'lTypeAlarm');//获取报警记录
		var szLanguage = $.cookie("language");
		translator.initLanguageSelect(szLanguage);
		this._lxdAlarmSetting = translator.getLanguageXmlDoc("AlarmSetting");
		translator.translatePage(this._lxdAlarmSetting, document);
		this.getAlarmPara();
		this.getPhoneCfgInfo();
		g_oAlarmSetting.syncMsg();
		setInterval("g_oAlarmSetting.syncMsg()", 2000);
	},
	
	getAlarmPara: function () {
		var jsonReq = {};
			jsonReq.Cmd=8001;
			jsonReq.Id="web";
			jsonReq.User=123;
			jsonReq.Def="JSON_CMD_GET_ALARM_PARA";
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
            success: function(data) {
				var json = $.parseJSON(data);
				if(json.Ask == 0)
				{
					var jsonEnterDelay = json.EnterDelay;
					var jsonOutDelay = json.OutDelay;
					var jsonBellDelay = json.BellDelay;
					var jsonDetectorLost = json.DetectorLost;
					var jsonAcLoss = json.AcLoss;
					var jsonReport = json.Report;
					var jsonTone = json.Tone;
					var jsonForceArm = json.ForceArm;
					var jsonAlarmLimit = json.AlarmLimit;
					var jsonEmergencyTip = json.EmergencyTip;
					var jsonDoorDetect = json.DoorDetect;
					var jsonTamperCheck = json.TamperCheck;
					
					$("#alarmEnterDelay").val(jsonEnterDelay);
					$("#alarmOutDelay").val(jsonOutDelay);
					$("#alarmBellDelay").val(jsonBellDelay);
					$("#alarmDetectorLost").val(jsonDetectorLost);
					$("#alarmAcLoss").val(jsonAcLoss);
					
					if(0 == jsonReport)
					{
						$("#armReport").prop("checked", !1);
					}
					else
					{
						$("#armReport").prop("checked", !0);
					}
					
					if(0 == jsonTone)
					{
						$("#armTone").prop("checked", !1);
					}
					else
					{
						$("#armTone").prop("checked", !0);
					}
					
					if(0 == jsonForceArm)
					{
						$("#armForce").prop("checked", !1);
					}
					else
					{
						$("#armForce").prop("checked", !0);
					}
					
					if(0 == jsonAlarmLimit)
					{
						$("#alarmLimit").prop("checked", !1);
					}
					else
					{
						$("#alarmLimit").prop("checked", !0);
					}
					
					if(0 == jsonEmergencyTip)
					{
						$("#emergencyTip").prop("checked", !1);
					}
					else
					{
						$("#emergencyTip").prop("checked", !0);
					}
					
					if(0 == jsonDoorDetect)
					{
						$("#doorDetect").prop("checked", !1);
					}
					else
					{
						$("#doorDetect").prop("checked", !0);
					}
					
					if(0 == jsonTamperCheck)
					{
						$("#wlsTamperCheck").prop("checked", !1);
					}
					else
					{
						$("#wlsTamperCheck").prop("checked", !0);
					}
				}
            },
			
            error: function(e) {   
            }
        })
    },
	
	setAlarmPara: function () {
        var json = {};
		
		json.Cmd=8000;
		json.Id="web";
		json.User=123;
		json.Def="JSON_CMD_SET_ALARM_PARA";
		
		if(parseInt($("#alarmEnterDelay").val(),10)>255)
		{
			alert(g_oCommon.getNodeValue('laParaCfgErr'));
			return ;
		}
		if(parseInt($("#alarmOutDelay").val(),10)>255)
		{
			alert(g_oCommon.getNodeValue('laParaCfgErr'));
			return ;
		}
		if(parseInt($("#alarmBellDelay").val(),10)>30)
		{
			alert(g_oCommon.getNodeValue('laParaCfgErr'));
			return ;
		}
		if(parseInt($("#alarmDetectorLost").val(),10)>99)
		{
			alert(g_oCommon.getNodeValue('laParaCfgErr'));
			return ;
		}
		if(parseInt($("#alarmAcLoss").val(),10)>999)
		{
			alert(g_oCommon.getNodeValue('laParaCfgErr'));
			return ;
		}
		
		json.EnterDelay = $("#alarmEnterDelay").val();
		json.OutDelay = $("#alarmOutDelay").val();
		json.BellDelay = $("#alarmBellDelay").val();
		json.DetectorLost = $("#alarmDetectorLost").val();
		json.AcLoss = $("#alarmAcLoss").val();
		
		if($("#armReport").prop("checked"))
			json.Report = 1;
		else
			json.Report = 0;
		
		if($("#armTone").prop("checked"))
			json.Tone = 1;
		else
			json.Tone = 0;
		
		if($("#armForce").prop("checked"))
			json.ForceArm = 1;
		else
			json.ForceArm = 0;
		
		if($("#alarmLimit").prop("checked"))
			json.AlarmLimit = 1;
		else
			json.AlarmLimit = 0;
		
		if($("#emergencyTip").prop("checked"))
			json.EmergencyTip = 1;
		else
			json.EmergencyTip = 0;
		
		if($("#doorDetect").prop("checked"))
			json.DoorDetect = 1;
		else
			json.DoorDetect = 0;	
		
		if($("#wlsTamperCheck").prop("checked"))
			json.TamperCheck = 1;
		else
			json.TamperCheck = 0;
		
		var jsonStr = JSON.stringify(json);

		$.ajax({
			type: "PUT",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
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
			if(json.Ask == 0)
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
	
	getPhoneCfgInfo: function () {
		var jsonReq = {};
			jsonReq.Cmd=8000;
			jsonReq.Id="web";
			jsonReq.User=123;
			jsonReq.Def="JSON_CMD_GET_PHONE";
		
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
            success: function(data) {
				var json = $.parseJSON(data);
				if(json.Ask == 0)
				{
					var jsonNumber1 = json.Number1;
					var jsonNumber2 = json.Number2;
					var jsonNumber3 = json.Number3;
					var jsonNumber4 = json.Number4;
				
					$("#phoneNumber1").val(jsonNumber1);
					$("#phoneNumber2").val(jsonNumber2);
					$("#phoneNumber3").val(jsonNumber3);
					$("#phoneNumber4").val(jsonNumber4);
				}
            },
			
            error: function(e) {
                
            }
        })
    }, 
	setPhoneCfgInfo: function () {
        var json = {};
		
		json.Cmd=8001;
		json.Id="web";
		json.User=123;
		json.Def="JSON_CMD_SET_PHONE";	
		
		json.Number1 = $("#phoneNumber1").val();
		json.Number2 = $("#phoneNumber2").val();
		json.Number3 = $("#phoneNumber3").val();
		json.Number4 = $("#phoneNumber4").val();
		
		var jsonStr = JSON.stringify(json);
		$.ajax({
			type: "PUT",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
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
				if(json.Ask == 0)
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
				}
			},
			timeOut: function (data){
				alert("操作超时");
			}
		})
	},
}

var g_oAlarmSetting= new AlarmSetting();