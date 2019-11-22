function Area() {
    this._lxdArea = null;  //Area.xml
}
var TimerList={};//存放定时时间
Area.prototype = {
	
	//主页面初始化函数	
	initPage: function () {
		getMenuList();//加载菜单列表等文本
		///getLogList(5,'lTypeAlarm');//获取报警记录
		var szLanguage = $.cookie("language");
		translator.initLanguageSelect(szLanguage);
		this._lxdArea = translator.getLanguageXmlDoc("Area");
		translator.translatePage(this._lxdArea, document);
		this._GetAreaTable();
		g_oArea.syncMsg();
		setInterval("g_oArea.syncMsg()", 2000);
	},
	
	
	//获取区域列表
	_GetAreaTable:function(){
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/getAreaList",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (data) {
				console.log("data = %s \n", data);
				var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象
				if(statusCode==1){
					var json = $.parseJSON(data);
					var json = $.parseJSON(data);
					var areaNum = json.AreaNum;
					var TableList = "";
					var index,areaNo,areaType,areaName,AreaDevNum,strAreaType;
					for(index=0; areaNum>index; index++){
						areaNo = json.item[index].AreaNo;
						areaType = json.item[index].AreaType;
						switch(areaType)
						{
							default: 
							case 0: strAreaType = g_oCommon.getNodeValue('strUndefine'); break;
							case 1: strAreaType = g_oCommon.getNodeValue('strSala'); break;
							case 2: strAreaType = g_oCommon.getNodeValue('strBedroom'); break;
							case 3: strAreaType = g_oCommon.getNodeValue('strAisle'); break;
							case 4: strAreaType = g_oCommon.getNodeValue('strKitchen'); break;
							case 5: strAreaType = g_oCommon.getNodeValue('strToilet'); break;
							case 6: strAreaType = g_oCommon.getNodeValue('strGarden'); break;
							case 7: strAreaType = g_oCommon.getNodeValue('strCarport'); break;
							case 8: strAreaType = g_oCommon.getNodeValue('strBalcony'); break;
							case 9: strAreaType = g_oCommon.getNodeValue('strBathRoom'); break;
							case 10: strAreaType = g_oCommon.getNodeValue('strBar'); break;
							case 11: strAreaType = g_oCommon.getNodeValue('strStudyRoom'); break;
							case 12: strAreaType = g_oCommon.getNodeValue('strKidsRoom'); break;
							case 13: strAreaType = g_oCommon.getNodeValue('strDiningHall'); break;
						}
						areaName = json.item[index].AreaName;
						AreaDevNum = json.item[index].AreaDevNum;
                        TableList +=" <tr>";
                        TableList +="     <td>"+areaNo+"</td>";
                        TableList +="     <td>"+areaName+"</td>";
                        TableList +="     <td>"+strAreaType+"</td>";
                        TableList +="     <td>"+AreaDevNum+"</td>";
                        TableList +="     <td>";
                        TableList +="		<div class='am-btn-toolbar'>";
                        TableList +="			<div class='am-btn-group am-btn-group-sm'>";
                        TableList +="     			<button class='am-btn am-btn-default am-btn-sm am-text-secondary' onclick='g_oArea.editArea(\""+areaNo+"\")'><span class='am-icon-pencil-square-o'></span> "+g_oCommon.getNodeValue('btnEdit')+"</button>";
                        TableList +="     			<button class='am-btn am-btn-default am-btn-sm am-text-danger' onclick='g_oArea.delArea(\""+areaNo+"\")'><span class='am-icon-trash-o'></span> "+g_oCommon.getNodeValue('btnDel')+"</button>";
                        TableList +="     		</div>";
                        TableList +="       </div>";
                        TableList +="     </td>";
                        TableList +=" </tr>"; 
						
					};
					document.getElementById("areaList").innerHTML = TableList;
					
				}
			},

			timeOut: function (data){
				alert("请求数据超时");
			}
		})
	},
	
	areaTypeInit:function(){
		var index;
		document.getElementById("areaTypeSel").options.length = 0; 
		for(index=0; 14>index; index++){
			var oOption = document.createElement("option");
			var strText;
			switch(index)
			{
				default:
				case 0:strText=g_oCommon.getNodeValue("strUndefine");break;
				case 1:strText=g_oCommon.getNodeValue("strSala");break;
				case 2:strText=g_oCommon.getNodeValue("strBedroom");break;
				case 3:strText=g_oCommon.getNodeValue("strAisle");break;
				case 4:strText=g_oCommon.getNodeValue("strKitchen");break;
				case 5:strText=g_oCommon.getNodeValue("strToilet");break;
				case 6:strText=g_oCommon.getNodeValue("strGarden");break;
				case 7:strText=g_oCommon.getNodeValue("strCarport");break;
				case 8:strText=g_oCommon.getNodeValue("strBalcony");break;
				case 9:strText=g_oCommon.getNodeValue("strBathRoom");break;
				case 10:strText=g_oCommon.getNodeValue("strBar");break;
				case 11:strText=g_oCommon.getNodeValue("strStudyRoom");break;
				case 12:strText=g_oCommon.getNodeValue("strKidsRoom");break;
				case 13:strText=g_oCommon.getNodeValue("strDiningHall");break;
			}
			
			document.getElementById("areaTypeSel").options.add(oOption);
			oOption.value = index;
			oOption.innerText = strText;
		}
	},
	
	outputModalHtml:function(modalID){
		
		var modalTitle = "";
		if(modalID == "areaAdd"){
			modalTitle = g_oCommon.getNodeValue('laAreaAdd');
		}
		else if(modalID == "areaEdit"){
			modalTitle = g_oCommon.getNodeValue('laAreaEdit');
		}
		document.getElementById('modalContent').innerHTML = "";
		var modalContentHtml = ""
		modalContentHtml += "<div class='am-modal am-modal-prompt' tabindex='-1' id="+modalID+">";
		modalContentHtml += "	<div class='am-modal-dialog'>";
		modalContentHtml += "		<form class='am-form am-form-horizontal' id='saveAreaInfo'>";
		modalContentHtml += "		<div class='am-modal-hd'>"+modalTitle+"<a href='javascript: void(0)' class='am-close am-close-spin' data-am-modal-close>&times;</a></div>";
		modalContentHtml += "		<div class='am-modal-bd am-text-left' id='bodyContent'>";
		modalContentHtml += "		    <legend>"+g_oCommon.getNodeValue('laBasicInfo')+"</legend>";
		modalContentHtml += "			<div class='am-form-group'>";
		modalContentHtml +="				<label class='am-u-md-3 am-u-sm-3 am-form-label'>"+g_oCommon.getNodeValue('laAreaName')+"</label>";
		modalContentHtml +="				<div class='am-u-md-9 am-u-sm-9'>";
		modalContentHtml +="					<input type='text' id='areaName'>";
		modalContentHtml +="				</div>";
		modalContentHtml += "			</div>";
		modalContentHtml +="			<div class='am-form-group'>";
		modalContentHtml +="				<label class='am-u-md-3 am-u-sm-3 am-form-label'>"+g_oCommon.getNodeValue('laAreaType')+"</label>";
		modalContentHtml +="					<div class='am-u-md-9 am-u-sm-9'>";
		modalContentHtml +="						<select id='areaTypeSel' name='areaTypeSel'>";			
		modalContentHtml +="						</select>";
		modalContentHtml +="					</div>";
		modalContentHtml +="			</div>";
		modalContentHtml += "		    <legend>"+g_oCommon.getNodeValue('laOptNotice')+"</legend>";
		modalContentHtml +="			<div class='am-form-group'>";
		modalContentHtml +="				<label class='am-u-md-3 am-u-sm-3 am-form-label'>"+g_oCommon.getNodeValue('laTelNotice')+"</label>";
		modalContentHtml +="					<div class='am-u-md-9 am-u-sm-9'>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='armCall'>"+g_oCommon.getNodeValue('laChkArm')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='homeCall'>"+g_oCommon.getNodeValue('laChkHome')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='disarmCall'>"+g_oCommon.getNodeValue('laChkDisarm')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="					</div>";
		modalContentHtml +="			</div>";
		modalContentHtml +="			<div class='am-form-group'>";
		modalContentHtml +="				<label class='am-u-md-3 am-u-sm-3 am-form-label'>"+g_oCommon.getNodeValue('laSmsNotice')+"</label>";
		modalContentHtml +="					<div class='am-u-md-9 am-u-sm-9'>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='armSms'>"+g_oCommon.getNodeValue('laChkArm')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='homeSms'>"+g_oCommon.getNodeValue('laChkHome')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='disarmSms'>"+g_oCommon.getNodeValue('laChkDisarm')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="					</div>";
		modalContentHtml +="			</div>";
		modalContentHtml += "		    <legend>"+g_oCommon.getNodeValue('laTiming')+"</legend>";
		modalContentHtml += "			<div class='am-form-group'>";
		modalContentHtml +="				<div class='am-u-md-3 am-u-sm-3'>";
		modalContentHtml +="					<select id='TimeSel' onchange='g_oArea.changeTimerSel(this.selectedIndex)'>";
		modalContentHtml +="						<option value='1'>"+g_oCommon.getNodeValue('laTime1')+"</option>";
		modalContentHtml +="						<option value='2'>"+g_oCommon.getNodeValue('laTime2')+"</option>";
		modalContentHtml +="						<option value='3'>"+g_oCommon.getNodeValue('laTime3')+"</option>";
		modalContentHtml +="						<option value='4'>"+g_oCommon.getNodeValue('laTime4')+"</option>";
		modalContentHtml +="					</select>";
		modalContentHtml +="				</div>";
		modalContentHtml +="				<div class='am-u-md-4 am-u-sm-4'>";
		modalContentHtml +="					<input type='time' id='acttime' name='acttime' value='00:00' />";
		modalContentHtml +="				</div>";
		modalContentHtml +="				<div class='am-u-md-5 am-u-sm-5'>";
		modalContentHtml +="					<select id='OptSel'>";
		modalContentHtml +="						<option value='0'>"+g_oCommon.getNodeValue('laChkDisable')+"</option>";
		modalContentHtml +="						<option value='1'>"+g_oCommon.getNodeValue('laChkArm')+"</option>";
		modalContentHtml +="						<option value='2'>"+g_oCommon.getNodeValue('laChkHome')+"</option>";
		modalContentHtml +="						<option value='3'>"+g_oCommon.getNodeValue('laChkDisarm')+"</option>";
		modalContentHtml +="					</select>";
		modalContentHtml +="				</div>";
		modalContentHtml += "			</div>";
		modalContentHtml +="			<div class='am-form-group'>";
		modalContentHtml +="				<label class='am-u-md-3 am-u-sm-3 am-form-label'>"+g_oCommon.getNodeValue('laRepeat')+"</label>";
		modalContentHtml +="					<div class='am-u-md-9 am-u-sm-9'>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='Mon' name='Mon'>"+g_oCommon.getNodeValue('Mon')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='Tues' name='Tues'>"+g_oCommon.getNodeValue('Tues')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='Wed' name='Wed'>"+g_oCommon.getNodeValue('Wed')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='Thur' name='Thur'>"+g_oCommon.getNodeValue('Thur')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='Fri' name='Fri'>"+g_oCommon.getNodeValue('Fri')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='Sat' name='Sat'>"+g_oCommon.getNodeValue('Sat')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="						<label class='am-checkbox-inline'>";
		modalContentHtml +="							<input type='checkbox' id='Sun' name='Sun'>"+g_oCommon.getNodeValue('Sun')+"";
		modalContentHtml +="						</label>";
		modalContentHtml +="					</div>";
		modalContentHtml +="			</div>";
		modalContentHtml += "		</div>";
		modalContentHtml += "		<div class='am-modal-footer'>";
		modalContentHtml += "			<span class='am-modal-btn' data-am-modal-cancel>"+g_oCommon.getNodeValue('laCancel')+"</span>";
		modalContentHtml += "			<span class='am-modal-btn' data-am-modal-confirm>"+g_oCommon.getNodeValue('laSave')+"</span>";
		modalContentHtml += "		</div>";
		modalContentHtml += "		</form>";
		modalContentHtml += "	<div>";
		modalContentHtml += "<div>";		
		document.getElementById('modalContent').innerHTML = modalContentHtml;
		
	},
	
	addArea:function(){
		var that = this;
		that.outputModalHtml("areaAdd");
		that.areaTypeInit();
		$('#areaAdd').modal({
			relatedTarget: this,
			width: 600,
			closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function(e) {

				if($('#areaName').val() == ""){
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('AreaNameErr'),
						timeout:2000
					});
					document.getElementById('areaName').focus();
				}
				else{
					that.areaParaSave('#areaAdd','');
				}

			},
            onCancel: function(e) {
				
				this.close();
				
            }
		}); 
	},
	
	editArea:function(areaNo){
		var that = this;
		that.outputModalHtml("areaEdit");
		that.areaTypeInit();
		
		$.ajax({
				type: "get",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/getAreaAttr?AreaNo="+areaNo+"&",
				async: !0,
				timeout: 15e3,
				beforeSend: function (xhr) {
			},

			success: function (data) {
				console.log("data = %s \n", data);
				var json = $.parseJSON(data);	
				if(json.statusCode == 1){
					var jsonAreaName = json.AreaName;
					var jsonAreaType = json.AreaType;
					var jsonArmCall = json.ArmCall;
					var jsonHomeCall = json.HomeCall;
					var jsonDisarmCall = json.DisarmCall;
					var jsonArmSms = json.ArmSms;
					var jsonHomeSms = json.HomeSms;
					var jsonDisarmSms = json.DisarmSms;
					
					$("#areaName").val(jsonAreaName);
					$("#areaTypeSel").find("option[value="+jsonAreaType+"]").attr("selected",true);
					
					if(jsonArmCall == 1) $("#armCall").prop("checked", !0);
					else $("#armCall").prop("checked", !1);
					
					if(jsonHomeCall == 1) $("#homeCall").prop("checked", !0);
					else $("#homeCall").prop("checked", !1);
					
					if(jsonDisarmCall == 1) $("#disarmCall").prop("checked", !0);
					else $("#disarmCall").prop("checked", !1);
					
					if(jsonArmSms == 1) $("#armSms").prop("checked", !0);
					else $("#armSms").prop("checked", !1);
					
					if(jsonHomeSms == 1) $("#homeSms").prop("checked", !0);
					else $("#homeSms").prop("checked", !1);
					
					if(jsonDisarmSms == 1) $("#disarmSms").prop("checked", !0);
					else $("#disarmSms").prop("checked", !1);
					
					TimerList = json.timeItem;
					//初始化第一个时间显示
					var OptTypeSel = TimerList[0].OptType
					$("#acttime").val(TimerList[0].Time);
					$("#OptSel").val(OptTypeSel);
					if(TimerList[0].Mon == 1) $("#Mon").prop("checked", !0);
					else $("#Mon").prop("checked", !1);
					if(TimerList[0].Tues == 1) $("#Tues").prop("checked", !0);
					else $("#Tues").prop("checked", !1);
					if(TimerList[0].Wed == 1) $("#Wed").prop("checked", !0);
					else $("#Wed").prop("checked", !1);
					if(TimerList[0].Thur == 1) $("#Thur").prop("checked", !0);
					else $("#Thur").prop("checked", !1);
					if(TimerList[0].Fri == 1) $("#Fri").prop("checked", !0);
					else $("#Fri").prop("checked", !1);
					if(TimerList[0].Sat == 1) $("#Sat").prop("checked", !0);
					else $("#Sat").prop("checked", !1);
					if(TimerList[0].Sun == 1) $("#Sun").prop("checked", !0);
					else $("#Sun").prop("checked", !1);
					
				}
			},
			timeOut: function (data){
				alert("请求数据超时");
			}
		})
		
		
		$('#areaEdit').modal({
			relatedTarget: this,
			width: 600,
			closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function(e) {
				
				if($('#areaName').val() == ""){
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('AreaNameErr'),
						timeout:2000
					});
					document.getElementById('areaName').focus();
				}
				else{
					that.areaParaSave('#areaEdit',areaNo);
				}
				
			},
            onCancel: function(e) {
				
				this.close();
				
            }
		}); 
	},
	
	//删除区域
	delArea:function (areaNo){
		var that = this;
		AMUI.dialog.confirm({
		  title: translator.translateNode(this._lxdArea, "dialogTitle"),
		  content: translator.translateNode(this._lxdArea, "dialogContent1"),
		  btnConfirm: translator.translateNode(this._lxdArea, "btnConfirm"),
		  btnCancel: translator.translateNode(this._lxdArea, "btnCancel"),
		  onConfirm: function() {
			console.log('onConfirm');
			$.ajax({
				type: "get",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/delAreaAttr?AreaNo="+areaNo+"&",
				async: !0,
				timeout: 15e3,
				beforeSend: function (xhr) {
				},
			
				success: function (data) {
					var json = $.parseJSON(data);	
					if(json.statusCode == 1){
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('DelOk'),
							timeout:1000
						});
						//重新加载区域列表
						that._GetAreaTable();
					}
					else{
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('DelFailed'),
							timeout:1000
						});
					}
				},

				timeOut: function (data){
					alert("请求数据超时");
				}
			})
			
		  },
		  onCancel: function() {
			console.log('onCancel')
		  }
		});
	},
	
	//触发时间选择下拉选择框
	changeTimerSel:function(){
		var timeSel = $('#TimeSel option:selected') .val();
		var timeIndex = parseInt(timeSel, 10)-1;
		///var optValue = $("#OptSel").find("option:selected").val();
		
		//取消之前选中项，或者后面所有符合条件的值都会加上selected属性
		///$("#OptSel").find("option[value="+optValue+"]").removeAttr("selected");
		for(var index=0; TimerList.length>index; index++){
			if(index==timeIndex){
				console.log("index = %s Time = %s OptType = %s \n", index, TimerList[index].Time, TimerList[index].OptType);
				$("#acttime").val(TimerList[index].Time);
				
				var OptTypeSel = TimerList[index].OptType;
				$("#OptSel").val(OptTypeSel);
				if(TimerList[index].Mon == 1) $("#Mon").prop("checked", !0);
				else $("#Mon").prop("checked", !1);
				if(TimerList[index].Tues == 1) $("#Tues").prop("checked", !0);
				else $("#Tues").prop("checked", !1);
				if(TimerList[index].Wed == 1) $("#Wed").prop("checked", !0);
				else $("#Wed").prop("checked", !1);
				if(TimerList[index].Thur == 1) $("#Thur").prop("checked", !0);
				else $("#Thur").prop("checked", !1);
				if(TimerList[index].Fri == 1) $("#Fri").prop("checked", !0);
				else $("#Fri").prop("checked", !1);
				if(TimerList[index].Sat == 1) $("#Sat").prop("checked", !0);
				else $("#Sat").prop("checked", !1);
				if(TimerList[index].Sun == 1) $("#Sun").prop("checked", !0);
				else $("#Sun").prop("checked", !1);
			}									
		}
	},
	//保存区域
	//modalID:模态框ID
	//areaNo:设备ID
	areaParaSave: function(modalID,areaNo)
	{
		var json = {};
		var jsonStr = JSON.stringify(json);
		var that = this;

		json.AreaNo = parseInt(areaNo, 10);
		json.AreaName = $("#areaName").val();
		json.AreaType = $("#areaTypeSel").val();

		if($("#armCall").prop("checked")) json.ArmCall = 1;
		else json.ArmCall = 0;
		if($("#homeCall").prop("checked")) json.HomeCall = 1;
		else json.HomeCall = 0;
		if($("#disarmCall").prop("checked")) json.DisarmCall = 1;
		else json.DisarmCall = 0;
		
		if($("#armSms").prop("checked")) json.ArmSms = 1;
		else json.ArmCall = 0;
		if($("#homeSms").prop("checked")) json.HomeSms = 1;
		else json.HomeSms = 0;
		if($("#disarmSms").prop("checked")) json.DisarmSms = 1;
		else json.DisarmSms = 0;
		
		json.Timer = $("#TimeSel").val();
		json.Time = $("#acttime").val();
		json.OptType = $("#OptSel").val();
		
		if($("#Mon").prop("checked")) json.Mon = 1;
		else json.Mon = 0;
		if($("#Tues").prop("checked")) json.Tues = 1;
		else json.Tues = 0;
		if($("#Wed").prop("checked")) json.Wed = 1;
		else json.Wed = 0;
		if($("#Thur").prop("checked")) json.Thur = 1;
		else json.Thur = 0;
		if($("#Fri").prop("checked")) json.Fri = 1;
		else json.Fri = 0;
		if($("#Sat").prop("checked")) json.Sat = 1;
		else json.Sat = 0;
		if($("#Sun").prop("checked")) json.Sun = 1;
		else json.Sun = 0;
		var jsonStr = JSON.stringify(json);
		console.log("devParaSave jsonStr = %s \n", jsonStr);
		//新添加提交保存数据
		if (areaNo == ""){
			$.ajax({
				type: "post",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/newAreaAttr",
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
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('AddOk'),
							timeout:1000
						});	
					}
					else if(json_rcv.statusCode == -1)
					{
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('AreaNameExist'),
							timeout:1000
						});
					}
					else if(json_rcv.statusCode == -2)
					{
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('AreaFull'),
							timeout:1000
						});
					}
					else 
					{
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('AddFailed'),
							timeout:1000
						});
					}
					
				},
				complete: function(t) {
					$(modalID).modal('close');
					//重新加载区域列表
					that._GetAreaTable();
				}
			})
		}
		//编辑保存数据
		else
		{			
			$.ajax({
				type: "post",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/setAreaAttr?AreaNo="+areaNo+"",
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
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('EditOk'),
							timeout:1000
						});
						
						curDevNo = json_rcv.DevNo;
					}
					else
					{
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('EditFailed'),
							timeout:1000
						});
					}
				},
				
				complete: function(t) {
					$(modalID).modal('close');
					//重新加载区域列表
					that._GetAreaTable();
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

var g_oArea= new Area();