class ParaSetting {
    constructor() {
        this._lxdParaSetting = null;  //ParaSetting.xml
        this.m_iPortNoMin = 1;
        this.m_iPortNoMax = 65535;
        this.m_iSynchronizeIntervalMin = 1;
        this.m_iSynchronizeIntervalMax = 10080;
		
		this.m_szTimeZone = new Array(-13*4, -12*4, -11*4, -10*4, -9*4-2,-9*4,-8*4,-7*4,-6*4-2,-6*4,-5*4-3,-5*4-2,-5*4,-4*4-2,-4*4,-3*4-2,-3*4,-2*4,-1*4,0*4,1*4,2*4,3*4,3*4+2,4*4,4*4+2,5*4,6*4,7*4,8*4,9*4,10*4,11*4,12*4);
		
		this.m_strTimeZone = new Array("CST-13:00:00","CST-12:00:00","CST-11:00:00","CST-10:00:00","CST-9:30:00","CST-9:00:00","CST-8:00:00","CST-7:00:00","CST-6:30:00","CST-6:00:00","CST-5:45:00","CST-5:30:00","CST-5:00:00","CST-4:30:00","CST-4:00:00","CST-3:30:00","CST-3:00:00","CST-2:00:00","CST-1:00:00","CST+0:00:00","CST+1:00:00","CST+2:00:00","CST+3:00:00","CST+3:30:00","CST+4:00:00","CST+4:30:00","CST+5:00:00","CST+6:00:00","CST+7:00:00","CST+8:00:00","CST+9:00:00","CST+10:00:00","CST+11:00:00","CST+12:00:00");
    }

    //主页面初始化函数
    initPage() {
        getMenuList();//加载菜单列表等文本
        ///getLogList(5,'lTypeAlarm');//获取报警记录
        var szLanguage = $.cookie("language");
        translator.initLanguageSelect(szLanguage);
        this._lxdParaSetting = translator.getLanguageXmlDoc("ParaSetting");
        translator.translatePage(this._lxdParaSetting, document);
        this.getdeviceBasic();
        this.getTimeInfo();
		this.getSysTime();

        var url = window.location.href;
        if (url.indexOf("time") != -1) {
            $("#aBaseInfo").parent().removeClass('am-active');
            $("#tab1").removeClass(' am-in am-active');
            $("#aTimeSettings").parent().addClass('am-active');
            $("#tab2").addClass(' am-in am-active');
        }

        g_oParaSetting.syncMsg();
        setInterval("g_oParaSetting.syncMsg()", 2000);
    }

    getdeviceBasic() {
        let json = {}
        json.Cmd = 7101;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_GET_VERSION";
        let jsonReqStr = JSON.stringify(json);

        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                if (0 == data.Ack) {
                    $("#laAppVersion").val(data.AppVersion);
                    $("#laMcpVersion").val(data.McuVersion);
                    $("#laFirmwareVersion").val(data.FirmwareVersion);
                    $("#laReleaseDate").val(data.ReleaseDate);
                    $("#laChNum").val(data.ChNum);
                    $("#laDiskNum").val(data.DiskNum);
                    $("#laMaxAreaNum").val(data.MaxAreaNum);
                    $("#laMaxDevNum").val(data.MaxDevNum);
                    $("#laMaxWiredDevNum").val(data.MaxWiredDevNum);
                    $("#laDeviceId").val(data.DeviceId);
                    $("#laDeviceSn").val(data.DeviceSn);
                    $("#laDeviceType").val(data.DeviceType);
                }
            }
        })
    }
	
	getSysTime() {
		let that = this;
        let json = {};
		json.Cmd = 7005;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_GET_TIME";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            dataType: "json",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
				console.log(data);
                if (0 == data.Ack) {
					let strLocalTime = data.DateTime;
					$("#teDeviceTime").val(strLocalTime);
                }
            },
            error: function (e) {
            }
        });
	}

    getTimeInfo() {
		let that = this;
        let json = {};
        json.Cmd = 7013;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_GET_NTP";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            dataType: "json",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
                if (0 == data.Ack) {
					console.log(data);
					let szTimeZone = data.TimeZone;
					let strTimeZone = that.m_strTimeZone[29]
					let index = 0;
					for(index=0; index<that.m_szTimeZone.length; index++)
					{
						if(that.m_szTimeZone[index] == szTimeZone)
						{
							json.TimeZone = that.m_strTimeZone[index];
							break;
						}
					}
                    let strHostName = data.Domain;
                    let strNtpPort = data.Port;
                    let strNtpInterval = data.Interval;
                    let o = "NTP";
                    "NTP" == o ? ($("input[name='timeAdjustType']").eq(0).prop("checked", !0), g_oParaSetting.settimeAdjustType(0)) : ($("input[name='timeAdjustType']").eq(1).prop("checked", !0));
                    $("#HostName").val(strHostName);
                    $("#NTPPort").val(strNtpPort);
                    $("#NTPInterval").val(strNtpInterval);
                    $("#timezone").find("option[value=\"" + strTimeZone + "\"]").attr("selected", true);
                    
                }
            },
            error: function (e) {
            }
        });
    }

    settimeAdjustType(t) {
        var that = this;
        1 == t ? ($("#HostName").prop("disabled", !0), $("#NTPPort").prop("disabled", !0), $("#NTPInterval").prop("disabled", !0), $("#chTimeSyncWithPC").prop("disabled", !1), $("#timezone").prop("disabled", !0), $("#chTimeSyncWithPC").prop("checked") ? ($("#teSelectTime").prop("disabled", !0)) : ($("#teSelectTime").prop("disabled", !1)), that.updateSystemTime()) : ($("#HostName").prop("disabled", !1), $("#NTPPort").prop("disabled", !1), $("#NTPInterval").prop("disabled", !1), $("#chTimeSyncWithPC").prop("disabled", !0), $("#teSelectTime").prop("disabled", !0), $("#timezone").prop("disabled", !1))
    }

    timeSyncWithPC() {
        if ($("#chTimeSyncWithPC").prop("checked")) {
            var t = new Date;
            $("#teSelectTime").val(formatDateTime(t, "yyyy-MM-dd HH:mm:ss"));
            $("#teSelectTime").prop("disabled", !0);
        } else
            $("#teSelectTime").prop("disabled", !1);

    }

    updateSystemTime() {
        var that = this;
        if (!$("#chTimeSyncWithPC").prop("checked")) {
            var t = new Date;
            $("#teSelectTime").val(formatDateTime(t, "yyyy-MM-dd HH:mm:ss"));
            $("#teSelectTime").prop("disabled", !0);
            setInterval(that.timeSyncWithPC, 1000);
        }
    }
	
	syncNtpTime()
	{
		let that = this;
        let json = {};
		json.Cmd = 7111;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_SYNC_TIME";
		json.Enable = true;
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            dataType: "json",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
                if (0 == data.Ack) {
                        AMUI.dialog.tip({
                            tip: g_oCommon.getNodeValue('SaveOk'),
                            timeout: 1000
                        });
                    } else {
                        AMUI.dialog.tip({
                            tip: g_oCommon.getNodeValue('SaveFailed'),
                            timeout: 1000
                        });
                    }
            },
            error: function (e) {
            }
        });
	}

    setTimeInfo() {
		let that = this;
        $("#hostNametips").html(""),
            $("#NTPPorttips").html(""),
            $("#NTPIntervaltips").html("");
        let json = {};
        if ($("input[name='timeAdjustType']").eq(0).prop("checked")) {
            if (!CheackStringLenthNull($("#HostName").val(), "hostNametips", "laServerAdd", 64)) return;
            if (!CheackServerIDIntNum($("#NTPPort").val(), "NTPPorttips", "laNtpPort", this.m_iPortNoMin, this.m_iPortNoMax)) return;
            if (!CheackServerIDIntNum($("#NTPInterval").val(), "NTPIntervaltips", "laNtpInterval", this.m_iSynchronizeIntervalMin, this.m_iSynchronizeIntervalMax)) return;
			
			let strTimeZoneTmp = $("#timezone").val();
			let index = 0;
            json.Cmd = 7014;
            json.Id = "123123123";
            json.User = 12345678;
            json.Def = "JSON_CMD_SET_NTP";
			
			json.TimeZone = this.m_szTimeZone[29];
			for(index=0; index<this.m_strTimeZone.length; index++)
			{
				if(this.m_strTimeZone[index] == strTimeZoneTmp)
				{
					json.TimeZone = this.m_szTimeZone[index];
					break;
				}
			}
            json.Domain = $("#HostName").val();
            json.Port = parseInt($("#NTPPort").val(), 10);
            json.Interval = parseInt($("#NTPInterval").val(), 10);
            let jsonStr = JSON.stringify(json);
			console.log("jsonStr  = %s", jsonStr);
            $.ajax({
                type: "PUT",
                url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
                dataType: "json",
                data:jsonStr,
                timeout: 15e3,
                async: !1,
                processData: !1,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("If-Modified-Since", "0");
                    xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
                },
                success: function (data) {
                    if (0 == data.Ack) {
						that.syncNtpTime();
                    } else {
                        AMUI.dialog.tip({
                            tip: g_oCommon.getNodeValue('SaveFailed'),
                            timeout: 1000
                        });
                    }
                },
                complete: function (t) {
                }
            })
        } else {
            json.Cmd = 7006;
            json.Id = "123123123";
            json.User = 12345678;
            json.Def = "JSON_CMD_SET_TIME";
            json.TimeZone = 255;
            json.DateTime = $("#teSelectTime").val();
            let jsonReqStr = JSON.stringify(json);
            $.ajax({
                type: "post",
                url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
                dataType: "json",
                timeout: 15e3,
                async: !1,
                processData: !1,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("If-Modified-Since", "0");
                    xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
                },
                success: function (data) {
                    if (0 == data.Ack) {
                        AMUI.dialog.tip({
                            tip: g_oCommon.getNodeValue('SaveOk'),
                            timeout: 1000
                        });
                    } else {
                        AMUI.dialog.tip({
                            tip: g_oCommon.getNodeValue('SaveFailed'),
                            timeout: 1000
                        });
                    }
                },
                complete: function (t) {
                }
            })
        }
    }

    displayLastMsg() {
        if (!($("#lastMsgLog").hasClass("am-dropdown-flip") && $("#lastMsgLog").hasClass("am-active"))) {
            getLogList(5, 'lTypeAlarm');
        }
    }

    syncMsg() {
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/getStatusInfo",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
                var json = $.parseJSON(data);

                if (json.Ask == 0) {
                    var eventNum = json.EventNum;

                    if (!($("#lastMsgLog").hasClass("am-dropdown-flip") && $("#lastMsgLog").hasClass("am-active")))
                        $("#alarmInfoNum").text(eventNum);
                }
            },
            timeOut: function (data) {
                alert("操作超时");
            }
        })
    }

}

var g_oParaSetting = new ParaSetting();