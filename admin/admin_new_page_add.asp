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
if request.form("menuFileName")<>"" then

if Request.Form("submenu")<>"" then
menuCategory=Request.Form("menuCategory")
menuPageName=Replace(Request.Form("menuPageName"),"'","''")
menuFileName=Request.Form("menuFileName")

    sql = "SELECT * FROM tblMenu Where menuCategory="&menuCategory&" ORDER BY menuOrder DESC"
    Set rs = conn.execute(sql)
	if rs.eof then
	menuOrder=1
	else
	menuOrder=rs("menuOrder")+1
	end if
	rs.close : set rs=nothing
	 sql2= "Insert into tblMenu (menuCategory,menuPageName,menuFileName,menuOrder)"
	 sql2= sql2 & "VALUES ('"&menuCategory&"','"&menuPageName&"','"&menuFileName&"','"&menuOrder&"')"
	 conn.execute(sql2)
	Response.Redirect"index.asp"

end if

if Request.Form("mainmenu")<>"" then

    sql = "SELECT * FROM tblMenuMain ORDER BY mmenuOrder DESC"
    Set rs = conn.execute(sql)
	if rs.eof then
	mmenuOrder=1
	else
	mmenuOrder=rs("mmenuOrder")+1
	end if
	rs.close : set rs=nothing
	mmenuTitle=Replace(Request.Form("mmenuTitle"),"'","''")
	mmenuDefaultPage=Request.Form("menuFileName")
	 sql2= "Insert into tblMenuMain (mmenuTitle,mmenuDefaultPage,mmenuOrder)"
	 sql2= sql2 & "VALUES ('"&mmenuTitle&"','"&mmenuDefaultPage&"','"&mmenuOrder&"')"
	 conn.execute(sql2)	
	Response.Redirect"index.asp"
end if

else

	sql = "SELECT * FROM tblMenuMain"
    Set rs = Server.CreateObject("ADODB.Recordset")
    rs.Open sql, conn, 3, 3
%>

<h3>Page added: <% if Request.QueryString("file")="" then Response.Write session("menuFileName") else Response.Write Request.QueryString("file") %> </h3>

<p>
<strong>Option 1:</strong><br> You can add this page to an existing category.
<form action="admin_new_page_add.asp" method="post">
<input type="hidden" name="menuFileName" value="<% if Request.QueryString("file")="" then Response.Write session("menuFileName") else Response.Write Request.QueryString("file") %>">
<select name="menuCategory">
<%
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
%>	
	<option value="<%= rs("mmenuCategoryID") %>"><%= rs("mmenuTitle") %></option>
<%
rs.MoveNext
loop%>
</select> Choose Category<br>
<input type="text" name="menuPageName" value="<%= session("menuPageName") %>"> Document title (link name)<br>
<input type="submit" name="submenu" value="Add as menu item">
</form>
</p>
<hr>
<p>
<strong>Option 2:</strong><br> You can use this document to create a new <u>Main Menu</u> on the site.
<form action="admin_new_page_add.asp" method="post">
<input type="hidden" name="menuFileName" value="<% if Request.QueryString("file")="" then Response.Write session("menuFileName") else Response.Write Request.QueryString("file") %>">
<input type="text" name="mmenuTitle" value="<%= session("menuPageName") %>"> Main menu title (link name)<br>
<input type="submit" name="mainmenu" value="Add new menu">
</form>
</p>

<hr>
<p><strong>Option 3:</strong><br> <a href="index.asp">Return to admin home</a></p>

<!--mmenuCategoryID
mmenuTitle
mmenuDefaultPage
mmenuOrder
-->
<% End If %>
</body>
</html>
