<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html XMLNS:ACE>
<head>
	<title>Edit newsletter item</title>
		<?import namespace="ACE" implementation="ace.htc" />
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
  		Form1.nlText.value = idContent.content;
		
  		Form1.submit();	
  		}	
	</script>
	
	<link rel="STYLESHEET" type="text/css" href="style.css">
</head>

<body onload="Init()" style="FONT-FAMILY: Verdana;FONT-SIZE: x-small;">
<!--#include file="admin_menu.asp"-->

<%
myAn=Request.QueryString("an")
    sql = "SELECT * FROM tblNewsletter WHERE nlID="&myAn&";"
    Set rs = Server.CreateObject("ADODB.Recordset")
    rs.Open sql, conn, 3, 3
	nlHeadline=Replace(rs("nlHeadline"),"''","'")
	nlText=Replace(rs("nlText"),"''","'")
	sqlp= "SELECT nlPicFilename,nlPicDescription FROM tblNewsletterPics WHERE nlPicID="&rs("nlID")&";"	
	Set rsp=conn.execute(sqlp)
	session("nlID")=myAn
%>
<div>
<form action="newsletter_code_edit.asp" method="post" name="SaveForm" ID=Form1>
<input type="hidden" name="nlID" value="<%= myAn %>">
<b>Headline</b><br><input type="text" name="nlHeadline" size="75" value="<%= nlHeadline %>"> <br>
<b>Story</b><br>
<input type="hidden" name="nlText"  value="" ID=Hidden2>
<ACE:AdvContentEditor id="idContent" content="" onSave="Save();" onImgLookupOpen="OpenImgLookup()" />
<div id=idContentTemp style="display:none"><%=nlText%></div>
<br>
<input type="text" name="nlDatePosted" value="<%= rs("nlDatePosted") %>">
Date posted
<br>
<% If rsp.eof then %>
Do you wish to upload any pictures associated with this article?<br>
<input type="text" name="picno" value="0" size="1" maxlength="1"> (Enter 0 for no pictures)
<% End If %>
</form>
</div>

</body>
</html>
