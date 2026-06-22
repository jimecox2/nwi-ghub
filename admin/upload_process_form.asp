<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Uploader</title>
	<link rel="STYLESHEET" type="text/css" href="style.css">
</head>

<body bgcolor="White">

<!--#include file="admin_menu.asp"-->
<br>
<% 
if Request.Form("dowhat")<>"" then
 Set objUpload = Server.CreateObject("Dundas.Upload.2")
menuFileName=Replace(Request.Form("menuFileName"),"'","''")

' if there is an image file, it goes to the images directory
select case trim(right(menuFileName,4))
case ".jpg"
 folder="\images\"
case ".gif"
 folder="\images\"
case ".png"
 folder="\images\"
case else
 folder="\"
end select

dowhat=Request.Form("dowhat")
tempFilePath=server.mappath("../temp")&"\"&menuFileName
recFilePath=Replace(tempFilePath,"\temp\","\recycle\")
filePath=Replace(tempFilePath,"\temp\",folder)
menuDate=date
origFileName=Request.Form("origFileName")
origFilePath=server.mappath("../temp")&"\"&origFileName


if dowhat="replace" then
On Error Resume Next
objUpload.FileDelete recFilePath
objUpload.FileMove filePath,recFilePath,FailIfExists=FALSE
objUpload.FileMove tempFilePath,filePath,FailIfExists=FALSE
Response.Redirect"admin_orphan_files.asp"
end if

if dowhat="rename" then
 if objUpload.FileExists(filePath) then 
 Response.Redirect Request.ServerVariables("HTTP_REFERER")&"&message=Filename already exists! You must choose a different filename"
 else
 objUpload.FileMove origFilePath,filePath
 Response.Redirect"admin_orphan_files.asp"
 end if
end if

else
menuFileName=Request.QueryString("file")
%>

<form action="upload_process_form.asp" method="post">
<h3>Publish temporary File: <%= menuFileName %></h3>
<p>
There is already a file with this same file name. You have 2 choices:
<ol>
	<li><input type="radio" name="dowhat" value="replace"> Replace the existing file. <em>Keep the names as they are and press the buttton below</em></li>
	<li><input type="radio" name="dowhat" value="rename" checked> Rename the file and try again. <em>Rename the file below... be sure to keep the file extension the same. (the last letters in the filename following the dot.) </em></li>
</ol>
<font color="#FF0000"><%= Request.QueryString("message") %></font>
<table>
<tr bgcolor="#C0C0C0"><th>File</th></tr>
<input type="hidden" name="origFileName" value="<%= menuFileName %>">
<tr bgcolor="#dcdcdc">
<td><input type="text" name="menuFileName" value="<%= menuFileName %>"></td>
</tr>
<tr bgcolor="#c0c0c0"><td><input type="submit" value="Publish File"></td></tr>
</table>
</form>
</p>		
<% End If %>
	
</body>
</html>



