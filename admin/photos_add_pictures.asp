<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Untitled</title><link rel="STYLESHEET" type="text/css" href="style.css">
</head>

<body>
 <!--#include file="admin_menu.asp"-->

<%
paID=Request.Form("paID")
howmany=Request.Form("howmany")
picFileName=Request.Form("picFileName")

myStart=0
for i = 1 to howmany
myStart=myStart+1
if len(myStart)=1 then myStart="0"&myStart
picFilename=Request.Form("picFilename")&myStart&".jpg"
	sql = "INSERT INTO tblPhotos (picCategory,picFilename) "
	sql = sql & "VALUES ('"&paID&"','"&picFilename&"') "
conn.execute(sql)
next

%>


</body>
</html>
