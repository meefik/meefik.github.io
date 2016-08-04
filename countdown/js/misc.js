var timer = [0,0,0,0,0,0];

function parseGetParams() { 
	var $_GET = {}; 
	var __GET = window.location.search.substring(1).split("&"); 
	for(var i=0; i<__GET.length; i++) { 
		var getVar = __GET[i].split("="); 
		$_GET[getVar[0]] = typeof(getVar[1])=="undefined" ? "" : getVar[1]; 
	} 
	return $_GET; 
} 

$(document).ready(function(){
	var GETArr = parseGetParams(); 	
	if (GETArr.timer) {
		timer = GETArr.timer.split('.');
	}
	$('#timer_btn').click(function(e){
		e.preventDefault();
		var retVal = prompt("Введите дату события: ", "DD.MM.YYYY hh:mm:ss");
		var url = retVal.replace(' ','.').replace(':','.');
		window.location.href = '/countdown/?timer='+url;
	});
});
