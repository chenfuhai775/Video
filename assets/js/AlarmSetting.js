class AlarmSetting {
    constructor() {
        this._lxdAlarmSetting = null;  //AlarmSetting.xml
    }

    //主页面初始化函数
    initPage() {
        getMenuList();//加载菜单列表等文本
        ///getLogList(5,'lTypeAlarm');//获取报警记录
        let szLanguage = $.cookie("language");
        translator.initLanguageSelect(szLanguage);
        this._lxdAlarmSetting = translator.getLanguageXmlDoc("AlarmSetting");
        translator.translatePage(this._lxdAlarmSetting, document);
        this.getAlarmPara();
        this.getPhoneCfgInfo();
        g_oAlarmSetting.syncMsg();
        setInterval("g_oAlarmSetting.syncMsg()", 2000);
    }

    getAlarmPara() {
        let json = {};
        json.Cmd = 7021;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_GET_ALARM_PARA";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
				console.log(data);
                if (0 == data.Ack) {
                    let jsonEnterDelay = data.InDelay;
                    let jsonOutDelay = data.OutDelay;
                    let jsonBellDelay = data.BellDelay;
                    let jsonDetectorLost = data.DetectorLost;
                    let jsonAcLoss = data.AcLoss;
                    let jsonReport = data.Report;
                    let jsonTone = data.Tone;
                    let jsonForceArm = data.ForceArm;
                    let jsonAlarmLimit = data.AlarmLimit;
                    let jsonEmergencyTip = data.EmergencyTip;
                    let jsonDoorDetect = data.DoorDetect;
                    let jsonTamperCheck = data.TamperCheck;

                    $("#alarmEnterDelay").val(jsonEnterDelay);
                    $("#alarmOutDelay").val(jsonOutDelay);
                    $("#alarmBellDelay").val(jsonBellDelay);
                    $("#alarmDetectorLost").val(jsonDetectorLost);
                    $("#alarmAcLoss").val(jsonAcLoss);

                    if (0 == jsonReport) {
                        $("#armReport").prop("checked", !1);
                    } else {
                        $("#armReport").prop("checked", !0);
                    }

                    if (0 == jsonTone) {
                        $("#armTone").prop("checked", !1);
                    } else {
                        $("#armTone").prop("checked", !0);
                    }

                    if (0 == jsonForceArm) {
                        $("#armForce").prop("checked", !1);
                    } else {
                        $("#armForce").prop("checked", !0);
                    }

                    if (0 == jsonAlarmLimit) {
                        $("#alarmLimit").prop("checked", !1);
                    } else {
                        $("#alarmLimit").prop("checked", !0);
                    }

                    if (0 == jsonEmergencyTip) {
                        $("#emergencyTip").prop("checked", !1);
                    } else {
                        $("#emergencyTip").prop("checked", !0);
                    }

                    if (0 == jsonDoorDetect) {
                        $("#doorDetect").prop("checked", !1);
                    } else {
                        $("#doorDetect").prop("checked", !0);
                    }

                    if (0 == jsonTamperCheck) {
                        $("#wlsTamperCheck").prop("checked", !1);
                    } else {
                        $("#wlsTamperCheck").prop("checked", !0);
                    }
                }
            },

            error: function (e) {
            }
        })
    }

    setAlarmPara() {
        let json = {};
        json.Cmd = 7022;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_SET_ALARM_PARA";

        if (parseInt($("#alarmEnterDelay").val(), 10) > 255) {
            alert(g_oCommon.getNodeValue('laParaCfgErr'));
            return;
        }
        if (parseInt($("#alarmOutDelay").val(), 10) > 255) {
            alert(g_oCommon.getNodeValue('laParaCfgErr'));
            return;
        }
        if (parseInt($("#alarmBellDelay").val(), 10) > 30) {
            alert(g_oCommon.getNodeValue('laParaCfgErr'));
            return;
        }
        if (parseInt($("#alarmDetectorLost").val(), 10) > 99) {
            alert(g_oCommon.getNodeValue('laParaCfgErr'));
            return;
        }
        if (parseInt($("#alarmAcLoss").val(), 10) > 999) {
            alert(g_oCommon.getNodeValue('laParaCfgErr'));
            return;
        }

        json.InDelay = parseInt($("#alarmEnterDelay").val(), 10);
        json.OutDelay = parseInt($("#alarmOutDelay").val(), 10);
        json.BellDelay = parseInt($("#alarmBellDelay").val(), 10);
        json.DetectorLost = parseInt($("#alarmDetectorLost").val(), 10);
        json.AcLoss = parseInt($("#alarmAcLoss").val(), 10);

        if ($("#armReport").prop("checked"))
            json.Report = true;
        else
            json.Report = false;

        if ($("#armTone").prop("checked"))
            json.Tone = true;
        else
            json.Tone = false;

        if ($("#armForce").prop("checked"))
            json.ForceArm = true;
        else
            json.ForceArm = false;

        if ($("#alarmLimit").prop("checked"))
            json.AlarmLimit = true;
        else
            json.AlarmLimit = false;

        if ($("#emergencyTip").prop("checked"))
            json.EmergencyTip = true;
        else
            json.EmergencyTip = false;

        if ($("#doorDetect").prop("checked"))
            json.DoorDetect = true;
        else
            json.DoorDetect = false;

        if ($("#wlsTamperCheck").prop("checked"))
            json.TamperCheck = true;
        else
            json.TamperCheck = false;
        let jsonStr = JSON.stringify(json);
		console.log("jsonStr = %s", jsonStr);
        $.ajax({
            type: "PUT",
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
                        tip: g_oCommon.getNodeValue('optOK'),
                        timeout: 1000
                    });
                }
            },
            complete: function (t) {
            }
        })
    }

    getPhoneCfgInfo() {
        let json = {};
        json.Cmd = 7023;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_GET_PHONE";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            async: !0,
            timeout: 15e3,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                if (data.Ack == 0) {
                    let jsonNumber1 = data.L[0].T;
                    let jsonNumber2 = data.L[1].T;
                    let jsonNumber3 = data.L[2].T;
                    let jsonNumber4 = data.L[3].T;

                    $("#phoneNumber1").val(jsonNumber1);
                    $("#phoneNumber2").val(jsonNumber2);
                    $("#phoneNumber3").val(jsonNumber3);
                    $("#phoneNumber4").val(jsonNumber4);
                }
            },
            error: function (e) {
            }
        })
    }

    setPhoneCfgInfo() {
        let json = {};
        json.Cmd = 7024;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_SET_PHONE";
        json.L = [];
		json.L.push({"T": $("#phoneNumber1").val()});
		json.L.push({"T": $("#phoneNumber2").val()});
		json.L.push({"T": $("#phoneNumber3").val()});
		json.L.push({"T": $("#phoneNumber4").val()});
        let jsonStr = JSON.stringify(json);
        $.ajax({
            type: "PUT",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
            timeout: 15e3,
            async: !1,
            processData: !1,
            data: jsonStr,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", 0);
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                if (0 == data.Ack) {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('optOK'),
                        timeout: 1000
                    });
                }
            },
            complete: function (t) {
            }
        })
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

let g_oAlarmSetting = new AlarmSetting();