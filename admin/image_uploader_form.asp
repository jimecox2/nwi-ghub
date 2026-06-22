<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Image Uploader</title><link rel="STYLESHEET" type="text/css" href="style.css">

</head>

<body>
<!--#include file="admin_menu.asp"-->

<div>
<%  
picno=Request.Form("picno")
if picno>0 then 
%>

<form action="image_uploader_code.asp" method="post" enctype="multipart/form-data">
<% 
uno=0
for i=1 to picno 
uno=uno+1
%>
<input type="file" name="picture<%= uno %>"> Picture <%= uno %><br>
<% next %>
<input type="submit" value="Add pictures">
</form>
<%
else
response.redirect"image_uploader.asp"
end if
%>

</div>
</body>
</html>
