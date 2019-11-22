function Device() {
    this._lxdDevice = null;  //Device.xml
}

var devListContent="";//存放设备列表数据
var areaListContent="";//存放区域列表数据
var curResultIndex_search = 0;
var serchPageFlag=0;
var tryGetResultNum=0;
var devTypeTable = new Array("UNKNOWN","RAY_SENSOR","MOV_SENSOR","GAS_SENSOR","REMOTE_CTL","EMERGENCY_BUTTOM","FIRE_SENSOR","DOOR_SENSOR","WARTER_SENSOR","CO_SENSOR","WLS_WARMING","KEY_BOARD","IAS_DEV","SWITCH","LOCK","LIGHT","COLOR_LED","TEMP","CURTAIN","IR_DEVICE","PLUG");
var alarmDevTypeTable = new Array("RAY_SENSOR","MOV_SENSOR","GAS_SENSOR","FIRE_SENSOR","DOOR_SENSOR","WARTER_SENSOR","CO_SENSOR","IAS_DEV");
var smartDevTypeTable = new Array("SWITCH","LOCK","LIGHT","COLOR_LED","CURTAIN","IR_DEVICE","PLUG","TEMP");
var CtltypeTable = new Array("Wls","Wired");
var AlarmTypeTable = new Array("Stop","Delay","Perimeter","Burglar","Emergency","a24H","Fire");
var AlarmToneTable = new Array("Mute","Tone");
var CtltypeTable = new Array("Wls","Wired");
var curDevNo = 0;
var chnNUm = g_oCommon.m_iAnalogChannelNum + g_oCommon.m_iDigitalChannelNum;

Device.prototype = {
	//主页面初始化函数	
	initPage: function () {
		getMenuList();//加载菜单列表等文本
		var szLanguage = $.cookie("language");
		translator.initLanguageSelect(szLanguage);
		this._lxdDevice = translator.getLanguageXmlDoc("Device");
		translator.translatePage(this._lxdDevice, document);
		///getLogList(5,'lTypeAlarm');//获取报警记录	
		this._GetZoneAreaList();//获取区域列表
		g_oDevice.syncMsg();
		setInterval("g_oDevice.syncMsg()", 2000);
	},

	//获取通道列表
	InitChnList: function(chnNum){
		var chnNo;
		var chnList="";
		for(var i=0; i<chnNum; i++){
			var szChannelID="";
			var szChannelName="";
			chnNo = i+1;
			szChannelID = "Chn"+chnNo;
			szChannelName = g_oCommon.getNodeValue(szChannelID);
			chnList +="<label class='am-checkbox-inline'>";
			chnList +="<input type='checkbox' id='"+szChannelID+"' name='"+szChannelID+"'> "+szChannelName+"";
			chnList +="</label>";
		}
		return chnList;
	},
	//获取控制区域列表复选框组
	InitAreaListCtrl: function(){
		var AreaJson = areaListContent;
		var AreaNum = AreaJson.AreaNum;
		var index,areaNo;
		var areaList="";
		for(index=0; AreaNum>index; index++){
			areaNo = AreaJson.item[index].AreaNo;
			areaName = AreaJson.item[index].AreaName;
			areaList +="<label class='am-checkbox-inline'>";
			areaList +="<input type='checkbox' id='area"+areaNo+"' name='area"+areaNo+"'> "+areaName+"";
			areaList +="</label>";
		}
		return areaList;
	},	
	//获取区域列表赋值给下拉框
	//selName:下拉框名称
	InitAreaList: function(selName){
		var AreaJson = areaListContent;
		var AreaNum = AreaJson.AreaNum;
		var index,areaNo,areaName;
		console.log("InitAreaList ---------- \n");
		console.log("AreaNum ------%s---- \n", AreaNum);
		for(index=0; AreaNum>index; index++){
			areaNo = AreaJson.item[index].AreaNo;
			areaName = AreaJson.item[index].AreaName;
			console.log(" areaNo = %s, areaName = %s \n", areaNo, areaName);
			var oOption = document.createElement("option");
			document.getElementById(selName).options.add(oOption);
			oOption.value = areaNo;
			oOption.innerText = areaName;
		}
	},
	
	//填充添加时智能设备联动区域下拉框添加一个空值
	InitSmartAreaNull: function(){
		var first=document.getElementById("smartAreaSel").firstChild; //得到第一个元素
		var option = document.createElement("option");
		$(option).val("null");
		$(option).text("");   
		document.getElementById("smartAreaSel").insertBefore(option,first);
		$("#smartAreaSel").find("option[value='null']").attr("selected",true);//默认选中
	},	
		
	//初始化通讯方式下拉列表
	InitCtlType:function(value){
		for(index=0; index<CtltypeTable.length; index++)
		{
			var oOption = document.createElement("option");
			document.getElementById("ctlTypeSel").options.add(oOption);
			if(0 == index) oOption.value = 0;
			else if(1 == index) oOption.value = 8;
			oOption.innerText = g_oCommon.getNodeValue(CtltypeTable[index]);
			if(CtltypeTable[index]==value) oOption.selected = true;
		}		
	},
	
	//初始化设备类型下拉列表
	InitDevTye:function(){
		console.log("InitDevTye -------------- \n");
		for(index=0; index<devTypeTable.length; index++)
		{
			var oOption = document.createElement("option");
			document.getElementById("devTypeSel").options.add(oOption);
			oOption.value = devTypeTable[index];
			oOption.innerText = g_oCommon.getNodeValue(devTypeTable[index]);
			//if(devTypeTable[index]==devType) oOption.selected = true;//选中设备类别
		}
	},
	
	//初始化报警音下拉列表
	InitAlarmToneSel:function(){
		for(index=0; index<AlarmToneTable.length; index++)
		{
			var oOption = document.createElement("option");
			document.getElementById("alarmToneSel").options.add(oOption);
			oOption.value = index;
			oOption.innerText = g_oCommon.getNodeValue(AlarmToneTable[index]);
		}
	},
	InitAlarmTypeSel:function(){
		//初始化报警类型下拉列表
		for(index=0; index<AlarmTypeTable.length; index++)
		{
			var oOption = document.createElement("option");
			document.getElementById("alarmTypeSel").options.add(oOption);
			oOption.value = index;
			oOption.innerText = g_oCommon.getNodeValue(AlarmTypeTable[index]);
		}
	},
	//获取区域列表
	_GetZoneAreaList:function(){
		var that = this;
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/getAreaList",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (data) {
				console.log("_GetZoneAreaList data = %s \n", data);
				var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象		
				if(statusCode==1){
					var json = $.parseJSON(data);
					var areaNum = json.AreaNum;
					var index,areaNo,areaName;
					var Arealist = "";
					var DevList = "";
					//把区域列表数据存放到areaListContent，后面会用到该数据
					areaListContent = json;
					for(index=0; areaNum>index; index++){
						areaNo = json.item[index].AreaNo;
						areaName = json.item[index].AreaName;
						if(index==0){
							Arealist += "<li class='am-active'><a href='#tab"+areaNo +"'>"+areaName+"</a></li>";
							DevList +="<div class='am-tab-panel am-fade am-in am-active' id='tab"+areaNo +"'>";
						}
						else{
							Arealist += "<li class=''><a href='#tab"+areaNo +"'>"+areaName+"</a></li>";
							
							DevList +="<div class='am-tab-panel am-fade am-in' id='tab"+areaNo +"'>";
						}
						
						DevList +="<table class='am-table am-table-bordered am-table-striped am-table-hover table-main'>";
                        DevList +="            <thead>";
                        DevList +="                <tr>";
                        DevList +="                    <th>"+g_oCommon.getNodeValue('laIndex')+"</th>";
                        DevList +="                    <th>"+g_oCommon.getNodeValue('laDevName')+"</th>";
                        DevList +="                    <th>"+g_oCommon.getNodeValue('laDevType')+"</th>";
                        DevList +="                    <th>"+g_oCommon.getNodeValue('laDevID')+"</th>";
                        DevList +="                    <th>"+g_oCommon.getNodeValue('laCtrl')+"</th>";
                        DevList +="                </tr>";
                        DevList +="            </thead>";
                        DevList +="            <tbody id='tb"+areaNo+"'>";
						DevList +="          </tbody>";
						DevList +="</table>";	
						DevList +="</div>";					
					};
					//填充设备列表的区域tab
					document.getElementById('ZoneArea').innerHTML = Arealist;
					console.log("DevList = %s\n", DevList);
					document.getElementById('DeviceList').innerHTML = DevList;
					that._GetDeviceList();//只有区域列表加载完成后才能获取设备列表
				}
			},
			timeOut: function (data){
				alert("请求数据超时");
			}
		})
	},
	//获取设备列表
	_GetDeviceList:function(){
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/getDevList",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (data) {
				console.log("data = %s \n", data);
				var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象
				if(statusCode==1){
					var json = $.parseJSON(data);
					var DevNum = json.DevNum;
					var index,devName,devID,areaNo,devNo;
					
					//把设备列表数据存放到devListContent，后面会用到该数据
					devListContent = json;
					for(index=0; DevNum>index; index++)
					{
						areaNo = json.item[index].AreaNo;
						document.getElementById("tb"+areaNo).innerHTML = "";
					}
					
					for(index=0; DevNum>index; index++){
						devID = json.item[index].DevId;
						devNo = json.item[index].DevNo;
						devName = json.item[index].DevName;
						devType = g_oCommon.getNodeValue(json.item[index].DevType);
						var devType1 = json.item[index].DevType;
						areaNo = json.item[index].AreaNo;
						console.log("areaNo = %s \n", areaNo);
						var TableList=document.getElementById("tb"+areaNo).innerHTML;
                        TableList +=" <tr>";
                        TableList +="     <td></td>";
                        TableList +="     <td><a href='#'>"+devName+"</a></td>";
                        TableList +="     <td>"+devType+"</td>";
                        TableList +="     <td>"+devID+"</td>";
                        TableList +="     <td>";
                        TableList +="		<div class='am-btn-toolbar'>";
                        TableList +="			<div class='am-btn-group'>";
                        TableList +="     			<button class='am-btn am-btn-default am-btn-sm am-text-secondary am-round' onclick='g_oDevice.devEditInit(\""+devType1+"\",\""+devNo+"\")'><span class='am-icon-pencil-square-o'></span> "+g_oCommon.getNodeValue('btnEdit')+"</button>";
                        TableList +="     			<button class='am-btn am-btn-default am-btn-sm am-text-danger am-round' onclick='g_oDevice.delOneDev(\""+devNo+"\")'><span class='am-icon-trash-o'></span> "+g_oCommon.getNodeValue('btnDel')+"</button>";
						
						var smartIndex = 0;
						var smartDevFlag = 0;
						for(smartIndex=0; smartIndex<smartDevTypeTable.length; smartIndex++)
						{
							if(smartDevTypeTable[smartIndex] == devType1) {smartDevFlag = 1; break;}
						}
						if(smartDevFlag == 1){
							
							TableList +="<button class='am-btn am-btn-default am-btn-sm am-text-success am-round' onclick='g_oDevice.devOpt(\""+devType1+"\",\""+devID+"\",\""+devName+"\")'><span class='am-icon-cogs'></span> "+g_oCommon.getNodeValue('btnOpt')+"</button>";
							
						}
                        TableList +="     		</div>";
                        TableList +="       </div>";
                        TableList +="     </td>";
                        TableList +=" </tr>"; 
						document.getElementById("tb"+areaNo).innerHTML = TableList;	
						//自动给table添加序号
						var oTable = document.getElementById("tb"+areaNo);  
						for(var i=0;i<oTable.rows.length;i++){  
							oTable.rows[i].cells[0].innerHTML = (i+1); 
						}
					};
					
					
				}
			},
			timeOut: function (data){
				alert("请求数据超时");
			}
		})
	},
	devOpt:function(devType,devID,devName){
		document.getElementById('devOptContent').innerHTML = "";
		var optContent="";
		if(devType=="SWITCH" || devType=="PLUG"){
			optContent +="<div class='am-modal am-modal-prompt' tabindex='-1' id='devOpt'>";
			optContent +="	<div class='am-modal-dialog'>";
			optContent +="		<div class='am-modal-hd'><span>"+g_oCommon.getNodeValue('laDevOpt')+"</span><a href='javascript: void(0)' class='am-close am-close-spin' data-am-modal-close id='devOptClose'>&times;</a></div>";
			optContent +="		<div class='am-modal-bd' id='devOptContent'>";
			optContent +="          <label class='am-u-md-4 am-u-sm-4 am-form-label'>"+devName+"：</label>";
			optContent +="			<input type='checkbox' id='switchStyle-"+devID+"' onclick='g_oDevice.devOptSave(\"switchStyle-"+devID+"\")' class='displaynone'/>";
			optContent +="			<label for='switchStyle-"+devID+"'></label>";
			optContent +="		</div>";
			optContent +="		<div class='am-modal-footer'>";
			optContent +="		  <span class='am-modal-btn' data-am-modal-cancel>"+g_oCommon.getNodeValue('laClose')+"</span>";
			optContent +="		</div>";
			optContent +="	</div>"; 
			optContent +="</div>";
		}
		document.getElementById('devOptContent').innerHTML = optContent;
		
		//这里可以先请求设备状态，然后再赋值显示
		//$("#switchStyle-"+devID+"").prop("checked", !0);
				
		$('#devOpt').modal({
			relatedTarget: this,
			closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function(e) {
				
			},
            onCancel: function(e) {
				this.close();
            }
		}); 
	},
	devOptSave:function(devID){
		alert("test");
	},
	//模态框分块显示内容拼接函数
	contentJoin:function(num){
		var that = this;
		var content="";
		if(num==1){
			content +="<legend>"+g_oCommon.getNodeValue('laDevBasicSet')+"</legend>";
			content +="<div class='am-form-group'>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laCommMode')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<select id='ctlTypeSel' name='ctlTypeSel' onchange='g_oDevice.changeCtlTypeSelect(this.selectedIndex)'>";			
			content +="		</select>";
			content +="	</div>";
			content +="</div>";
			content +="<div class='am-form-group'>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laAreaSel1')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<select id='AreaSel' name='AreaSel'>";	
			content +="		</select>";
			content +="	</div>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laDevType')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<select id='devTypeSel' onchange='g_oDevice.changeDevTypeSelect(this.selectedIndex)'>";
			content +="		</select>";
			content +="	</div>";
			content +="</div>";
			content +="<div class='am-form-group'>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laDevName')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<input type='text' id='DevName'>";
			content +="	</div>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label' id='laWls'>"+g_oCommon.getNodeValue('laWls')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<input type='text' id='DevID' maxlength='9'>";
			content +="	</div>";
			content +="</div>";
		}
		else if(num==2){
			content +="<div id='delayTimeContent'>";
			content +="	<div class='am-form-group'>";
			content +="		<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laDelayTime')+"</label>";
			content +="		<div class='am-u-md-4 am-u-sm-8'>";
			content +="			<input type='text' id='delayTime'>";
			content +="		</div>";
			content +="		<div class='am-u-md-4 am-u-sm-8'>";
			content +="			<label class='am-checkbox-inline'>";
			content +="			<input type='checkbox' id='autoCloseEn' name='autoCloseEn'>"+g_oCommon.getNodeValue('laEnable')+"";
			content +="			</label>";
			content +="		</div>";
			content +="	</div>";
			content +="</div>";
		}
		else if(num==3){
			content +="	<div class='am-form-group'>";
			content +="		<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laAreaSel2')+"</label>";
			content +="		<div class='am-u-md-10 am-u-sm-8' id='areaListCtrl'>";
			content +=" 	"+that.InitAreaListCtrl()+"";
			content +="		</div>";
			content +="	</div>";
		}
		else if(num==4){
			content +="<legend>"+g_oCommon.getNodeValue('laDevAlarmSet')+"</legend>";
			content +="<div class='am-form-group'>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laAlarmType')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<select id='alarmTypeSel'>";
			content +="		</select>";
			content +="	</div>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laAlarmSound')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<select id='alarmToneSel'>";	
			content +="		</select>";
			content +="	</div>";
			content +="</div>";
		}
		else if(num==5){
			content +="<div class='am-form-group'>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laCall')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<label class='am-checkbox-inline'>";
			content +="		<input type='checkbox' id='alarmCall' name='alarmCall'>"+g_oCommon.getNodeValue('laAlarmTel')+"";
			content +="		</label>";
			content +="		<label class='am-checkbox-inline'>";
			content +="		<input type='checkbox' id='faultCall' name='faultCall'>"+g_oCommon.getNodeValue('laFaultTel')+"";
			content +="		</label>";
			content +="	</div>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laSMS')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<label class='am-checkbox-inline'>";
			content +="		<input type='checkbox' id='alarmSms' name='alarmSms'>"+g_oCommon.getNodeValue('laAlarmTel')+"";
			content +="		</label>";
			content +="		<label class='am-checkbox-inline' id='laFaultSms' name='laFaultSms'>";
			content +="		<input type='checkbox' id='faultSms' name='faultSms'>"+g_oCommon.getNodeValue('laFaultTel')+"";
			content +="		</label>";
			content +="	</div>";
			content +="</div>";
		}
		else if(num==6){
			content +="<legend>"+g_oCommon.getNodeValue('laLinkVideo')+"</legend>";
			content +="<div class='am-form-group'>";
			content +="	  <label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laVideoChn')+"</label>";
			content +="	  <div class='am-u-md-8 am-u-sm-8' id='ChnList'>";
			content +=" 	  "+that.InitChnList(chnNUm)+"";
			content +="	  </div>";
			content +="</div>";
		}
		else if(num==7){
			content +="<legend>"+g_oCommon.getNodeValue('laDevLinkage')+"</legend>";
			content +="<div class='am-form-group'>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laAreaSel')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<select id='smartAreaSel' onchange='g_oDevice.changeAreaSelect(this.selectedIndex)'>";
						
			content +="		</select>";
			content +="	</div>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laLinkageDev')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<select id='smartDevSel'>";
						
			content +="		</select>";
			content +="	</div>";
			content +="</div>";
			content +="<div class='am-form-group'>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laSubDev')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<select id='smartDevIndexSel'>";
						
			content +="		</select>";
			content +="	</div>";
			content +="	<label class='am-u-md-2 am-u-sm-4 am-form-label'>"+g_oCommon.getNodeValue('laAction')+"</label>";
			content +="	<div class='am-u-md-4 am-u-sm-8'>";
			content +="		<select id='smartDevOptSel'>";
			content +="		</select>";
			content +="	</div>";
			content +="</div>";
		}				
		return content;
	},
	
	//模态框公共模板
	ModalTemplate:function(modalID,HtmlContent){
		var modalTitle = "";
		if(modalID == "devAddNew"){
			modalTitle = g_oCommon.getNodeValue('laDevAddNew');
		}
		else if(modalID == "devAddAuto"){
			modalTitle = g_oCommon.getNodeValue('laDevEditNew');
		}
		else if(modalID == "devEdit"){
			modalTitle = g_oCommon.getNodeValue('laDevEdit');
		}
		document.getElementById('modalContent').innerHTML = "";
		var modalContentHtml = ""
		modalContentHtml += "<div class='am-modal am-modal-prompt' tabindex='-1' id="+modalID+">";
		modalContentHtml += "	<div class='am-modal-dialog'>";
		modalContentHtml += "		<form class='am-form am-form-horizontal' id='saveDevInfo'>";
		modalContentHtml += "		<div class='am-modal-hd'>"+modalTitle+"<a href='javascript: void(0)' class='am-close am-close-spin' data-am-modal-close>&times;</a></div>";
		modalContentHtml += "		<div class='am-modal-bd am-text-left' id='bodyContent'>";
		modalContentHtml +=			HtmlContent;	
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
		
	//输出模态框全部html
	outputModalHtml:function(modalID,devType,devNo){
		var that=this;
		var alarmDevFlag = 0;
		var smartDevFlag = 0;
		var HtmlContent = "";
		for(index=0; index<alarmDevTypeTable.length; index++)
		{
			if(alarmDevTypeTable[index] == devType) {alarmDevFlag = 1; break;}	
		}
		
		for(index=0; index<smartDevTypeTable.length; index++)
		{
			if(smartDevTypeTable[index] == devType) {smartDevFlag = 1; break;}
		}
		console.log("alarmDevFlag = %s, smartDevFlag = %s \n", alarmDevFlag, smartDevFlag);
		
		//报警设备类型
		if(alarmDevFlag == 1)
		{
			HtmlContent = that.contentJoin(1)+that.contentJoin(4)+that.contentJoin(5)+that.contentJoin(6)+that.contentJoin(7);
			that.ModalTemplate(modalID,HtmlContent);
			that.InitCtlType();//通讯方式
			that.InitAreaList("AreaSel");//区域列表
			that.InitDevTye();//设备类型
			that.InitAlarmTypeSel();//报警类型
			that.InitAlarmToneSel();//报警音
			that.InitAreaList("smartAreaSel");//联动区域列表
			that.InitSmartAreaNull();
		}
		//智能设备类型
		else if(smartDevFlag == 1)
		{
			HtmlContent = that.contentJoin(1)+that.contentJoin(2);
			that.ModalTemplate(modalID,HtmlContent);
			that.InitCtlType();//通讯方式
			that.InitAreaList("AreaSel");//区域列表
			that.InitDevTye();//设备类型
		}
		//遥控器类型和紧急按钮类型	
		else if(devType == "REMOTE_CTL" || devType == "EMERGENCY_BUTTOM")
		{
			if(devType == "EMERGENCY_BUTTOM")
			{
				$('#alarmToneSel').selected('enable');
				HtmlContent = that.contentJoin(1)+that.contentJoin(4)+that.contentJoin(5)+that.contentJoin(6)+that.contentJoin(7);
			}
			else{
				HtmlContent = that.contentJoin(1)+that.contentJoin(3)+that.contentJoin(4)+that.contentJoin(5)+that.contentJoin(6)+that.contentJoin(7);
			}
			that.ModalTemplate(modalID,HtmlContent);	
			that.InitCtlType();//通讯方式
			that.InitAreaList("AreaSel");//区域列表
			that.InitDevTye();//设备类型
			that.InitAlarmTypeSel();//报警类型
			that.InitAlarmToneSel();//报警音
			that.InitAreaList("smartAreaSel");//联动区域列表
			that.InitSmartAreaNull();
			$('#alarmTypeSel').selected('disable');
			$('#alarmToneSel').selected('disable');
			$("#alarmTypeSel").find("option[value='4']").attr("selected",true);	//设置遥控器的报警类别
			$("#alarmToneSel").find("option[value='1']").attr("selected",true);	//设置遥控器的报警音
			
		}
		//警号和键盘类型
		else if(devType == "KEY_BOARD" || devType == "WLS_WARMING")
		{
			if(devType == "KEY_BOARD")
			{
				HtmlContent = that.contentJoin(1)+that.contentJoin(3);
			}
			else{
				HtmlContent = that.contentJoin(1);
			}
			that.ModalTemplate(modalID,HtmlContent);
			that.InitCtlType();//通讯方式
			that.InitAreaList("AreaSel");//区域列表
			that.InitDevTye();//设备类型
		}
		else if(devType == "UNKNOWN") {
			HtmlContent = that.contentJoin(1)+that.contentJoin(4)+that.contentJoin(5)+that.contentJoin(6)+that.contentJoin(7);
			that.ModalTemplate(modalID,HtmlContent);
			that.InitCtlType();//通讯方式
			that.InitAreaList("AreaSel");//区域列表
			that.InitDevTye();//设备类型
			that.InitAlarmTypeSel();//报警类型
			that.InitAlarmToneSel();//报警音
			that.InitAreaList("smartAreaSel");//联动区域列表
			that.InitSmartAreaNull();
		}		
	},
	//点击手动添加设备
	DeviceAddManual:function(){
		var that = this;
		that.outputModalHtml("devAddNew","UNKNOWN","");//加载Html内容
		
		$('input#DevID').keyup(function(){
		   var c=$(this);
		   if(/[^\d]/.test(c.val())){//替换非数字字符
			var temp_amount=c.val().replace(/[^\d]/g,'');
			$(this).val(temp_amount);
		   }	
		}); 
		$('#devAddNew').modal({
			relatedTarget: this,
			width: 700,
			closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function(e) {
				if($('#DevName').val() == "" || $.trim($('#DevName').val()).length== 0){
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('DevNameErr'),
						timeout:2000
					});
					document.getElementById('DevName').focus();
				}
				else if($('#DevID').val() == "" || $.trim($('#DevID').val()).length== 0){
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('DevIdErr'),
						timeout:2000
					});
					 document.getElementById('DevID').focus(); 
				}
				else{
					var devType = $("#devTypeSel").val();
					that.devParaSave("#devAddNew",'',devType);
				}	
			},
            onCancel: function(e) {
				this.close();
            }
		}); 
		
	},
	//从搜索列表中添加设备
	AutoAdd:function(devType,devID){
		var that = this;
		that.outputModalHtml("devAddAuto",devType,devID);
		$('#devAddAuto').modal({
			relatedTarget: this,
			width: 700,
			closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function(e) {
				if($('#DevName').val() == "" || $.trim($('#DevName').val()).length== 0){
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('DevNameErr'),
						timeout:2000
					});
					document.getElementById('DevName').focus();
				}
				else{
					that.devParaSave("#devAddAuto",'',devType);
				}
			},
            onCancel: function(e) {
				this.close();
            }
		}); 
		$('#devTypeSel').selected('disable');
		$('#ctlTypeSel').selected('disable');
		$("#DevID").prop("disabled", !0);
		$("#devTypeSel").find("option[value="+devType+"]").attr("selected",true);
		$("#DevID").val(devID);
		
	},
	//点击自动学习添加设备
	DeviceAddAuto:function(){
		var that = this;
		document.getElementById('newDevice').innerHTML = "";
		$('#my-prompt').modal({
		  relatedTarget: this,
		  onCancel: function(e) {
			$('#startSearch').button('reset');
		  }
		});

		$('#searchClose').on('click', function() {
			$('#startSearch').button('reset');
		});
		
		$('#startSearch').on('click', function() {
			
			var $btn = $(this);
				$btn.attr('data-am-loading', "{spinner: 'circle-o-notch', loadingText: '"+g_oCommon.getNodeValue('laDevSearch')+"'}");
				$btn.button('loading');
				/* setTimeout(function(){
					$btn.button('reset');
				}, 10000); */
			that.startSearch();
			
		});
		$('#stopSearch').on('click', function() {
			$('#startSearch').button('reset');
			that.stopSearch();
			
		});
		
	},
	//开始学习
	startSearch: function()
	{
		var that = this;
		startSearchFlag = 1;
		that.deleteSearchItem();
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/startDevSerch",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (data) {
				console.log("data = %s \n", data);
				var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象		
				if(statusCode==1){
					tryGetResultNum = 0;
					setTimeout(function(){
						that.tryGetDevSearch();
					}, 1000);
					
				}
			},
			timeOut: function (data){
				alert("请求数据超时");
			}
		})
	},
	//循环学习
	tryGetDevSearch: function() {
		var that=this;
		tryGetResultNum ++;
		if(tryGetResultNum >= 60){
			$('#startSearch').button('reset');
			return ;
		} 
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/tryGetDevSerch?ResultIndex="+curResultIndex_search+"&",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (data) {				
				console.log("data = %s \n", data);
				var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象		
				if(statusCode==1){
					var json = $.parseJSON(data);
					//var devNum = json.ItemNum;
					var newDeviceList="";
					for(index=0; index<json.itemNum; index++){
						var devID = json.item[index].DevId;
						var devType = g_oCommon.getNodeValue(json.item[index].DevType);
						var devType1 = json.item[index].DevType;
						newDeviceList +="<tr>";
						newDeviceList +="	<td></td>";
						newDeviceList +="	<td>"+devType+"</td>";
						newDeviceList +="	<td>"+devID+"</td>";
						newDeviceList +="	<td><div class='am-btn-toolbar'><div class='am-btn-group am-btn-group-sm'><button class='am-btn am-btn-default am-btn-sm am-text-secondary devAdd' onclick='g_oDevice.AutoAdd(\""+devType1+"\",\""+devID+"\")'><span class='am-icon-plus'></span> "+g_oCommon.getNodeValue('btnAdd')+"</button></div></div></td>";
						newDeviceList +="</tr>";
						curResultIndex_search ++;
					};
					document.getElementById('newDevice').innerHTML += newDeviceList;
					//自动给table添加序号
						var oTable = document.getElementById('newDevice');  
						for(var i=0;i<oTable.rows.length;i++){  
							oTable.rows[i].cells[0].innerHTML = (i+1); 
						}
					
				}
				//setTimeout(that.tryGetDevSearch(), 1000);
				setTimeout(function(){
					that.tryGetDevSearch();
				}, 1000);
			},
			
			timeOut: function (data){
				alert("请求数据超时");
			}
		})
	},
	//停止学习
	stopSearch: function()
	{
		startSearchFlag = 0;
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/stopDevSerch",
			async: !0,
			timeout: 15e3,
			beforeSend: function (xhr) {
			},
			success: function (data) {
				console.log("data = %s \n", data);
				var statusCode = $.parseJSON(data).statusCode;	//将返回结果转换成JSON对象		
				if(statusCode==1){
					console.log("Stop Search !");
				}
			},
			timeOut: function (data){
				alert("请求数据超时");
			}
		})
		
	},
	//点击停止学习按钮清空搜索列表
	deleteSearchItem: function () {
		curResultIndex_search = 0;
		document.getElementById('newDevice').innerHTML="";
    },
	
	//触发智能设备联动区域选择下拉框联动填充该区域下的智能设备列表
	changeAreaSelect:function(){
		var areaIDSel = $('#smartAreaSel option:selected') .val();
		document.getElementById("smartDevSel").options.length=0;
		document.getElementById("smartDevOptSel").options.length=0;
		var json = devListContent;
		var DevNum = json.ItemNum;
		for(index=0; DevNum>index; index++){
			var smartDevList="";
			var devType = json.item[index].DevType;
			var smartDevFlag = 0;
			for(i=0; i<smartDevTypeTable.length; i++)
			{
				if(smartDevTypeTable[i] == devType) {smartDevFlag = 1; break;}
			}
			if(json.item[index].AreaID==areaIDSel && smartDevFlag==1){
				var oOption = document.createElement("option");
				document.getElementById("smartDevSel").options.add(oOption);
				oOption.value = json.item[index].DevID;
				oOption.innerText = json.item[index].DevName;
			}									
		}
		
		//初始化智能设备联动操作下拉列表
		for(optIndex=0; optIndex<2; optIndex++)
		{
			var oOption = document.createElement("option");
			document.getElementById("smartDevOptSel").options.add(oOption);
			if(0 == optIndex)
			{
				oOption.value = 1;
				oOption.innerText = g_oCommon.getNodeValue('laOpen');;
			}
			else
			{
				oOption.value = 2;
				oOption.innerText = g_oCommon.getNodeValue('laClose');;
			}
		}	
		
	},
	
	//触发通讯方式下拉选择框
	changeCtlTypeSelect:function(){
		var CtlTypeSel = $('#ctlTypeSel option:selected') .val();
		var strLable;
		if("0" == CtlTypeSel) strLable = g_oCommon.getNodeValue('laWls');
		else if("8" == CtlTypeSel) strLable = g_oCommon.getNodeValue('laWired');
		else strLable = g_oCommon.getNodeValue('laWls');
		$("#laWls").html(strLable);
	},
	
	//触发设备类别下拉选择框
	changeDevTypeSelect:function(){
		var that = this;
		var devType = $('#devTypeSel option:selected') .val();
		var alarmDevFlag = 0;
		var smartDevFlag = 0;
		var HtmlContent = "";
		document.getElementById('bodyContent').innerHTML="";
		for(index=0; index<alarmDevTypeTable.length; index++)
		{
			if(alarmDevTypeTable[index] == devType) {alarmDevFlag = 1; break;}	
		}
		
		for(index=0; index<smartDevTypeTable.length; index++)
		{
			if(smartDevTypeTable[index] == devType) {smartDevFlag = 1; break;}
		}
		console.log("alarmDevFlag = %s, smartDevFlag = %s \n", alarmDevFlag, smartDevFlag);
		//报警设备类型
		if(alarmDevFlag == 1)
		{
			HtmlContent = that.contentJoin(1)+that.contentJoin(4)+that.contentJoin(5)+that.contentJoin(6)+that.contentJoin(7);
			document.getElementById('bodyContent').innerHTML=HtmlContent;	
			that.InitCtlType();//通讯方式
			that.InitAreaList("AreaSel");//区域列表
			that.InitDevTye();//设备类型
			that.InitAlarmTypeSel();//报警类型
			that.InitAlarmToneSel();//报警音
			that.InitAreaList("smartAreaSel");//联动区域列表
			that.InitSmartAreaNull();
		}
		//智能设备类型
		else if(smartDevFlag == 1)
		{
			HtmlContent = that.contentJoin(1)+that.contentJoin(2);
			document.getElementById('bodyContent').innerHTML=HtmlContent;
			that.InitCtlType();//通讯方式
			that.InitAreaList("AreaSel");//区域列表
			that.InitDevTye();//设备类型
		}
		//遥控器类型和紧急按钮类型	
		else if(devType == "REMOTE_CTL" || devType == "EMERGENCY_BUTTOM")
		{
			if(devType == "EMERGENCY_BUTTOM")
			{
				$('#alarmToneSel').selected('enable');
				HtmlContent = that.contentJoin(1)+that.contentJoin(4)+that.contentJoin(5)+that.contentJoin(6)+that.contentJoin(7);
			}
			else
			{
				HtmlContent = that.contentJoin(1)+that.contentJoin(3)+that.contentJoin(4)+that.contentJoin(5)+that.contentJoin(6)+that.contentJoin(7);
			}
			document.getElementById('bodyContent').innerHTML=HtmlContent;
			that.InitCtlType();//通讯方式
			that.InitAreaList("AreaSel");//区域列表
			that.InitDevTye();//设备类型
			that.InitAlarmTypeSel();//报警类型
			that.InitAlarmToneSel();//报警音
			that.InitAreaList("smartAreaSel");//联动区域列表
			that.InitSmartAreaNull();
			$('#alarmTypeSel').selected('disable');
			$('#alarmToneSel').selected('disable');
			if(devType == "EMERGENCY_BUTTOM")
			{
				$('#alarmToneSel').selected('enable');
			}
			$("#alarmTypeSel").find("option[value='4']").attr("selected",true);	//设置遥控器的报警类别
			$("#alarmToneSel").find("option[value='1']").attr("selected",true);	//设置遥控器的报警音	
		}
		//警号和键盘类型
		else if(devType == "KEY_BOARD" || devType == "WLS_WARMING")
		{
			if(devType == "KEY_BOARD")
			{
				HtmlContent = that.contentJoin(1)+that.contentJoin(3);
			}
			else
			{
				HtmlContent = that.contentJoin(1);
			}
			document.getElementById('bodyContent').innerHTML=HtmlContent;
			that.InitCtlType();//通讯方式
			that.InitAreaList("AreaSel");//区域列表
			that.InitDevTye();//设备类型
		}
		else if(devType == "UNKNOWN") {
			HtmlContent = that.contentJoin(1)+that.contentJoin(4)+that.contentJoin(5)+that.contentJoin(6)+that.contentJoin(7);
			document.getElementById('bodyContent').innerHTML=HtmlContent;
			that.InitCtlType();//通讯方式
			that.InitAreaList("AreaSel");//区域列表
			that.InitDevTye();//设备类型
			that.InitAlarmTypeSel();//报警类型
			that.InitAlarmToneSel();//报警音
			that.InitAreaList("smartAreaSel");//联动区域列表
			that.InitSmartAreaNull();
		}
		$("#devTypeSel").find("option[value="+devType+"]").attr("selected",true);
	},
	
	//编辑设备参数
	devEditInit:function(devType,devNo){
		var that = this;
		var alarmDevFlag = 0;
		var smartDevFlag = 0;
		that.outputModalHtml("devEdit",devType,devNo);
		$('#devEdit').modal({
			relatedTarget: this,
			width: 700,
			closeOnConfirm: false,
            closeOnCancel: false,
            onConfirm: function(e) {
				if($('#DevName').val() == "" || $.trim($('#DevName').val()).length== 0)
				{
					AMUI.dialog.tip({
						tip: g_oCommon.getNodeValue('DevNameErr'),
						timeout:2000
					});
					document.getElementById('DevName').focus();
				}
				else
				{
					that.devParaSave("#devEdit",devNo,devType);
				}
			},
            onCancel: function(e) {
				this.close();
            }
		});
		$.ajax({
				type: "get",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/getDevAttr?DevNo="+devNo+"&",
				async: !0,
				timeout: 15e3,
				beforeSend: function (xhr) {
			},
			success: function (data) {
				console.log("data = %s \n", data);
				var json = $.parseJSON(data);	
				if(json.statusCode == 1){
					var jsonCtlType = json.CtlType;
					var jsonDevName = json.DevName;
					var jsonDevType = json.DevType;
					var jsonDevId = json.DevId;
					var jsonDelayTime = json.DelayTime;
					var jsonAutoCloseEn = json.AutoCloseEn;
					var jsonAlarmType = json.AlarmType;
					var jsonAlarmTone = json.AlarmTone;
					var jsonAlarmCall = json.AlarmCall;
					var jsonFaultCall = json.FaultCall;
					var jsonAlarmSms = json.AlarmSms;
					var jsonFaultSms = json.FaultSms;
					var jsonChn1 = json.Chn1;
					var jsonChn2 = json.Chn2;
					var jsonChn3 = json.Chn3;
					var jsonChn4 = json.Chn4;
					var jsonLinkAreaNo = json.LinkAreaNo;
					var jsonLinkDevNo = json.LinkDevNo;
					var jsonSubDevSel = json.SubDevSel;
					var jsonOptCmd = json.OptCmd;
					var jsonAreaList = json.AreaList;
					var strLable;
					//开始赋值给控件填充数据
					$('#devTypeSel').selected('disable');
					$('#ctlTypeSel').selected('disable');
					$("#DevID").prop("disabled", !0);
					$("#ctlTypeSel").find("option[value="+jsonCtlType+"]").attr("selected",true);
					if("0" == jsonCtlType) strLable = g_oCommon.getNodeValue('laWls');
					else if("8" == jsonCtlType) strLable = g_oCommon.getNodeValue('laWired');
					else strLable = g_oCommon.getNodeValue('laWls');
					$("#laWls").html(strLable);
					$("#devTypeSel").find("option[value="+jsonDevType+"]").attr("selected",true);
					$("#DevName").val(jsonDevName);
					$("#DevID").val(jsonDevId);
					
					for(index=0; index<alarmDevTypeTable.length; index++)
					{
						if(alarmDevTypeTable[index] == devType) {alarmDevFlag = 1; break;}	
					}
					
					for(index=0; index<smartDevTypeTable.length; index++)
					{
						if(smartDevTypeTable[index] == devType) {smartDevFlag = 1; break;}
					}
					console.log("alarmDevFlag = %s, smartDevFlag = %s \n", alarmDevFlag, smartDevFlag);
					//报警设备类型
					if(alarmDevFlag == 1 || devType == "REMOTE_CTL" || devType == "KEY_BOARD" || devType == "EMERGENCY_BUTTOM" || devType == "UNKNOWN")
					{
						if(jsonAutoCloseEn == 1) $("#autoCloseEn").prop("checked", !0);
						else $("#autoCloseEn").prop("checked", !1);
						$("#alarmTypeSel").find("option[value="+jsonAlarmType+"]").attr("selected",true);
						$("#alarmToneSel").find("option[value="+jsonAlarmTone+"]").attr("selected",true);
						if(jsonAlarmCall == 1) $("#alarmCall").prop("checked", !0);
						else $("#alarmCall").prop("checked", !1);
						if(jsonFaultCall == 1) $("#faultCall").prop("checked", !0);
						else $("#faultCall").prop("checked", !1);
						if(jsonAlarmSms == 1) $("#alarmSms").prop("checked", !0);
						else $("#alarmSms").prop("checked", !1);
						if(jsonFaultSms == 1) $("#faultSms").prop("checked", !0);
						else $("#faultSms").prop("checked", !1);
						if(jsonChn1 == 1) $("#Chn1").prop("checked", !0);
						else $("#Chn1").prop("checked", !1);
						if(jsonChn2 == 1) $("#Chn2").prop("checked", !0);
						else $("#Chn2").prop("checked", !1);
						if(jsonChn3 == 1) $("#Chn3").prop("checked", !0);
						else $("#Chn3").prop("checked", !1);
						if(jsonChn4 == 1) $("#Chn4").prop("checked", !0);
						else $("#Chn4").prop("checked", !1);
						$("#smartAreaSel").find("option[value="+jsonLinkAreaNo+"]").attr("selected",true);
						that.changeAreaSelect(jsonLinkAreaNo);
						$("#smartDevSel").find("option[value="+jsonLinkDevNo+"]").attr("selected",true);
						$("#smartDevIndexSel").find("option[value="+jsonSubDevSel+"]").attr("selected",true);
						$("#smartDevOptSel").find("option[value="+jsonOptCmd+"]").attr("selected",true);
						//给遥控器和键盘所能控制的区域打勾
						if(devType == "REMOTE_CTL" || devType == "KEY_BOARD"){
							var linkAreaList = json.AreaList;
							for(index=0; index<linkAreaList.linkArea.length; index++){
								if(linkAreaList.linkArea[index].Sel)
									document.getElementById("area" + linkAreaList.linkArea[index].AreaNo).checked=true;
								else
									document.getElementById("area" + linkAreaList.linkArea[index].AreaNo).checked=false;
							}
						}
					}
					//智能设备类型
					else if(smartDevFlag == 1)
					{
						$("#delayTime").val(jsonDelayTime);
						if(jsonAutoCloseEn == 1) $("#autoCloseEn").prop("checked", !0);
						else $("#autoCloseEn").prop("checked", !1);
					}
				}
			},
			timeOut: function (data){
				alert("请求数据超时");
			}
		})
	},
	
	//保存设备参数
	//modalID:模态框ID
	//devID：设备ID
	//devType:设备类型
	devParaSave: function(modalID,devNo,devType)
	{
		var that=this;
		var json = {};
		//基本设置参数
		json.DevNo = parseInt(devNo,10);
		json.AreaNo = parseInt($("#AreaSel").val(),10);
		json.DevName = $("#DevName").val();
		json.DevType = $("#devTypeSel").val();
		json.DevId = $("#DevID").val();
		var alarmDevFlag = 0;
		var smartDevFlag = 0;
		for(index=0; index<alarmDevTypeTable.length; index++)
		{
			if(alarmDevTypeTable[index] == devType) {alarmDevFlag = 1; break;}				
		}
		for(index=0; index<smartDevTypeTable.length; index++)
		{
			if(smartDevTypeTable[index] == devType) {smartDevFlag = 1; break;}
		}
		console.log("alarmDevFlag = %s, smartDevFlag = %s \n", alarmDevFlag, smartDevFlag);
		
		//报警设备类型
		if(alarmDevFlag == 1 || devType == "REMOTE_CTL" || devType == "KEY_BOARD" || devType == "EMERGENCY_BUTTOM" || devType == "UNKNOWN")
		{
			//设备报警设置参数
			json.AlarmType = $("#alarmTypeSel").val();
			json.AlarmTone = $("#alarmToneSel").val();
			//控制区域选择
			var AreaJson = areaListContent;
			var AreaNum = AreaJson.AreaNum;
			var index,areaNo;
			//////////////////////////////
			if(devType == "REMOTE_CTL" || devType == "KEY_BOARD")
			{
				var linkAreaList=[];
				
				for(index=0; AreaNum>index; index++){
					var linkArea={};
					linkArea["AreaNo"] =  AreaJson.item[index].AreaNo;
					
					if($("#area"+areaNo).prop("checked"))
						linkArea["Sel"] = 1;
					else
						linkArea["Sel"] = 0;
					
					linkAreaList.push(linkArea);
				}
				
				json.AreaList = linkAreaList;
			}
			/////////////////////////////
			if($("#alarmCall").prop("checked")) json.AlarmCall = 1;
			else json.AlarmCall = 0;
			if($("#faultCall").prop("checked")) json.FaultCall = 1;
			else json.FaultCall = 0;
			if($("#alarmSms").prop("checked")) json.AlarmSms = 1;
			else json.AlarmSms = 0;
			if($("#faultSms").prop("checked")) json.FaultSms = 1;
			else json.FaultSms = 0;	
			//关联摄像头参数
			if($("#Chn1").prop("checked")) json.Chn1 = 1;
			else json.Chn1 = 0;	
			if($("#Chn2").prop("checked")) json.Chn2 = 1;
			else json.Chn2 = 0;	
			if($("#Chn3").prop("checked")) json.Chn3 = 1;
			else json.Chn3 = 0;	
			if($("#Chn4").prop("checked")) json.Chn4 = 1;
			else json.Chn4 = 0;
			//智能设备联动参数
			///json.SmartAreaID = $("#smartAreaSel").val();
			json.LinkDevNo = parseInt($("#smartDevSel").val(),10);
			json.SubDevSel = parseInt($("#smartDevIndexSel").val(),10);
			json.OptCmd = parseInt($("#smartDevOptSel").val(),10); 
			if("8" == json.CtlType)
			{
				var wiredAddr = parseInt(json.DevId, 10);
				if((wiredAddr<0)||(wiredAddr>2))
				{
					AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('wiredAddrErr'),
							timeout:1000
						});
					return ;
				}
			}
		}
		//智能设备类型
		else if(smartDevFlag == 1)
		{
			json.DelayTime = $("#delayTime").val();
			if($("#autoCloseEn").prop("checked")) json.AutoCloseEn = 1;
			else json.AutoCloseEn = 0;
		}
		var jsonStr = JSON.stringify(json);
		console.log("devParaSave jsonStr = %s \n", jsonStr);
		
		//新添加提交保存数据
		if (devNo == ""){
			$.ajax({
				type: "put",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/newDevAttr",
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
				
						that._GetZoneAreaList();
						that._GetDeviceList();
					}
					else if(json_rcv.statusCode == -1){
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('DevExist'),
							timeout:1000
						});
					}
					else if(json_rcv.statusCode == -2){
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('DevFull'),
							timeout:1000
						});
					}
					else if(json_rcv.statusCode == -3){
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('DevTypeErr'),
							timeout:1000
						});
					}
					else {
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('AddFailed'),
							timeout:1000
						});
					}
				},
				complete: function(t) {
					$(modalID).modal('close');
				}
			})
		}
		//编辑保存数据
		else
		{
			$.ajax({
				type: "post",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/setDevAttr",
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
						that._GetZoneAreaList();
						that._GetDeviceList();
					}
					else{
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('EditFailed'),
							timeout:1000
						});
					}
				},
				complete: function(t) {
					$(modalID).modal('close');
				}
			})
		}
	},
	//删除设备
	delOneDev:function (devNo){
        var jsonCmd = {};
			jsonCmd.DevNo = parseInt(devNo,10);
		var jsonStr = JSON.stringify(jsonCmd);
		var that = this;
		AMUI.dialog.confirm({
			title: translator.translateNode(this._lxdDevice, "dialogTitle"),
			content: translator.translateNode(this._lxdDevice, "dialogContent1"),
			btnConfirm: translator.translateNode(this._lxdDevice, "btnConfirm"),
			btnCancel: translator.translateNode(this._lxdDevice, "btnCancel"),
			onConfirm: function() {
			console.log('onConfirm');
			$.ajax({
				type: "put",
				url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/smart/deldevAttr",
				timeout: 15e3,
				async: !1,
				processData: !1,
				data: jsonStr,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("If-Modified-Since", 0);
					xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
				},
				
				success: function (data) {
					console.log("data = %s \n", data);
					var json = $.parseJSON(data);	
					if(json.statusCode == 1){
						AMUI.dialog.tip({
							tip: g_oCommon.getNodeValue('DelOk'),
							timeout:1000
						});
						///window.location.reload();
						//重新加载设备列表
						that._GetZoneAreaList();
						that._GetDeviceList();
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

var g_oDevice= new Device();