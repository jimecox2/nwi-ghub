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

<%
myPic=Request.QueryString("pic")
if myPic="" THEN myPic=1
myCat=Request.QueryString("cat")
	sql = "SELECT * FROM tblPhotos WHERE picID="&myPic&";"
    Set rs = Server.CreateObject("ADODB.Recordset")	
    rs.Open sql, conn, 3, 3
%>
<table><tr><td>
<h3>Change Photo Information <%= rs("picFilename")%></h3>

<form action="photos_admin_code.asp" method="post">
<input type="hidden" name="picCategory" value="<%= myCat %>">
<input type="hidden" name="picID" value="<%= myPic %>">
<table border="0">
<tr bgcolor="Silver"><td><input type="text" name="picFilename" value="<%= rs("picFilename")%>">Filename: </td></tr>
<tr bgcolor="Silver"><td><input type="text" name="picTitle" value="<%= rs("picTitle")%>">Title: </td></tr>
<tr><td><img src="../photos/<%= rs("picFilename")%>" border="0"></td></tr>
<tr bgcolor="Silver"><td><input type="text" name="picDesc" value="<%= rs("picDesc")%>" size="60">Description:</td></tr>
<tr><td><input type="submit" value="Change"></td></tr>
</table>
<% rs.close
set rs=nothing
conn.close %>

</form>
</td></tr></table>
</body>
</html>

