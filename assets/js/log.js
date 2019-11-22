function SysLog() {
    this._lxdSysLog = null;  //SysLog.xml
	
	this.m_LogTime = new Array(2048);
	this.m_EventType = new Array(2048);
	this.m_Area = new Array(2048);
	this.m_UserOrDev = new Array(2048);
	this.m_Detail = new Array(2048);
	
	this.m_LogItemNum=0;
}

SysLog.prototype = {
	//主页面初始化函数	
	initPage: function () {
		getMenuList();//加载菜单列表等文本
		///getLogList(5,'lTypeAlarm');//获取报警记录
		var szLanguage = $.cookie("language");
		translator.initLanguageSelect(szLanguage);
		this._lxdSysLog = translator.getLanguageXmlDoc("SysLog");
		translator.translatePage(this._lxdSysLog, document);
		this.initDate();
		m_LogItemNum = 0;
		this.getSysLogList(0);
		
		g_oSysLog.syncMsg();
		setInterval("g_oSysLog.syncMsg()", 2000);
	},
	//初始化日期控件
	initDate:function(){
		var time=new Date();
		var year = time.getFullYear();
		var month = time.getMonth()+1;
		var newMonth = month>9?month:"0"+month;  //月
		var day = time.getDate();
		var newDay = day>9?day:"0"+day;  //日
		
		$("#my-startDate").val(year+"-"+newMonth+"-"+newDay);		
		var selLanguage = "";
		var szLanguage =$.cookie("language");
		if(szLanguage === "en") selLanguage="en_US";
		else if(szLanguage === "zh") selLanguage="zh_CN";
		
		$('#my-start').datepicker({
			//locale:  'en_US',默认是中文
			locale: selLanguage,
			format: 'yyyy-mm-dd'
		});
		
		$('#my-start').datepicker().on('changeDate.datepicker.amui', function(event) {
			$('#my-startDate').val($('#my-start').data('date'));
		});
	},
	
	showSysLogList: function(){
		var that = this;
		var nums = 10; //每页出现的数量
		var pages = Math.ceil(that.m_LogItemNum / nums); //得到总页数
		var laFirstPage = translator.translateNode(that._lxdSysLog, "laFirstPage");
		var laLastPage = translator.translateNode(that._lxdSysLog, "laLastPage");
		if(1 == pages)
			pages = 2;
		else if(0 == pages)
			pages = 2;
		
		var thisDate = function(curr) {
			var list = '',
				last = curr * nums - 1;
			last = last >= that.m_LogItemNum ? (that.m_LogItemNum - 1) : last;
			for (var i = (curr * nums - nums); i <= last; i++) {
				var logID = i+1;
				var logTime = that.m_LogTime[i];
				var EventType = that.m_EventType[i];
				var strEventType = getPubXmlStr(EventType);
				var AreaName = that.m_Area[i];
				var DeviceUser = that.m_UserOrDev[i];
				var LogDetail = that.m_Detail[i];
				list += "<tr>";
				list += " 	<td>"+logID+"</td>";
				list += "	<td>"+logTime+"</td>";
				list += "	<td>"+strEventType+"</td>";
				list += "	<td>"+AreaName+"</td>";
				list += "	<td>"+DeviceUser+"</td>";
				list += "	<td>"+LogDetail+"</td>";
				list += "</tr>";
			}
			return list;
		};
		console.log("pages ========================= pages = %s\n", pages);
		//返回的是一个page示例，拥有实例方法
		var $page = $("#page").page({
			pages: pages, //页数
			curr: 1, //当前页 
			theme: 'default', //主题
			groups: 5, //连续显示分页数
			prev: '<', //若不显示，设置false即可
			next: '>', //若不显示，设置false即可        
			//first: "首页",
			first: laFirstPage,
			//last: "尾页", //false则不显示
			last: laLastPage,
			before: function(context, next) { //加载前触发，如果没有执行next()则中断加载
				console.log('start load...');
				context.time = (new Date()).getTime(); 
				next();
			},
			render: function(context, $element, index) {
				//逻辑处理
				if (index == 'last') { 
					$element.find('a').html(laLastPage);//显示最后一页
					return $element; 
				}
				return false; //没有返回值则按默认处理
			},
			after: function(context, next) { 
				var time = (new Date()).getTime(); 
				console.log('分页组件加载完毕，耗时：' + (time - context.time) + 'ms');
				next();
			},
			/*
			 * 触发分页后的回调，如果首次加载时后端已处理好分页数据则需要在after中判断终止或在jump中判断first是否为假
			 */
			jump: function(context, first) {
				console.log('当前第：' + context.option.curr + "页");
				$("#content").html(thisDate(context.option.curr));
			}
		});
	},
	//获取日志列表
	getSysLogList: function (pos) {
		var that = this;
		var iType = $("#iTypeSel").val();
		var startDate = $("#my-startDate").val();
		
		var jsonReq = {};
		
		if(0==parseInt(pos,10))
		{
			that.m_LogItemNum = 0;
		}
		
		if(1 == iType)
		{
			jsonReq.Cmd=7112;
			jsonReq.Def="JSON_CMD_GET_LOG_ALARM";
		}
		else if(2 == iType)
		{
			jsonReq.Cmd=7113;
			jsonReq.Def="JSON_CMD_GET_LOG_CTRL";
		}
		else if(3 == iType)
		{
			jsonReq.Cmd=7114;
			jsonReq.Def="JSON_CMD_GET_LOG_SYSTEM";
		}
		else	
		{
			jsonReq.Cmd=7112;
			jsonReq.Def="JSON_CMD_GET_LOG_ALARM";
		}
			
		jsonReq.Id = "web";
		jsonReq.User = 123;
		jsonReq.Date = startDate;
		jsonReq.Offset = parseInt(pos,10);
		jsonReq.Count = 0;
						
		var jsonReqStr = JSON.stringify(jsonReq);
		console.log("getSysLogList jsonReqStr = %s \n", jsonReqStr);
		$.ajax({
			type: "get",
			url: g_oCommon.m_lHttp + g_oCommon.m_szHostName + ":" + g_oCommon.m_lHttpPort + "/jsonStruct_get&"+Base64.encode(jsonReqStr)+"&",
			async: !0,
			timeout: 15000,
			beforeSend: function(xhr) {
				xhr.setRequestHeader("If-Modified-Since", "0");
				xhr.setRequestHeader("Authorization", "Basic " + g_oCommon.m_szUserPwdValue);
			},
			success: function (data){	
				var jsonRcv = $.parseJSON(data);
				console.log("getSysLogList data = %s \n", data);
				for(var index=jsonRcv.Offset; (index<jsonRcv.Total)&&((index+that.m_LogItemNum)<2048); index++)
				{
					that.m_LogTime[index+that.m_LogItemNum] = jsonRcv.L[index].T;
					if(1 == iType)
					{
						that.m_EventType[index+that.m_LogItemNum] ="code"+jsonRcv.L[index].C;
						that.m_Area[index+that.m_LogItemNum] = jsonRcv.L[index].R;
						that.m_UserOrDev[index+that.m_LogItemNum] = jsonRcv.L[index].N;
						that.m_Detail[index+that.m_LogItemNum] = jsonRcv.L[index].I;
					}
					else if(2 == iType)
					{
						var optEventStrTable = new Array("strReserve","strArm","strHome","strDisarm","strDelDev","strAddDev","strEditDev","strEditGsm","strEditCms","strEditShipMode","strEditIp","strDownloadRecord","strEditMcuPwd","strEditRdSheld","strEavsEpgrade","strMcuUpgrade","strEditHddCover","strEditHddExcept","strEditVideoLoss","strEditMcu","strEditMotion","strLogin","strLogout","strChangePara","strSyncTime","strFactory","strHddFormat","strEditNtp","strEditTime");
						if(0==jsonRcv.L[index].M) that.m_Area[index+that.m_LogItemNum] = "Cms";
						else if(1==jsonRcv.L[index].M) that.m_Area[index+that.m_LogItemNum] = "Local";
						else if(2==jsonRcv.L[index].M) that.m_Area[index+that.m_LogItemNum] = "P2p";
						else if(3==jsonRcv.L[index].M) that.m_Area[index+that.m_LogItemNum] = "Net";
						else that.m_Area[index+that.m_LogItemNum] = "Local";
						
						that.m_UserOrDev[index+that.m_LogItemNum] = jsonRcv.L[index].U;
						
						var optEventIndex = jsonRcv.L[index].E;
						
						if(optEventIndex>28) optEventIndex=0;
						if(optEventIndex<0) optEventIndex=0;
						that.m_EventType[index+that.m_LogItemNum] = optEventStrTable[optEventIndex];
						that.m_Detail[index+that.m_LogItemNum] = "";
					}
					else if(3 == iType)
					{
						if(0==jsonRcv.L[index].E) that.m_EventType[index+that.m_LogItemNum] = "strReserve";
						else if((1==jsonRcv.L[index].E)||(2==jsonRcv.L[index].E))  that.m_EventType[index+that.m_LogItemNum] = "strReboot";
						that.m_Area[index+that.m_LogItemNum] ="";
						that.m_UserOrDev[index+that.m_LogItemNum] = "";
						that.m_Detail[index+that.m_LogItemNum] = "";
					}
				}
				
				that.m_LogItemNum = that.m_LogItemNum + jsonRcv.Total-jsonRcv.Offset;
				if(that.m_LogItemNum > 2048)
					that.m_LogItemNum = 2048;
				
				if(0 == jsonRcv.FinishFlag)
				{
					that.getSysLogList(that.m_LogItemNum);
				}
				else
				{
					that.showSysLogList();
				}
			},
			error: function(xhr, textStatus, errorThrown) {
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

var g_oSysLog= new SysLog();