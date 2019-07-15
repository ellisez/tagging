
function loadCssCode(code){
    var style = document.createElement('style');
    style.type = 'text/css';
    style.rel = 'stylesheet';
    //for Chrome Firefox Opera Safari
    style.appendChild(document.createTextNode(code));
    //for IE
    //style.styleSheet.cssText = code;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(style);
}
function saveFile(content) {
	var filename = location.pathname.replace(/.*\/([^\/]+)$/g, '$1');
      // 创建a标签
      var elementA = document.createElement('a');
      
      //文件的名称为时间戳加文件名后缀
	  var date = new Date();
	  var dateString = date.getFullYear()+''+
		((date.getMonth()+1)<10?'0'+(date.getMonth()+1):(date.getMonth()+1))+''+
		(date.getDate()<10?'0'+date.getDate():date.getDate())+''+
		(date.getHours()<10?'0'+date.getHours():date.getHours())+''+
		(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())+''+
		(date.getSeconds()<10?'0'+date.getSeconds():date.getSeconds());
	  filename = filename.replace(/(\..*?)$/, '~'+dateString+'$1');
      elementA.download = filename;
      elementA.style.display = 'none';
      
      //生成一个blob二进制数据，内容为json数据
      var blob = new Blob([content]);
      
      //生成一个指向blob的URL地址，并赋值给a标签的href属性
      elementA.href = URL.createObjectURL(blob);
      document.body.appendChild(elementA);
      elementA.click();
      document.body.removeChild(elementA);
}
function deg(p1, p2) {
	var y = p2.y-p1.y;
	var x = p2.x-p1.x;
	if (x==0) {
		if (y==0) {
			return 0;
		} else if (y>0) {
			return 90;
		} else {
			return -90;
		}
	}
	var slope = y/x;
	var deg = Math.atan(slope)*180/Math.PI;
	if (x>0) {
		return deg<0?-deg:360-deg;// 0-360
	} else if(x<0) {
		return deg=180-deg;
	}
	return deg;
}

function lineTo(no, p1, p2, color='blue', api=''){
	var element = document.getElementById('taggings');
	
	var tagging =  document.querySelector('div[no="'+no+'"]');
	if (!tagging) {
		tagging = document.createElement("div");
		tagging.setAttribute('no', no);
		tagging.style.width='1px';
		tagging.style.height='1px';
		tagging.style.position = 'absolute';
		tagging.style.overflow='visible';
		element.appendChild(tagging);
	}
	tagging.style.left = p1.x+'px';
	tagging.style.top = p1.y+'px';

	var svg = tagging.querySelector('svg');
	if (!svg) {
		svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.style.width='1px';
		svg.style.height='1px';
		svg.style.overflow='visible';
		tagging.appendChild(svg);
	}
	
	var arrow = svg.querySelector('polygon');
	if (!arrow) {
		arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
		arrow.setAttribute('points', '0,0 10,10 10,-10');
		svg.appendChild(arrow);
	}
	arrow.setAttribute('fill', color);
	var arrowDeg = -deg(p1, p2);
	
	arrow.style.transform='rotate('+arrowDeg+'deg)';
	
	var line = svg.querySelector('path');
	if (!line) {
		line = document.createElementNS("http://www.w3.org/2000/svg", "path");
		line.setAttribute('stroke-width', '5');
		line.setAttribute('fill', 'none');
		svg.appendChild(line);
	}
	var radian=arrowDeg*Math.PI/180;//弧度
	var startX=Math.cos(radian)*10;
	var startY=Math.sin(radian)*10;
	var endX = p2.x-p1.x;
	var endY = p2.y-p1.y;
	line.setAttribute('d', 'M '+startX+' '+startY+' '+endX+' '+endY);//q 0 10
	line.setAttribute('stroke', color);
	
	var tagElement = tagging.querySelector('.tagbody');
	if (!tagElement) {
		tagElement = tagbody(api);
		tagging.appendChild(tagElement);
	}
	var tagX = endX<0?endX-200:endX;
	tagElement.style.left=tagX+'px';
	tagElement.style.top=endY+'px';
	tagChecked(tagElement);
}
function tagChecked(element) {
	var list = document.querySelectorAll('.tagbody');
	for (var item of list) {
		if (item == element) {
			item.setAttribute('checked', 'true');
		} else {
			item.removeAttribute('checked');
		}
	}
}
function tagbody(api) {
	var tagbody = document.createElement('div');
	tagbody.setAttribute('class', 'tagbody');
	tagbody.setAttribute('onclick', 'tagChecked(this)');
	tagbody.setAttribute('onmousedown', 'tagbodyMousedown(event)');
	tagbody.innerHTML='\
<input name="api" type="text" value="'+api+'" placeholder="请输入api" title="双击访问url" ondblclick="window.open(this.value)" />\
<textarea name="decription" type="text" value="" placeholder="请输入接口描述"></textarea>\
';
	return tagbody;
}
function findParent(element) {
	if (!element) {
		return null;
	}
	if (element.getAttribute('no')!=null) {
		return element;
	} else {
		return findParent(element.parentNode);
	}
}
function urlparams(url) {
	var result = {};
	var searchArray = url.split('?');
	if (searchArray.length>1) {
		search = searchArray[1];
		var paramStrings=search.split('&');
		for (var paramString of paramStrings) {
			var paramArray = paramString.split('=');
			if (paramArray.length>=2) {
				result[paramArray[0]]=decodeURI(paramArray[1]);
			}
		}
	}
	return result;
}

function tagbodyMousedown(event) {
	if (event.button==2) {
		event.stopPropagation();
		var tagElement = findParent(event.target);
		
		tagging.x=parseFloat(tagElement.style.left.replace(/(\d+)px/g, '$1'));
		tagging.y=parseFloat(tagElement.style.top.replace(/(\d+)px/g, '$1'));
		no = tagElement.getAttribute('no');
		status = 1;
	}
}

(function() {

//////////////////
window.status = 0;//0 gone,1 doing
window.tagging={x:0, y:0};
window.no = -1;
window.defaultApi='';
window.defaultColor='blue';

document.body.style.position = 'relative';
// document.body.style.width='100%';
// document.body.style.height='100%';

var element = document.createElement('div');
element.setAttribute('id', 'taggings');
document.body.appendChild(element);

var script=document.querySelector('script[src*="tagging.js"]');
if (script) {
	var url = script.getAttribute('src');
	var params = urlparams(url);
	defaultApi=params['api'] || '';
	defaultColor=params['color'] || 'blue';
}

loadCssCode('\n\
.tagbody {\n\
	position: absolute;\n\
	width: 200px;\n\
	overflow: visible;\n\
	background-color:#ececec;\n\
	display: flex;\n\
	flex-direction: column;\n\
	justify-content: flex-start;\n\
	align-items: stretch;\n\
	box-sizing: border-box;\n\
	border:4px solid #ececec;\n\
}\n\
.tagbody[checked="true"] {\n\
	border-color:'+defaultColor+';\n\
	\n\
}\n\
.tagbody [name="api"] {\n\
	border:none;\n\
	background:white;\n\
	text-decoration: underline;\n\
	color: blue;\n\
}\n\
.tagbody [name="api"]:focus {\n\
	text-decoration: none;\n\
	color: red;\n\
}\n\
\n\
.tagbody [name="decription"] {\n\
	background:white;\n\
	resize: vertical;\n\
	color: blue;\n\
}\n\
.tagbody [name="decription"]:focus {\n\
	background:none;\n\
	color: red;\n\
}\n\
');

document.body.onkeydown = function(event) {
	if (event.keyCode==83&&event.ctrlKey) {
		event.preventDefault();
		saveFile(document.documentElement.innerHTML);
	} else if (event.keyCode==46||event.keyCode==8) {
		var currentTagbody = document.querySelector('.tagbody[checked]');
		currentTagbody = findParent(currentTagbody);
		if (currentTagbody) {
			currentTagbody.remove(); 
		}
	}
}
		
function next() {
	for (var i=1;i<1000 ;i++) {
		var element = document.querySelector('div[no="'+i+'"]');
		if (!element) {
			no = i;
			return;
		}
	}
}
document.body.addEventListener('mousemove', function(event) {
	if (status>0) {
		console.log('绘图');
		var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
		var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
		
		var targetX = event.pageX || event.clientX + scrollX;
		var targetY = event.pageY || event.clientY + scrollY;
		
		lineTo(no, tagging, {x:targetX, y:targetY}, defaultColor, defaultApi);
	}
}, false);

document.body.addEventListener('mousedown', function(event) {
	if (event.button==2) {
		var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
		var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
		
		tagging.x = event.pageX || event.clientX + scrollX;
		tagging.y = event.pageY || event.clientY + scrollY;
		status = 1;
		next();
	}
}, false);

document.body.addEventListener('mouseup', function(event) {
	if (event.button==2) {
		status = 0;
	}
}, false);

document.body.addEventListener('contextmenu', function(event) {
	event.preventDefault();
	console.log('contextmenu');
}, false);

})();
