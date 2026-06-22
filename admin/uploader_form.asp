<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Photo album</title>
	<link rel="STYLESHEET" type="text/css" href="style.css">
</head>

<body bgcolor="White">

<!--#include file="admin_menu.asp"-->


<div>
<%  
picno=Request.Form("picno")
if picno>0 then 
%>
<h3>Upload files to website</h3>
<form action="uploader_code.asp" method="post" enctype="multipart/form-data">
<table>
<tr bgcolor="#C0C0C0"><th>Location</th><th>File</th></tr>
<% 
uno=0
for i=1 to picno 
uno=uno+1
%>
<tr bgcolor="#dcdcdc">
<td><select name="folder">
	<option value="root" SELECTED>Root Folder</option>
	<option value="images">Images Folder</option>
</select></td>
<td><input type="file" name="picture<%= uno %>"> File <%= uno %></td>
</tr>
<% next %>

<tr bgcolor="#c0c0c0"><td colspan="2"><input type="submit" value="Add files"></td></tr>
</table>
</form>
<%
else
response.redirect"index.asp"
end if
%>



</body>
</html>