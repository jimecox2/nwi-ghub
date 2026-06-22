<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Admin Index</title><link rel="STYLESHEET" type="text/css" href="style.css">
</head>

<body>
<!--#include file="admin_menu.asp"-->


<%
if request.form("mmenuTitle")<>"" then

Response.Write"a"
else
%>

<h3>Administer main menu</h3>
<p>
<form action="admin_main_menu.asp" method="post">
<input type="text" name="mmenuTitle"> Main menu title<br>
<input type="radio" name="newpage" value="newpage" checked> Create new page<br>
<input type="radio" name="newpage" value="selectfrom"> Select an existing document<br>
<input type="submit" value="Add menu item">
</form>
</p>
mmenuCategoryID
mmenuTitle
mmenuDefaultPage
mmenuOrder

<% End If %>
</body>
</html>
