<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
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
		  (used for constructing relative path instead of 
		   the default complete path when inserting links or images)
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
		idContent.content=idContentTemp.innerHTML
		}	
	/*
	5.b. OPEN IMAGE LIBRARY LOOKUP
	*/				
	function OpenImgLookup()
		{
		//You can provide your own image library here. 
		//This is just to show how to use/open Image Library (using our built in ASP-based Image Library)
		var popleft=((document.body.clientWidth - 440) / 2)+window.screenLeft; 
		var poptop=(((document.body.clientHeight - 460) / 2))+window.screenTop-40;		
		window.open("ace_Image_app.asp","NewWindow","scrollbars=NO,width=480,height=520,left="+popleft+",top="+poptop)
		}
	/*
	5.c. HANDLE THE SAVE ACTION
	*/				
	function Save()
		{
  		Form1.txtContent.value = idContent.content;
		
  		Form1.submit();	
  		}	
	</script>
	<!-- /STEP 4 -->
	
	
<link rel="STYLESHEET" type="text/css" href="style.css">
</head>



<!-- STEP 3 : PREPARE BODY ATTRIBUTE -->
<body onload="Init()" style="FONT-FAMILY: Verdana;FONT-SIZE: x-small;">
<!-- /STEP 3 -->

<!--#include file="admin_menu.asp"-->

<%
	protected=""
	myID=Request.QueryString("id")
	IF myID = "" THEN response.redirect"index.asp"
	
	if instr(myID,"?")>0 then protected="protected"
	if instr(myID,"@")>0 then protected="protected"
	
%>

<h3>Edit Web Page... <%= myID %></h3>

<%
myFileName=Server.MapPath("../")&"\"&myID
Set MyFileObject=Server.CreateObject("Scripting.FileSystemObject")
if MyFileObject.FileExists(myFileName) then
Set myFileContents=MyFileObject.OpenTextFile(myFileName)
myHtml=myFileContents.ReadAll
myFileContents.close
HString="<!-- Start HTML Content -->"
FString="<!-- End HTML Content -->"
HStringLen=len(HString)
PHtml=mid(myHtml,instr(myHtml,HString)+HStringLen)
FTrim=instr(PHtml,FString)-1
Output=left(PHtml,FTrim)

if instr(Output,"<%")>0 then
protected="protected"
end if
end if
%>

<% if protected="protected" then %>
<p>This page contains scripts and cannot be edited using this interface.  If you would like to replace this page with a static page, first un-link this page and then add your static page.</p>
<p>If there are changes that you require for this page, please email them to <a href="mailto:mcox@nwon.com?subject=Changes required for: <%= myID %>">mcox@nwon.com</a></p>
<% Else  %>
<table><tr><td>
<div>

<form action="admin_edit_code.asp" method="POST" name="SaveForm" ID="Form1">
<input type="hidden" name="menuFileName" value="<%= myID %>">
<input type="hidden" name="txtContent"  value="" ID="Hidden2">

<p>HTML Body<br>
<ACE:AdvContentEditor id="idContent" content="" onSave="Save();" onImgLookupOpen="OpenImgLookup()" />
<div id=idContentTemp style="display:none"><%=Output%></div>
</td></tr></table>
	
</p>

<% End If %>
</body>
</html>









