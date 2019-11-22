function ParaSetting() {
    this._lxdParaSetting = null;  //ParaSetting.xml
}
var m_iPortNoMin = 1;
var m_iPortNoMax = 65535;
var m_iSynchronizeIntervalMin = 1;
var m_iSynchronizeIntervalMax = 10080;

ParaSetting.prototype = {
	
	//主页面初始化函数	
	initPage: function () {
		getMenuList();//加载菜单列表等文本
		///getLogList(5,'lTypeAlarm');//获取报警记录
		var szLanguage = $.cookie("language");
		translator.initLanguageSelect(szLanguage);
		this._lxdParaSetting = translator.getLanguageXmlDoc("ParaSetting");
		translator.translatePage(this._lxdParaSetting, document);
		this.getdeviceBasic();
		this.getTimeInfo();
		
		var url = window.location.href;
		if(url.indexOf("time") != -1){
			$("#aBaseInfo").parent().removeClass('am-active');
			$("#tab1").removeClass(' am-in am-active');
			$("#aTimeSettings").parent().addClass('am-active');
			$("#tab2").addClass(' am-in am-active');
		}
		
		g_oParaSetting.syncMsg();
		setInterval("g_oParaSetting.syncMsg()", 2000);
	},
	
	getdeviceBasic: function () {
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/getDeviceBasic",
            async: !0,
            timeout: 15e3,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", "0");
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
            success: function(data) {
				console.log("data = %s \n", data);
				var statusCode = $.parseJSON(data).statusCode;
				var json = $.parseJSON(data);
				if(statusCode==1){
					
					var deviceType = json.DeviceType;
					var deviceSn = json.DeviceSn;
					var firmwareVer = json.FirmwareVersion;
					var devId = json.DeviceID;
					var channelNum = json.ChannelNum;
					var diskNum = json.DiskNum;
					var maxAreaNum = json.MaxAreaNum;
					var maxDevNum = json.MaxDevNum;
					var maxWiredDenNum = json.MaxWiredDevNum;
					var releaseDate = json.ReleaseDate;
					var devQrcode = json.DevQrcode;
					
					$("#ChannelNum").val(channelNum);
					$("#DiskNum").val(diskNum);
					$("#MaxAreaNum").val(maxAreaNum);
					$("#MaxDevNum").val(maxDevNum);
					$("#MaxWiredDevNum").val(maxWiredDenNum);
					$("#DeviceType").val(deviceType);
					$("#DeviceSn").val(deviceSn);
					$("#FirmwareVersion").val(firmwareVer);
					$("#ReleaseDate").val(releaseDate);
					$("#DeviceID").val(devId);	
					var QRCode = $.AMUI.qrcode;
					$("#devQrcode").html(new QRCode({text: devQrcode, width: '128', height: '128'}));
				}
            }
        })
    },
	
	getTimeInfo: function() {
		var that = this;
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/getNtpInfo",
            async: !0,
            timeout: 15e3,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", "0");
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
            success: function(data) {
                console.log("data = %s \n", data);
				//setInterval(that.updateSystemTime, 1000);
				var r = $.parseJSON(data).TimeZone;
				var strHostName = $.parseJSON(data).HostName;
				var strNtpPort = $.parseJSON(data).NtpPort;
				var strNtpInterval = $.parseJSON(data).NtpInterval;
				var strLocalTime = $.parseJSON(data).LocalTime;
				var o = $.parseJSON(data).TimeMode;
				"NTP" == o ? ($("input[name='timeAdjustType']").eq(0).prop("checked", !0), that.settimeAdjustType(0)) : ($("input[name='timeAdjustType']").eq(1).prop("checked", !0));
				$("#HostName").val(strHostName);
				$("#NTPPort").val(strNtpPort);
				$("#NTPInterval").val(strNtpInterval);
				$("#timezone").find("option[value=\""+r+"\"]").attr("selected",true);
				$("#teDeviceTime").val(strLocalTime);
            },
            error: function(e) {
                
            }
        })
    },
	
	settimeAdjustType: function(t) {
		var that = this;
        1 == t ? ($("#HostName").prop("disabled", !0), $("#NTPPort").prop("disabled", !0), $("#NTPInterval").prop("disabled", !0), $("#chTimeSyncWithPC").prop("disabled", !1), $("#timezone").prop("disabled", !0), $("#chTimeSyncWithPC").prop("checked") ? ($("#teSelectTime").prop("disabled", !0)) : ($("#teSelectTime").prop("disabled", !1)), that.updateSystemTime()) : ($("#HostName").prop("disabled", !1), $("#NTPPort").prop("disabled", !1), $("#NTPInterval").prop("disabled", !1), $("#chTimeSyncWithPC").prop("disabled", !0), $("#teSelectTime").prop("disabled", !0), $("#timezone").prop("disabled", !1))
    },
	
	timeSyncWithPC: function() {
        if ($("#chTimeSyncWithPC").prop("checked")) {
            var t = new Date;
            $("#teSelectTime").val(formatDateTime(t, "yyyy-MM-dd HH:mm:ss"));
            $("#teSelectTime").prop("disabled", !0);			
        } 
		else 
			$("#teSelectTime").prop("disabled", !1);
		
    },
	
	updateSystemTime: function() {
		var that = this;
        if (!$("#chTimeSyncWithPC").prop("checked")) {
			var t = new Date;
            $("#teSelectTime").val(formatDateTime(t, "yyyy-MM-dd HH:mm:ss"));
            $("#teSelectTime").prop("disabled", !0);
			setInterval(that.timeSyncWithPC, 1000);
        }
    },
	setTimeInfo: function(){
		$("#hostNametips").html(""),
        $("#NTPPorttips").html(""),
        $("#NTPIntervaltips").html("");
		var json = {};
		if ($("input[name='timeAdjustType']").eq(0).prop("checked")) {
            if (!CheackStringLenthNull($("#HostName").val(), "hostNametips", "laServerAdd", 64)) return;
            if (!CheackServerIDIntNum($("#NTPPort").val(), "NTPPorttips", "laNtpPort", m_iPortNoMin, m_iPortNoMax)) return;
            if (!CheackServerIDIntNum($("#NTPInterval").val(), "NTPIntervaltips", "laNtpInterval", m_iSynchronizeIntervalMin, m_iSynchronizeIntervalMax)) return;
			json.TimeMode="NTP";
			json.HostName = $("#HostName").val();
			json.NtpPort = $("#NTPPort").val();
			json.NtpInterval = $("#NTPInterval").val();
			var jsonStr = JSON.stringify(json);
			console.log("setNtpInfo jsonStr = %s \n", jsonStr);
			$.ajax({
				type: "PUT",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/setNtpInfo",
				timeout: 15e3,
				async: !1,
				processData: !1,
				data: jsonStr,
				beforeSend: function(xhr) {
					xhr.setRequestHeader("If-Modified-Since", "0");
					xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
				},
				success: function(data) {
					var json_rcv = $.parseJSON(data);
					if(json_rcv.statusCode == 1)
					{	
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('SaveOk'),
							timeout:1000
						});
					}
					else{
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('SaveFailed'),
							timeout:1000
						});
					}
				},
				
				complete: function(t) {
				}
			})
        }
		else {
			json.TimeMode="manual";
			json.LocalTime= $("#teSelectTime").val();
			var jsonStr = JSON.stringify(json);
			console.log("setTimeInfo jsonStr = %s \n", jsonStr);
			$.ajax({
				type: "PUT",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/setDevTimes",
				timeout: 15e3,
				async: !1,
				processData: !1,
				data: jsonStr,
				beforeSend: function(xhr) {
					xhr.setRequestHeader("If-Modified-Since", "0");
					xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
				},
				success: function(data) {
					var json_rcv = $.parseJSON(data);
					if(json_rcv.statusCode == 1)
					{	
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('SaveOk'),
							timeout:1000
						});
					}
					else{
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('SaveFailed'),
							timeout:1000
						});
					}
				},
				complete: function(t) {
				}
			})
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
				}
			},
			timeOut: function (data){
				alert("操作超时");
			}
		})
	},
}

var g_oParaSetting= new ParaSetting();