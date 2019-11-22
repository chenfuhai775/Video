jQuery.extend({
	//计算字符串长度，一个双字节字符长度计2，ASCII字符计1
	lengthw: function(_str) {
		return  _str.replace(/[^\x00-\xff]/g,"rr").length; 
	},
	//是否为空字符串
	isEmpty: function(_str) {
		var tmp_str = jQuery.trim(_str);
		return tmp_str.length == 0; 
	},
	isChinese: function(_str) {
		var reg = /[^-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~;:,\[\]@()<>\u0022]/;
		return reg.test(_str);
	},	
	//是否为合法电子邮件地址
	isEmail: function(_str) {
		return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(_str); 
	},
	isHKDDNS: function(_str) 
	{
		var regTextUrl = /^([a-z]|[a-z][-a-z0-9]{0,62}[a-z0-9])$/;
		return regTextUrl.test(_str);
	},
	//是否为合法ip地址
	isIpAddress: function(_str) {
		if (_str.length == 0) {
			return (false);
		}
		reVal = /^(\d{1}|\d{2}|[0-1]\d{2}|2[0-4]\d|25[0-5])\.(\d{1}|\d{2}|[0-1]\d{2}|2[0-4]\d|25[0-5])\.(\d{1}|\d{2}|[0-1]\d{2}|2[0-4]\d|25[0-5])\.(\d{1}|\d{2}|[0-1]\d{2}|2[0-4]\d|25[0-5])$/;
		return (reVal.test (_str));    
	},
	//是否为D类地址
	isDIpAddress: function(_str) {  
		var re=/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/; //匹配IP地址的正则表达式   
	    if(re.test(_str)) {   
	  		if(RegExp.$1 ==0 && RegExp.$2==0 && RegExp.$3==0 && RegExp.$4==0) {
				return true;
			}
	    	if(RegExp.$1 >0 &&RegExp.$1 <224 && RegExp.$2<256 && RegExp.$3<256 && RegExp.$4<256) {
				return true;
			}
	  	}
		return false;    
	},
	//是否为有效的IPV6地址
	isIPv6: function(_str) {
	  return /:/.test(_str) && _str.match(/:/g).length<8 && /::/.test(_str)?(_str.match(/::/g).length==1 && /^::$|^(::)?([\da-f]{1,4}(:|::))*[\da-f]{1,4}(:|::)?$/i.test(_str)):/^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i.test(_str);
	},
	//是否为多播地址
	isMulticastIP: function(_str) {  
		var re=/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/; //匹配IP地址的正则表达式   
		if(re.test(_str)) {   
	  		if(RegExp.$1 ==0 && RegExp.$2==0 && RegExp.$3==0 && RegExp.$4==0) {
				return true;
			}
	  		if(RegExp.$1 >223 &&RegExp.$1 <240 && RegExp.$2<256 && RegExp.$3<256 && RegExp.$4<256) {
				return true;
			}
		}
	  	return false;
	},
	//是否为非负整数一定范围里 add 20091207
	isCosinaIntNum:function(_str,iMin,iMax) {
		if(_str > iMax || _str < iMin) {
			return false;
		}
		var iret = /^[0-9]*$/.test(_str);
		if(iret == false) {
			return false;
		}
		return /^[0-9]\d*|0$/.test(_str);
	}
});
Date.prototype.Format = function(fmt) {
	var o = {
		"M+" : this.getMonth()+1,                 //月份 
    	"d+" : this.getDate(),                    //日 
    	"h+" : this.getHours(),                   //小时 
    	"m+" : this.getMinutes(),                 //分 
    	"s+" : this.getSeconds(),                 //秒 
    	"q+" : Math.floor((this.getMonth()+3)/3), //季度 
    	"S"  : this.getMilliseconds()             //毫秒 
	}; 
    if(/(y+)/.test(fmt)) {
    	fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}
	for(var k in o) {
    	if(new RegExp("("+ k +")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
		}
	}
	return fmt; 
}