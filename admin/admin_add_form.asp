<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<% 
If Request.QueryString("cat")="" then Response.Redirect"index.asp" 
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html XMLNS:ACE>
<head>
	<?import namespace="ACE" implementation="ace.htc" />
	<script language="JavaScript">
	function Init()
		{
		//Please set editorWidth > (larger than) 580 and editorHeight > (larger than) 345.
		idContent.editorWidth = "580";
		idContent.editorHeight = "345";
				
		/*Provide base url to enable relative path feature
		Example :
			If this is the location of your editor :
			http://localhost/ContentEditor/folder01/folder02/default.asp
			then use :
			var baseUrl = "http://localhost/ContentEditor/";
			var baseUrlNew = "../../";
					
			If this is the location of your editor :
			http://localhost/ContentEditor/folder01/default.asp
			then use :
			var baseUrl = "http://localhost/ContentEditor/";
			var baseUrlNew = "../";		
		*/
		idContent.baseUrl = "http://www.snowrunforfun.org/admin/";
		idContent.baseUrlNew = "../";
		
		//Use or not use Save Button
		idContent.useSave = true;
		
		//fill editor with content
		
		}
		function OpenImgLookup()
		{
		//You can provide your own image library here. 
		//This is just to show how to use/open Image Library (using our built in ASP-based Image Library)
		var popleft=((document.body.clientWidth - 440) / 2)+window.screenLeft; 
		var poptop=(((document.body.clientHeight - 460) / 2))+window.screenTop-40;		
		window.open("ace_Image_app.asp","NewWindow","scrollbars=NO,width=480,height=520,left="+popleft+",top="+poptop)
		}
			
		function Save()
		{
		//Transfer the edited content to the form
		Form1.txtContent.value=idContent.content
		
		//You can validate your form here
		if (Form1.menuPageName.value == "")
			{
			alert("Please fill the Link Name.");
			return ;
			}
		Form1.submit();
		}
		
	</script>	
	<link rel="STYLESHEET" type="text/css" href="style.css">
</head>
<body onload="Init()">
<!--#include file="admin_menu.asp"-->

<table><tr><td>
<font face="Verdana"> 
<h3>Add new document</h3>
<div>
<form action="admin_add_code.asp" method="POST" name="SaveForm" ID=Form1>
<input type="hidden" name="menuCategory" value="<%= Request.QueryString("cat") %>">
<input type="Text" name="menuPageName" ID=Text1>Link Name: (or filename <u>without</u> ".asp" extension)<br>
<input type="hidden" name="txtContent"  value="" ID=Hidden1>
<p>HTML Body<br>
<ACE:AdvContentEditor id="idContent" content="" onSave="Save();" onImgLookupOpen="OpenImgLookup()" />
<br>
</form>


</div>

</font></td></tr></table>
</body>
</html>










