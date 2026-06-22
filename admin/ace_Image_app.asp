<!--#include file ="ace_upload.inc"-->
<%
if Request.QueryString("action")="del" then
	filepath = request.QueryString("file")
	Set objFSO1 = Server.CreateObject("Scripting.FileSystemObject")
	Set MyFile = objFSO1.GetFile(Server.MapPath(filepath))
	MyFile.Delete
	Response.Redirect "ace_image_app.asp"
end if

if Request.QueryString("action")="upload" then
	Response.Expires = 0
	Response.Buffer = TRUE
	Response.Clear

	Dim UploadRequest
	Set UploadRequest = CreateObject("Scripting.Dictionary")

	ByteCount = Request.TotalBytes
	RequestBin = Request.BinaryRead(byteCount)
	BuildUploadRequest  RequestBin


	Dim aux, aux1, FILEFLAG

	Dim ImageCateg, ContentType, FilePathName, FileName, Value
	ImageCateg=server.mappath("../images/")'Image Folder

	on error resume next
	ContentType =UploadRequest.Item("inpFile").Item("ContentType")
	FILEFLAG = err.number
	on error goto 0

	if FILEFLAG = 0 then
			ContentType = UploadRequest.Item("inpFile").Item("ContentType")
			FilePathName = UploadRequest.Item("inpFile").Item("FileName")
			FileName = Right(filepathname,Len(filepathname)-InstrRev(filepathname,"\"))
			Value = UploadRequest.Item("inpFile").Item("Value")
	else
			FileName = ""
	end if

	if FileName<>"" then 
			Set objFSO2 = Server.CreateObject("Scripting.FileSystemObject")
			Set MyFile = objFSO2.CreateTextFile(ImageCateg&"\"&FileName)
			MyFile.Write getString(value)
			MyFile.Close
	end if

	set UploadRequest = nothing
	
	Response.Redirect "ace_image_app.asp?catid="&ImageCateg
End If
'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
%>
<html>
<head>
	<title>Insert/Update Image</title>
	<style>
	BODY
		{
		FONT-FAMILY: Verdana;FONT-SIZE: xx-small;
		}
	TABLE
		{
	    FONT-SIZE: xx-small;
	    FONT-FAMILY: Tahoma
		}
	INPUT
		{
		font:8pt verdana,arial,sans-serif;
		}
	select
		{
		height: 22px; 
		top:2;
		font:8pt verdana,arial,sans-serif
		}	
	.bar 
		{
		BORDER-TOP: #99ccff 1px solid; BACKGROUND: #336699; WIDTH: 100%; BORDER-BOTTOM: #000000 1px solid; HEIGHT: 20px
		}		
	</style>
</head>
<%
dim objFSO
dim objMainFolder

dim strOptions
dim strHTML
dim catid

strHTML = ""

set objFSO = server.CreateObject ("Scripting.FileSystemObject")
set objMainFolder = objFSO.GetFolder(server.MapPath("../images/"))
	     
catid = CStr(request("catid"))'bisa form, bisa querystring
if catid="" then catid = objMainFolder.path

dim objTempFSO
dim objTempFolder
dim objTempFiles
dim objTempFile

set objTempFSO = server.CreateObject ("Scripting.FileSystemObject")
set objTempFolder = objTempFSO.GetFolder (catid)
set objTempFiles = objTempFolder.files

strHTML = strHTML & "<table border=0 cellpadding=3 cellspacing=0 width=240>"
for each objTempFile in objTempFiles
	strHTML = strHTML & "<tr bgcolor=Gainsboro>"
	strHTML = strHTML & "<td valign=top>" & objTempFile.name & "</td>"
	'strHTML = strHTML & "<td valign=top>" & objTempFile.type & "</td>"
	strHTML = strHTML & "<td valign=top>" & FormatNumber(objTempFile.size/1000,0) & " kb</td>"
	strHTML = strHTML & "<td valign=top style=""cursor:hand;"" onclick=""selectImage('.." & constructpath(objTempFile.path) & "')""><u><font color=blue>select</font></u></td>"
	strHTML = strHTML & "<td valign=top style=""cursor:hand;"" onclick=""deleteImage('.." & constructpath(objTempFile.path) & "')""><u><font color=blue>del</font></u></td></tr>"
next
strHTML = strHTML & "</table>"

Function createCategoryOptions(pi_objFolder)
    dim objFolder
    dim objFolders
	
    set objFolders = pi_objfolder.SubFolders
    for each objFolder in objFolders 
		'Recursive programming starts here
		createCategoryOptions objFolder
    next
    
    if pi_objFolder.attributes and 2 then
		'hidden folder then do nothing
	else	
		if CStr(catid)=CStr(pi_objFolder.path) then
			strOptions = strOptions & "<option value=" & pi_objFolder.path & " selected>" & constructpath(pi_objFolder.path) & "</option>" & vbCrLf
		else
			strOptions = strOptions & "<option value=" & pi_objFolder.path & ">" & constructpath(pi_objFolder.path)  & "</option>" & vbCrLf
		end if
    end if
    
    strOptions = strOptions & vbCrLf
    createCategoryOptions = strOptions
End Function

function ConstructPath(str)
    str  = mid(str,len(server.MapPath ("../"))+1)
    ConstructPath = replace(str,"\","/")
end function
%>
<body onload="checkImage()" link=Blue vlink=MediumSlateBlue alink=MediumSlateBlue leftmargin=5 rightmargin=5 topmargin=5 bottommargin=5 bgcolor=Gainsboro>



	<table border="0" cellpadding="0" cellspacing="0">
	<tr>
	<td valign=top>
		<!-- Content -->

		<table border=0 cellpadding=3 cellspacing=3 align=center>
		<tr>
		<td align=center style="BORDER-TOP: #336699 1px solid;BORDER-LEFT: #336699 1px solid;BORDER-RIGHT: #336699 1px solid;BORDER-BOTTOM: #336699 1px solid;" bgcolor=White>
				<div id="divImg" style="overflow:auto;width:150;height:170"></div>
		</td>  
  		<td valign=top>
				<form method=post action=<%=Request.ServerVariables("SCRIPT_NAME")%> id=form2 name=form2>
						<table border=0 height=30 cellpadding=0 cellspacing=0><tr>
						<td><b>Select folder&nbsp;:&nbsp;</b></td>
						<td>
						<select id=catid name=catid onchange="form2.submit()">
						<%=createCategoryOptions(objMainFolder)%>
						</select> 
						</td></tr></table>
				</form>
				
				<table border=0 cellpadding=0 cellspacing=0 width=260>
				<tr><td>
				<div class="bar" style="padding-left: 5px;">
				<font size="2" face="tahoma" color="white"><b>File Name</b></font>
				</div>
				</td></tr>
				</table>
				
				<div style="overflow:auto;height:120;width:260;BORDER-LEFT: #316AC5 1px solid;BORDER-RIGHT: LightSteelblue 1px solid;BORDER-BOTTOM: LightSteelblue 1px solid;">
				<%=strHTML%>
				</div>

				<FORM METHOD="Post" ENCTYPE="multipart/form-data" ACTION="ace_image_app.asp?action=upload" ID="form1" name="form1">
				Upload Image : <br>
				<INPUT type="file" id="inpFile" name=inpFile size=22 style="font:8pt verdana,arial,sans-serif"><br>
				<input name="inpcatid" ID="inpcatid" type=hidden>
				<INPUT TYPE="button" value="Upload" onclick="inpcatid.value=form2.catid.value;form1.submit()">
				</FORM>		
				
		</td>						
		</tr>
		<tr>
		<td colspan=2>
				
				<hr>	
				<table border=0 width=340 cellpadding=0 cellspacing=1>
				<tr>
						<td>Image source : </td>
						<td colspan=3>
						<INPUT type="text" id="inpImgURL" name=inpImgURL size=39>
						<!--<font color=red>(you can type your own image path here)</font>-->
						</td>		
				</tr>					
				<tr>
						<td>Alternate text : </td>
						<td colspan=3><INPUT type="text" id="inpImgAlt" name=inpImgAlt size=39></td>		
				</tr>				
				<tr>
						<td>Alignment : </td>
						<td>
						<select ID="inpImgAlign" NAME="inpImgAlign">
								<option value="" selected>&lt;Not Set&gt;</option>
								<option value="absBottom">absBottom</option>
								<option value="absMiddle">absMiddle</option>
								<option value="baseline">baseline</option>
								<option value="bottom">bottom</option>
								<option value="left">left</option>
								<option value="middle">middle</option>
								<option value="right">right</option>
								<option value="textTop">textTop</option>
								<option value="top">top</option>						
						</select>
						</td>
						<td>Image border :</td>
						<td><select id=inpImgBorder name=inpImgBorder>
							<option value=0>0</option>
							<option value=1>1</option>
							<option value=2>2</option>
							<option value=3>3</option>
							<option value=4>4</option>
							<option value=5>5</option>
						</select>
						</td>					
				</tr>
				<tr>
						<td>Width :</td>
						<td><INPUT type="text" ID="inpImgWidth" NAME="inpImgWidth" size=2></td>
						<td>Horizontal Spacing :</td>
						<td><INPUT type="text" ID="inpHSpace" NAME="inpHSpace" size=2></td>
				</tr>				
				<tr>
						<td>Height :</td>
						<td><INPUT type="text" ID="inpImgHeight" NAME="inpImgHeight" size=2></td>
						<td>Vertical Spacing :</td>
						<td><INPUT type="text" ID="inpVSpace" NAME="inpVSpace" size=2></td>
				</tr>
				</table>

		</td>
		</tr>
		<tr>
		<td align=center colspan=2>
				<table cellpadding=0 cellspacing=0 align=center><tr>
				<td><INPUT type="button" value="Cancel" onclick="self.close();" style="height: 22px;font:8pt verdana,arial,sans-serif" ID="Button1" NAME="Button1"></td>
				<td>
				<span id="btnImgInsert" style="display:none">
				<INPUT type="button" value="Insert" onclick="InsertImage();self.close();" style="height: 22px;font:8pt verdana,arial,sans-serif" ID="Button2" NAME="Button2">
				</span>
				<span id="btnImgUpdate" style="display:none">
				<INPUT type="button" value="Update" onclick="UpdateImage();self.close();" style="height: 22px;font:8pt verdana,arial,sans-serif" ID="Button3" NAME="Button3">
				</span>				
				</td>
				</tr></table>
		</td>
		</tr>
		</table>

		<!-- /Content -->
		<br>
	</td>
	</tr>
	</table>



<script language="JavaScript">
function deleteImage(sURL)
	{
	if (confirm("Delete this document ?") == true) 
		{
		window.navigate("ace_image_app.asp?action=del&file="+sURL+"&catid="+form2.catid.value);
		}
	}
function selectImage(sURL)
	{
	inpImgURL.value = sURL;
	
	divImg.style.visibility = "hidden"
	divImg.innerHTML = "<img id='idImg' src='" + sURL + "'>";
	

	var width = idImg.width
	var height = idImg.height 
	var resizedWidth = 150;
	var resizedHeight = 170;

	var Ratio1 = resizedWidth/resizedHeight;
	var Ratio2 = width/height;

	if(Ratio2 > Ratio1)
		{
		if(width*1>resizedWidth*1)
			idImg.width=resizedWidth;
		else
			idImg.width=width;
		}
	else
		{
		if(height*1>resizedHeight*1)
			idImg.height=resizedHeight;
		else
			idImg.height=height;
		}
	
	divImg.style.visibility = "visible"
	}
	
function checkImage()
	{
	if (window.opener.idContent.imageProperties.length!=0) //If image is selected 
		{
		selectImage(window.opener.idContent.imageProperties[0])
		inpImgURL.value = window.opener.idContent.imageProperties[0]
		inpImgAlt.value = window.opener.idContent.imageProperties[1]
		inpImgAlign.value = window.opener.idContent.imageProperties[2]
		inpImgBorder.value = window.opener.idContent.imageProperties[3]
		inpImgWidth.value = window.opener.idContent.imageProperties[4]
		inpImgHeight.value = window.opener.idContent.imageProperties[5]
		inpHSpace.value = window.opener.idContent.imageProperties[6]
		inpVSpace.value = window.opener.idContent.imageProperties[7]
		btnImgUpdate.style.display="block";
		}
	else
		{
		btnImgInsert.style.display="block";
		}
	}
function UpdateImage()
	{
	window.opener.idContent.UpdateImage(inpImgURL.value,inpImgAlt.value,inpImgAlign.value,inpImgBorder.value,inpImgWidth.value,inpImgHeight.value,inpHSpace.value,inpVSpace.value);	
	}
function InsertImage()
	{
	window.opener.idContent.InsertImage(inpImgURL.value,inpImgAlt.value,inpImgAlign.value,inpImgBorder.value,inpImgWidth.value,inpImgHeight.value,inpHSpace.value,inpVSpace.value);
	}
</script>
</body>
</html>