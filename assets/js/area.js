class Area {
    constructor() {
        this.areaChkStatus = ['laUnknown', 'laWithdrawal', 'laStayBehind', 'laDeployDefence'];
        this.areaList = [];
        this.curAreaNo = 0;
    }

    //主页面初始化函数
    initPage() {
        getMenuList();//加载菜单列表等文本
        ///getLogList(5,'lTypeAlarm');//获取报警记录
        let szLanguage = $.cookie("language");
        translator.initLanguageSelect(szLanguage);
        this._lxdArea = translator.getLanguageXmlDoc("Area");
        translator.translatePage(this._lxdArea, document);
        this._GetAreaTable();
        g_oArea.syncMsg();
        setInterval("g_oArea.syncMsg()", 2000);
    }

    //获取区域列表
    _GetAreaTable() {
        let json = {}
        json.Cmd = 1101;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = "JSON_AREA_LIST";
        let jsonReqStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonReqStr) + "&",
            dataType: "json",
            async: !0,
            timeout: 15e3,
            beforeSend: function (xhr) {
            },
            success: function (data) {
                if (0 == data.Ack) {
                    g_oArea.areaList = data.L;
                    let TableList = "";
                    let areaNo, areaType, areaName, strAreaType, areaStatus, strAreaStatus;
                    data.L.forEach((item, index, array) => {
                        areaNo = item.A;
                        areaType = item.T;
                        areaName = item.N;
                        areaStatus = item.S;
                        switch (areaType) {
                            default:
                            case 0:
                                strAreaType = g_oCommon.getNodeValue('strUndefine');
                                break;
                            case 1:
                                strAreaType = g_oCommon.getNodeValue('strSala');
                                break;
                            case 2:
                                strAreaType = g_oCommon.getNodeValue('strBedroom');
                                break;
                            case 3:
                                strAreaType = g_oCommon.getNodeValue('strAisle');
                                break;
                            case 4:
                                strAreaType = g_oCommon.getNodeValue('strKitchen');
                                break;
                            case 5:
                                strAreaType = g_oCommon.getNodeValue('strToilet');
                                break;
                            case 6:
                                strAreaType = g_oCommon.getNodeValue('strGarden');
                                break;
                            case 7:
                                strAreaType = g_oCommon.getNodeValue('strCarport');
                                break;
                            case 8:
                                strAreaType = g_oCommon.getNodeValue('strBalcony');
                                break;
                            case 9:
                                strAreaType = g_oCommon.getNodeValue('strBathRoom');
                                break;
                            case 10:
                                strAreaType = g_oCommon.getNodeValue('strBar');
                                break;
                            case 11:
                                strAreaType = g_oCommon.getNodeValue('strStudyRoom');
                                break;
                            case 12:
                                strAreaType = g_oCommon.getNodeValue('strKidsRoom');
                                break;
                            case 13:
                                strAreaType = g_oCommon.getNodeValue('strDiningHall');
                                break;
                        }

                        switch (areaStatus) {
                            default:
                            case 0:
                                strAreaStatus = g_oCommon.getNodeValue('laUnknown');
                                break;
                            case 1:
                                strAreaStatus = g_oCommon.getNodeValue('laWithdrawal');
                                break;

                            case 2:
                                strAreaStatus = g_oCommon.getNodeValue('laStayBehind');
                                break;

                            case 3:
                                strAreaStatus = g_oCommon.getNodeValue('laDeployDefence');
                                break;
                        }

                        TableList += " <tr>";
                        TableList += "     <td>" + areaNo + "</td>";
                        TableList += "     <td>" + areaName + "</td>";
                        TableList += "     <td>" + strAreaType + "</td>";
                        TableList += "     <td>" + strAreaStatus + "</td>";
                        TableList += "     <td>";
                        TableList += "		<div class='am-btn-toolbar'>";
                        TableList += "			<div class='am-btn-group am-btn-group-sm'>";
                        TableList += "     			<button class='am-btn am-btn-default am-btn-sm am-text-secondary' onclick='g_oArea.editArea(\"" + areaNo + "\")'><span class='am-icon-pencil-square-o'></span> " + g_oCommon.getNodeValue('btnEdit') + "</button>";
                        TableList += "     			<button class='am-btn am-btn-default am-btn-sm am-text-danger' onclick='g_oArea.delArea(\"" + areaNo + "\")'><span class='am-icon-trash-o'></span> " + g_oCommon.getNodeValue('btnDel') + "</button>";
                        TableList += "     		</div>";
                        TableList += "       </div>";
                        TableList += "     </td>";
                        TableList += " </tr>";
                    });
                    document.getElementById("areaList").innerHTML = TableList;
                }
            },

            timeOut: function (data) {
                alert("请求数据超时");
            }
        })
    }

    areaTypeInit() {
        var index;
        document.getElementById("areaTypeSel").options.length = 0;
        for (index = 1; 14 > index; index++) {
            var oOption = document.createElement("option");
            var strText;
            switch (index) {
                default:
                case 0:
                    strText = g_oCommon.getNodeValue("strUndefine");
                    break;
                case 1:
                    strText = g_oCommon.getNodeValue("strSala");
                    break;
                case 2:
                    strText = g_oCommon.getNodeValue("strBedroom");
                    break;
                case 3:
                    strText = g_oCommon.getNodeValue("strAisle");
                    break;
                case 4:
                    strText = g_oCommon.getNodeValue("strKitchen");
                    break;
                case 5:
                    strText = g_oCommon.getNodeValue("strToilet");
                    break;
                case 6:
                    strText = g_oCommon.getNodeValue("strGarden");
                    break;
                case 7:
                    strText = g_oCommon.getNodeValue("strCarport");
                    break;
                case 8:
                    strText = g_oCommon.getNodeValue("strBalcony");
                    break;
                case 9:
                    strText = g_oCommon.getNodeValue("strBathRoom");
                    break;
                case 10:
                    strText = g_oCommon.getNodeValue("strBar");
                    break;
                case 11:
                    strText = g_oCommon.getNodeValue("strStudyRoom");
                    break;
                case 12:
                    strText = g_oCommon.getNodeValue("strKidsRoom");
                    break;
                case 13:
                    strText = g_oCommon.getNodeValue("strDiningHall");
                    break;
            }

            document.getElementById("areaTypeSel").options.add(oOption);
            oOption.value = index;
            oOption.innerText = strText;
        }
    }

    areaChkStatusInit() {
        this.areaChkStatus.forEach((item, index, array) => {
            let oOption = document.createElement("option");
            document.getElementById("laChkStatus").options.add(oOption);
            oOption.value = index;
            oOption.innerText = g_oCommon.getNodeValue(this.areaChkStatus[index]);
        });
    }

    outputModalHtml(modalID) {
        let modalTitle = "";
        if (modalID == "areaAdd") {
            modalTitle = g_oCommon.getNodeValue('laAreaAdd');
        } else if (modalID == "areaEdit") {
            modalTitle = g_oCommon.getNodeValue('laAreaEdit');
        }
        document.getElementById('modalContent').innerHTML = "";
        let modalContentHtml = ""
        modalContentHtml += "<div class='am-modal am-modal-prompt' tabindex='-1' id=" + modalID + ">";
        modalContentHtml += "	<div class='am-modal-dialog'>";
        modalContentHtml += "		<form class='am-form am-form-horizontal' id='saveAreaInfo'>";
        modalContentHtml += "		<div class='am-modal-hd'>" + modalTitle + "<a href='javascript: void(0)' class='am-close am-close-spin' data-am-modal-close>&times;</a></div>";
        modalContentHtml += "		<div class='am-modal-bd am-text-left' id='bodyContent'>";
        modalContentHtml += "		    <legend>" + g_oCommon.getNodeValue('laBasicInfo') + "</legend>";
        modalContentHtml += "			<div class='am-form-group'>";
        modalContentHtml += "				<label class='am-u-md-3 am-u-sm-3 am-form-label'>" + g_oCommon.getNodeValue('laAreaName') + "</label>";
        modalContentHtml += "				<div class='am-u-md-9 am-u-sm-9'>";
        modalContentHtml += "					<input type='text' id='areaName'>";
        modalContentHtml += "				</div>";
        modalContentHtml += "			</div>";
        modalContentHtml += "			<div class='am-form-group'>";
        modalContentHtml += "				<label class='am-u-md-3 am-u-sm-3 am-form-label'>" + g_oCommon.getNodeValue('laAreaType') + "</label>";
        modalContentHtml += "					<div class='am-u-md-9 am-u-sm-9'>";
        modalContentHtml += "						<select data-am-selected id='areaTypeSel' name='areaTypeSel'>";
        modalContentHtml += "						</select>";
        modalContentHtml += "					</div>";
        modalContentHtml += "			</div>";
        modalContentHtml += "			<div class='am-form-group'>";
        modalContentHtml += "				<label class='am-u-md-3 am-u-sm-3 am-form-label'>" + g_oCommon.getNodeValue('laChkStatus') + "</label>";
        modalContentHtml += "					<div class='am-u-md-9 am-u-sm-9'>";
        modalContentHtml += "						<select data-am-selected id='laChkStatus' name='laChkStatus'>";
        modalContentHtml += "						</select>";
        modalContentHtml += "					</div>";
        modalContentHtml += "			</div>";
        modalContentHtml += "			<div class='am-form-group'>";
        modalContentHtml += "				<label class='am-u-md-3 am-u-sm-3 am-form-label'>" + g_oCommon.getNodeValue('laAreaNumber') + "</label>";
        modalContentHtml += "					<div class='am-u-md-9 am-u-sm-9'>";
        modalContentHtml += "						<input type='text' id='laAreaNumber'>";
        modalContentHtml += "					</div>";
        modalContentHtml += "			</div>";
        modalContentHtml += "		</div>";
        modalContentHtml += "		<div class='am-modal-footer'>";
        modalContentHtml += "			<span class='am-modal-btn' data-am-modal-cancel>" + g_oCommon.getNodeValue('laCancel') + "</span>";
        modalContentHtml += "			<span class='am-modal-btn' data-am-modal-confirm>" + g_oCommon.getNodeValue('laSave') + "</span>";
        modalContentHtml += "		</div>";
        modalContentHtml += "		</form>";
        modalContentHtml += "	<div>";
        modalContentHtml += "<div>";
        document.getElementById('modalContent').innerHTML = modalContentHtml;
    }

    editArea(areaNo) {
        let that = this;
        this.outputModalHtml("areaEdit");
        this.areaTypeInit();
        this.areaChkStatusInit();

        let area = g_oArea.areaList.find(x => x.A == areaNo);

        that.curAreaNo = areaNo;
        $("#areaName").val(area.N);
        $('#laAreaNumber').val(area.A);
        $('#laChkStatus').val(area.S);
        $("#areaTypeSel").val(area.T);

        $('#areaEdit').modal({
            relatedTarget: that,
            width: 600,
            closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function (e) {
                if ($('#areaName').val() == "") {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('AreaNameErr'),
                        timeout: 2000
                    });
                    document.getElementById('areaName').focus();
                } else {
                    g_oArea.areaParaSave(true);
                }
            },
            onCancel: function (e) {
                this.close();
            }
        });
    }

    addArea() {
        var that = this;
        that.outputModalHtml("areaAdd");
        that.areaTypeInit();
        that.areaChkStatusInit();
        $('#areaAdd').modal({
            relatedTarget: this,
            width: 600,
            closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function (e) {
                if ($('#areaName').val() == "") {
                    AMUI.dialog.tip({
                        tip: g_oCommon.getNodeValue('AreaNameErr'),
                        timeout: 2000
                    });
                    document.getElementById('areaName').focus();
                } else {
                    g_oArea.areaParaSave();
                }
            },
            onCancel: function (e) {
                this.close();
            }
        });
    }

    //删除区域
    delArea(areaNo) {
        let that = this;
        AMUI.dialog.confirm({
            title: translator.translateNode(this._lxdArea, "dialogTitle"),
            content: translator.translateNode(this._lxdArea, "dialogContent1"),
            btnConfirm: translator.translateNode(this._lxdArea, "btnConfirm"),
            btnCancel: translator.translateNode(this._lxdArea, "btnCancel"),
            onConfirm: function () {
                let json = {}
                json.Cmd = 1103;
                json.Id = "123123123";
                json.User = 12345678;
                json.Def = "JSON_AREA_DEL";
                json.N = 0;
                json.A = parseInt(areaNo, 10);
                json.S = 0;
                json.T = 0;
                let jsonStr = JSON.stringify(json);
                $.ajax({
                    type: "PUT",
                    url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_set",
                    dataType: "json",
                    async: !0,
                    timeout: 15e3,
                    data: jsonStr,
                    beforeSend: function (xhr) {
                    },
                    success: function (data) {
                        if (0 == data.Ack) {
                            AMUI.dialog.tip({
                                tip: g_oCommon.getNodeValue('DelOk'),
                                timeout: 1000
                            });
                            //重新加载区域列表
                            g_oArea._GetAreaTable();
                        } else {
                            AMUI.dialog.tip({
                                tip: g_oCommon.getNodeValue('DelFailed'),
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
    }

    //保存设备信息
    areaParaSave(edit) {
        let json = {}
        json.Cmd = edit ? 1104 : 1102;
        json.Id = "123123123";
        json.User = 12345678;
        json.Def = [undefined, null, ""].includes(edit) ? "JSON_AREA_ADD" : "JSON_AREA_EDIT";
        json.N = $("#areaName").val();
        json.A = [undefined, null, ""].includes(edit) ? $('#laAreaNumber').val() : parseInt(this.curAreaNo, 10);
        json.S = $('#laChkStatus').val();
        json.T = parseInt($("#areaTypeSel").val(), 10);
        let jsonStr = JSON.stringify(json);
        $.ajax({
            type: "get",
            url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&" + Base64.encode(jsonStr) + "&",
            dataType: "json",
            success: function (data) {
                if (0 == data.Ack) {
                    AMUI.dialog.tip({
                        tip: edit ? g_oCommon.getNodeValue('EditOk') : g_oCommon.getNodeValue('AddOk'),
                        timeout: 1000
                    });
                } else {
                    AMUI.dialog.tip({
                        tip: edit ? g_oCommon.getNodeValue('EditFailed') : g_oCommon.getNodeValue('AddFailed'),
                        timeout: 1000
                    });
                }
            },
            complete: function (t) {
                edit ? $("#areaEdit").modal('close') : $("#areaAdd").modal('close');
                //重新加载区域列表
                g_oArea._GetAreaTable();
            }
        });
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

var g_oArea = new Area();