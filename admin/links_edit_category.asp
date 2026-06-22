<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Administration</title>
<link rel="STYLESHEET" type="text/css" href="style.css">
</head>

<body>
<!--#include file="admin_menu.asp"-->


<% 
lcDesc=Replace(Request.Form("lcDesc"),"'","''")
if lcDesc<>"" then
lcID=Request.Form("lcID")
conn.execute("UPDATE tblLinksCategories SET lcDesc='"&lcDesc&"' WHERE lcID="&lcID&"; ")
Response.Redirect"links_add_category.asp"
else
	lcID=Request.QueryString("id")
	if lcID="" then Response.Redirect"links_add_category.asp"
	set rs=conn.execute("SELECT * FROM tblLinksCategories WHERE lcID="&lcID&";")
%>
<h3>Edit Links Category</h3>

<p>
	<form action="links_edit_category.asp" method="POST">
	<input type="hidden" name="lcID" value="<%= lcID %>">
	<input type="Text" name="lcDesc" size="40" value="<%= rs("lcDesc") %>"><input type="submit" value="Edit link category">
	</form>
</p>
<% End If %>
</body>
</html>