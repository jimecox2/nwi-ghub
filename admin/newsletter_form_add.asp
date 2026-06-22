<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html XMLNS:ACE>
<head>
	<title>Add newsletter item</title>
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
		Form1.nlText.value=idContent.content
		
		//You can validate your form here
		if (Form1.nlHeadline.value == "")
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

<div>
<h3>Add news article to website</h3>
<form action="newsletter_code_add.asp" method="post" name="SaveForm" ID=Form1>
<b>Headline</b><br><input type="text" name="nlHeadline" size="75"> <br>
<b>Story</b><br>
<input type="hidden" name="nlText"  value="" ID=Hidden1>
<ACE:AdvContentEditor id="idContent" content="" onSave="Save();" onImgLookupOpen="OpenImgLookup()" />
<br>
Do you wish to upload any pictures associated with this article?<br>
<input type="text" name="picno" value="0" size="1" maxlength="1"> (Enter 0 for no pictures)

</form>
</div>
</body>
</html>
