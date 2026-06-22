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
set rs=conn.execute("SELECT * FROM tblLinksCategories ORDER BY lcOrder DESC")
lcOrder=rs("lcOrder")+1
rs.close: set rs=nothing
	sql = "INSERT INTO tblLinksCategories (lcDesc,lcOrder) "
	sql = sql & "VALUES ('"&lcDesc&"','"&lcOrder&"') "
	conn.execute(sql)
	response.redirect"links_index.asp"
else
set rs=conn.execute("SELECT * FROM tblLinksCategories ORDER BY lcOrder")
Session("DeleteMessage")="SCARY STUFF!!! If you choose to delete this category, you will lose your links too"
%>

<h3>Add link category</h3>

	<form action="links_add_category.asp" method="POST">
	<input type="Text" name="lcDesc" size="40"><input type="submit" value="Add link category">
	</form>


<h3>Existing categories:</h3>
<p>
Click the link below that you would like to place first.<br>

<table>
<tr bgcolor="Silver"><th>Link Name</th><th>Order</th><th>Tools</th></tr>
<%
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
 %>
 <tr bgcolor="WhiteSmoke">
 <td><a href="links_edit_sort_order.asp?id=<%= rs("lcID") %>"><%= rs("lcDesc") %></a></td>
 <td><%= rs("lcOrder") %></td>
 <td>
<a href="links_edit_category.asp?id=<%= rs("lcID") %>"><img src="icon_edit.gif" width="16" height="16" alt="Edit Category" border="0"></a>
 <a href="validate_delete.asp?del=<%= rs("lcID") %>&script=links_delete_category"><img src="icon_delete.gif" width="16" height="16" alt="Delete Category and associated links" border="0"></a>
 </td>
 </tr>
<% 
rs.MoveNext
loop
end if
%>
</p>

</body>
</html>