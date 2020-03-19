function System() {
    this._lxdSystem = null;  //System.xml
}

var m_iDiskFormatTimerID = -1;
var m_iUpdateTimerID = -1;
var m_iUpdateFlag = "success";

System.prototype = {
    //主页面初始化函数
    initPage: function () {
        getMenuList();//加载菜单列表等文本
        ///getLogList(5,'lTypeAlarm');//获取报警记录
        var szLanguage = $.cookie("language");
        translator.initLanguageSelect(szLanguage);
        this._lxdSystem = translator.getLanguageXmlDoc("System");
        translator.translatePage(this._lxdSystem, document);
        this.getAllHardDiskInfo();
        this.getTimerCfgInfo();
        this.getInstallCfgInfo();

        g_oSystem.syncMsg();
        setInterval("g_oSystem.syncMsg()", 2000);
    },

    getAllHardDiskInfo: function () {

        let json = {};
        json.Cmd = 7109;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_GET_HARD_DISK_LIST";
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
				console.info(data);
                if (data.Ack == 0) {
                    let diskNO, capacity, freeSpace, diskStatus
                    let TableList = "";
                    data.L.forEach((item, index, array) => {
                        diskNO = item.Num;
                        capacity = (item.Total / 1024).toFixed(2) + "GB";
                        freeSpace = (item.Use / 1024).toFixed(2) + "GB";
                        diskStatus = item.State;
                        TableList += " <tr>";
                        TableList += "     <td>" + diskNO + "</td>";
                        TableList += "     <td>" + capacity + "</td>";
                        TableList += "     <td>" + freeSpace + "</td>";
                        TableList += "     <td>" + g_oCommon.getNodeValue(diskStatus) + "</td>";
                        TableList += "     <td>";
                        TableList += "		<div class='am-btn-toolbar'>";
                        TableList += "			<div class='am-btn-group am-btn-group-sm'>";
                        TableList += "     			<button class='am-btn am-btn-default am-btn-sm am-text-secondary' id='btn-" + diskNO + "' onclick='g_oSystem.formatDiskClick(\"" + diskNO + "\")'>" + g_oCommon.getNodeValue('formatDisk') + "</button>";
                        TableList += "     		</div>";
                        TableList += "       </div>";
                        TableList += "     </td>";
                        TableList += " </tr>";
                    });
                    document.getElementById("diskList").innerHTML = TableList;
                }
            },
            error: function (e) {
            }
        })
    },

    formatDiskClick: function (diskNO) {
        let that = this;
        AMUI.dialog.confirm({
            title: translator.translateNode(this._lxdSystem, "dialogTitle"),
            content: translator.translateNode(this._lxdSystem, "dialogContent1"),
            btnConfirm: translator.translateNode(this._lxdSystem, "btnConfirm"),
            btnCancel: translator.translateNode(this._lxdSystem, "btnCancel"),
            onConfirm: function () {
                $('#btn-' + diskNO).attr('data-am-loading', "{spinner: 'spinner', loadingText: '" + g_oCommon.getNodeValue('tipsDiskFormatWait') + "'}");
                $('#btn-' + diskNO).button('loading');
                let json = {};
                json.Cmd = 7110;
                json.Id = "123123123";
                json.User = 12345678;
                json.Def = "JSON_CMD_FORMAT_HARD_DISK";
                json.Num = diskNO;
                let jsonStr = JSON.stringify(json);
                $.ajax({
                    type: "PUT",
                    url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
                    async: !0,
                    timeout: 15e3,
                    data: jsonStr,
                    dataType: "json",
                    beforeSend: function (xhr) {
                    },
                    success: function (data) {
                        if (0 == data.Ack) {
                            m_iDiskFormatTimerID = setInterval(function () {
                                that.FormatProgress()
                            }, 1000);
                        } else {
                            AMUI.dialog.tip({
                                tip: g_oCommon.getNodeValue('tipsFormatFailed'),
                                timeout: 1000
                            });
                        }
                    },
                    timeOut: function (data) {
                        alert("请求数据超时");
                    }
                })
            },
            onCancel: function () {
                console.log('onCancel')
            }
        });
    },

    FormatProgress: function () {
        let that = this;
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/formatStatus",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", 0);
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                var json = $.parseJSON(data);

                if (json.statusCode == 1) {

                    that.getAllHardDiskInfo();

                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('tipsDiskFormatSucess'),
                        timeout: 1000
                    });

                    clearInterval(m_iDiskFormatTimerID);
                    m_iDiskFormatTimerID = -1;
                } else {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('tipsFormatFailed'),
                        timeout: 1000
                    });
                }
            },
            error: function () {
            }
        })
    },

	DayAllClick: function () {
		if ($("#selDayAll").prop("checked")) {
			$("#chSunday").prop("checked", !0);
			$("#chMonday").prop("checked", !0);
			$("#chTuesday").prop("checked", !0);
			$("#chWednesday").prop("checked", !0);
			$("#chThursday").prop("checked", !0);
			$("#chFriday").prop("checked", !0);
			$("#chSaturday").prop("checked", !0);
		} else {
			$("#chSunday").prop("checked", !1);
			$("#chMonday").prop("checked", !1);
			$("#chTuesday").prop("checked", !1);
			$("#chWednesday").prop("checked", !1);
			$("#chThursday").prop("checked", !1);
			$("#chFriday").prop("checked", !1);
			$("#chSaturday").prop("checked", !1);
		}
	},
	//获取定时重启时间
    getTimerCfgInfo: function () {
        let json = {};
        json.Cmd = 7015;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_GET_MAINTENANCE";
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
				console.log(data);
                if (0 == data.Ack) {
                    let jsonTime = data.Time;
                    let jsonSunday = data.Week[0];
                    let jsonMonday = data.Week[1];
                    let jsonTuesday = data.Week[2];
                    let jsonWednesday = data.Week[3];
                    let jsonThursday = data.Week[4];
                    let jsonFriday = data.Week[5];
                    let jsonSaturday = data.Week[6];

                    $("#mainetanceTime").val(jsonTime);
                    if (0 == jsonSunday) $("#chSunday").prop("checked", !1);
                    else $("#chSunday").prop("checked", !0);

                    if (0 == jsonMonday) $("#chMonday").prop("checked", !1);
                    else $("#chMonday").prop("checked", !0);

                    if (0 == jsonTuesday) $("#chTuesday").prop("checked", !1);
                    else $("#chTuesday").prop("checked", !0);

                    if (0 == jsonWednesday) $("#chWednesday").prop("checked", !1);
                    else $("#chWednesday").prop("checked", !0);

                    if (0 == jsonThursday) $("#chThursday").prop("checked", !1);
                    else $("#chThursday").prop("checked", !0);

                    if (0 == jsonFriday) $("#chFriday").prop("checked", !1);
                    else $("#chFriday").prop("checked", !0);

                    if (0 == jsonSaturday) $("#chSaturday").prop("checked", !1);
                    else $("#chSaturday").prop("checked", !0);
                }
            },
            error: function (e) {
            }
        })
    },
	//设置定时重启时间
    setTimerCfgInfo: function () {
        let json = {};
        json.Cmd = 7016;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_CMD_SET_MAINTENANCE";
        json.Time = $("#mainetanceTime").val();
        let Week = [];
        if ($("#chSunday").prop("checked")) Week[0] = 1;
        else Week[0] = 0;
        if ($("#chMonday").prop("checked")) Week[1] = 1;
        else Week[1] = 0;
        if ($("#chTuesday").prop("checked")) Week[2] = 1;
        else Week[2] = 0;
        if ($("#chWednesday").prop("checked")) Week[3] = 1;
        else Week[3] = 0;
        if ($("#chThursday").prop("checked")) Week[4] = 1;
        else Week[4] = 0;
        if ($("#chFriday").prop("checked")) Week[5] = 1;
        else Week[5] = 0;
        if ($("#chSaturday").prop("checked")) Week[6] = 1;
        else Week[6] = 0;
        json.Week = Week;
        let jsonStr = JSON.stringify(json);
		console.log("jsonStr = %s ", jsonStr);
        $.ajax({
            type: "PUT",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
            timeout: 15e3,
            async: !1,
			dataType: "json",
            processData: !1,
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
    },

    getInstallCfgInfo: function () {
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/paraCfg/getInstallPara",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", "0");
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },
            success: function (data) {
                var json = $.parseJSON(data);
                if (json.statusCode == 1) {
                    var jsonChn1 = json.Chn1;
                    var jsonChn2 = json.Chn2;
                    var jsonChn3 = json.Chn3;
                    var jsonChn4 = json.Chn4;
                    var jsonRebootDelayCheck = json.RebootDelayCheck;

                    if (0 == jsonChn1) {
                        $("#chn1").prop("checked", !1);
                    } else {
                        $("#chn1").prop("checked", !0);
                    }

                    if (0 == jsonChn2) {
                        $("#chn2").prop("checked", !1);
                    } else {
                        $("#chn2").prop("checked", !0);
                    }

                    if (0 == jsonChn3) {
                        $("#chn3").prop("checked", !1);
                    } else {
                        $("#chn3").prop("checked", !0);
                    }

                    if (0 == jsonChn4) {
                        $("#chn4").prop("checked", !1);
                    } else {
                        $("#chn4").prop("checked", !0);
                    }


                    $("#rebootDelayCheck").val(jsonRebootDelayCheck);

                }
            },

            error: function (e) {

            }
        })
    },

    setInstallCfgInfo: function () {
        var json = {};
        if ($("#chn1").prop("checked"))
            json.Chn1 = 1;
        else
            json.Chn1 = 0;

        if ($("#chn2").prop("checked"))
            json.Chn2 = 1;
        else
            json.Chn2 = 0;

        if ($("#chn3").prop("checked"))
            json.Chn3 = 1;
        else
            json.Chn3 = 0;

        if ($("#chn4").prop("checked"))
            json.Chn4 = 1;
        else
            json.Chn4 = 0;

        json.RebootDelayCheck = $("#rebootDelayCheck").val();

        var jsonStr = JSON.stringify(json);

        $.ajax({
            type: "PUT",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/paraCfg/setInstallPara",
            timeout: 15e3,
            async: !1,
            processData: !1,
            data: jsonStr,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("If-Modified-Since", 0);
                xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
            },

            success: function (data) {
                var json = $.parseJSON(data);
                if (json.statusCode != undefined) {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('optOK'),
                        timeout: 1000
                    });
                }
            },

            complete: function (t) {

            }

        })
    },
    //重启
    restartDev: function () {
        AMUI.dialog.confirm({
            title: translator.translateNode(this._lxdSystem, "dialogTitle"),
            content: translator.translateNode(this._lxdSystem, "RestartAsk"),
            btnConfirm: translator.translateNode(this._lxdSystem, "btnConfirm"),
            btnCancel: translator.translateNode(this._lxdSystem, "btnCancel"),
            onConfirm: function () {
                $.ajax({
                    type: "GET",
                    url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/reboot",
                    timeout: 15e3,
                    async: !1,
                    processData: !1,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("If-Modified-Since", 0);
                        xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
                    },
                    success: function (data) {

                    },
                    complete: function (t) {
                    }
                })
                AMUI.dialog.loading({
                    title: g_oCommon.getNodeValue('Restart'),
                });
                //关闭loading窗口
                //$('#my-modal-loading').modal(close);
            },
            onCancel: function () {
                console.log('onCancel')
            }
        });
    },
    //系统还原
    toRestoneDef: function (t) {
        AMUI.dialog.confirm({
            title: translator.translateNode(this._lxdSystem, "dialogTitle"),
            content: translator.translateNode(this._lxdSystem, "tipsRestoreReboot"),
            btnConfirm: translator.translateNode(this._lxdSystem, "btnConfirm"),
            btnCancel: translator.translateNode(this._lxdSystem, "btnCancel"),
            onConfirm: function () {
                $.ajax({
                    type: "GET",
                    url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/factoryReset" + t,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("If-Modified-Since", 0);
                        xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
                    },
                    success: function (data) {

                    },

                    error: function (e) {

                    }
                })

                AMUI.dialog.loading({
                    title: g_oCommon.getNodeValue('Restart'),
                });
            },
            onCancel: function () {
                console.log('onCancel')
            }
        });

    },
    //载入配置
    importParam: function () {
        $(".formtips").html("");

        var laMessage = document.getElementById('laMessage1');
        var filePath = $("#ImportFile").val();
        if ("" == filePath) {
            laMessage.innerHTML = "<span id='doc-single-toggle-status' class='am-text-danger'>" + g_oCommon.getNodeValue('ImportUping') + "</span>";
        } else {

            AMUI.dialog.confirm({
                title: translator.translateNode(this._lxdSystem, "dialogTitle"),
                content: translator.translateNode(this._lxdSystem, "ImportRebootTips"),
                btnConfirm: translator.translateNode(this._lxdSystem, "btnConfirm"),
                btnCancel: translator.translateNode(this._lxdSystem, "btnCancel"),
                onConfirm: function () {
                    $("#btnImportFile").prop("disabled", !0);
                    /*$.ajaxFileUpload({
                        type:"POST",
                        url: "/paraCfg/importConfiguration",
                        dataType:"json",
                        fileElementId:'ImportFile',
                        cache:false,
                        success:function(data){

                        }
                    });*/
                    var progressbar = {
                        init: function () {
                            var progress = document.getElementById("progress1");
                            var bar = document.getElementById("bar1");
                            var total = document.getElementById('total1');
                            var laMessage = document.getElementById('laMessage1');
                            var count = 0;
                            progress.style.display = "block";
                            //通过间隔定时器实现百分比文字效果,通过计算CSS动画持续时间进行间隔设置
                            var timer = setInterval(function (e) {
                                count++;
                                total.innerHTML = count + '%';
                                bar.style.width = count + '%';
                                if (count === 100) {
                                    clearInterval(timer);
                                    $("#btnImportFile").prop("disabled", !1);
                                    progress.style.display = "none";
                                    laMessage.innerHTML = "<span id='doc-single-toggle-status' class='am-text-success'>" + g_oCommon.getNodeValue('ImportSuccess') + "</span>";
                                }
                            }, 100);
                        }
                    };
                    progressbar.init();

                },
                onCancel: function () {
                    console.log('onCancel')
                }
            });
        }
    },
    //配置导出
    exportParam: function () {
        $(".formtips").html("");
        var laMessage = document.getElementById('laMessage3');
        laMessage.innerHTML = "<span id='doc-single-toggle-status' class='am-text-success'>" + g_oCommon.getNodeValue('ExportSuccess') + "</span>";
    },
    //升级
    startUp: function () {
        var that = this;
        $(".formtips").html("");
        var laMessage = document.getElementById('laMessage2');
        var strUrl;
        var fileSel;
        /* if(!(null == /(msie\s|trident.*rv:)([\w.]+)/.exec(navigator.userAgent.toLowerCase())))
        {
            laMessage.innerHTML="<span id='doc-single-toggle-status' class='am-text-danger'>"+g_oCommon.getNodeValue('tipsIEBrowserNoSupport')+"</span>";
            return ;
        } */
        var filePath = $("#UpdateFile").val();
        if ("" == filePath) {
            laMessage.innerHTML = "<span id='doc-single-toggle-status' class='am-text-danger'>" + g_oCommon.getNodeValue('jsUpdateFile') + "</span>";
        } else {
            console.log("filePath = %s\n", filePath);
            AMUI.dialog.confirm({
                title: translator.translateNode(this._lxdSystem, "dialogTitle"),
                content: translator.translateNode(this._lxdSystem, "tipsUpgradeReboot"),
                btnConfirm: translator.translateNode(this._lxdSystem, "btnConfirm"),
                btnCancel: translator.translateNode(this._lxdSystem, "btnCancel"),
                onConfirm: function () {
                    $("#btnUpgrade").prop("disabled", !0);
                    fileSel = $("#updateFileSel").val();
                    if (fileSel == "0")
                        strUrl = "/system/upgrade";
                    else
                        strUrl = "/system/McuUpgrade";

                    $.ajaxFileUpload({
                        type: "post",
                        url: strUrl,
                        dataType: "json",
                        fileElementId: 'UpdateFile',
                        cache: false,
                        success: function (data) {
                        }
                    });
                    m_iUpdateFlag = "upgrading";
                    var progressbar = {
                        init: function () {
                            var progress = document.getElementById("progress2");
                            var bar = document.getElementById("bar2");
                            var total = document.getElementById('total2');
                            var laMessage = document.getElementById('laMessage2');
                            var count = 0;
                            progress.style.display = "block";
                            //通过间隔定时器实现百分比文字效果,通过计算CSS动画持续时间进行间隔设置
                            var timer = setInterval(function (e) {
                                count++;
                                total.innerHTML = count + '%';
                                bar.style.width = count + '%';

                                if ("upgrading" != m_iUpdateFlag) {
                                    clearInterval(timer);
                                    $("#btnUpgrade").prop("disabled", !1);
                                    progress.style.display = "none";
                                    if ((m_iUpdateFlag == "success")) {
                                        laMessage.innerHTML = "<span id='doc-single-toggle-status' class='am-text-success'>" + g_oCommon.getNodeValue('UpgradeSuccess') + "</span>";
                                    } else if (m_iUpdateFlag == "same") {
                                        laMessage.innerHTML = "<span id='doc-single-toggle-status' class='am-text-success'>" + g_oCommon.getNodeValue('tipsSameSoftVersion') + "</span>";
                                    } else if (m_iUpdateFlag == "error") {
                                        laMessage.innerHTML = "<span id='doc-single-toggle-status' class='am-text-success'>" + g_oCommon.getNodeValue('tipsUpgradeFileErr') + "</span>";
                                    } else {
                                        laMessage.innerHTML = "<span id='doc-single-toggle-status' class='am-text-success'>" + g_oCommon.getNodeValue('tipsUpgradeTimeout') + "</span>";
                                    }
                                } else if (count === 100) {
                                    clearInterval(timer);
                                    $("#btnUpgrade").prop("disabled", !1);
                                    progress.style.display = "none";
                                    laMessage.innerHTML = "<span id='doc-single-toggle-status' class='am-text-success'>" + g_oCommon.getNodeValue('tipsUpgradeTimeout') + "</span>";
                                }
                            }, 2000);
                        }
                    };
                    progressbar.init();
                    m_iUpdateTimerID = setInterval(function () {
                        that.getUpgradeStatus()
                    }, 2000);
                },
                onCancel: function () {
                    console.log('onCancel')
                }
            });
        }
    },
    //获取升级状态
    getUpgradeStatus: function () {
        var laMessage = document.getElementById('laMessage2');
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/system/getUpgradeStatus",
            async: !0,
            timeout: 15e3,
            success: function (data) {
                if (data != "") {
                    var json = $.parseJSON(data);
                    var status = json.Status;
                    if (json.statusCode != undefined) {
                        m_iUpdateFlag = status;

                        clearInterval(m_iUpdateTimerID);
                    }
                }
            }
        });
    },

    displayLastMsg: function () {
        if (!($("#lastMsgLog").hasClass("am-dropdown-flip") && $("#lastMsgLog").hasClass("am-active"))) {
            getLogList(5, 'lTypeAlarm');
        }
    },

    syncMsg: function () {
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
    },
}

var g_oSystem = new System();