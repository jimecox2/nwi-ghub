<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<html>
<head>
<title>edit sort order</title>
<link rel="STYLESHEET" type="text/css" href="style.css">
</head>
<body>

<%

	fOrder=0
	sql = "SELECT * FROM tblPhotoAlbumCategories ORDER BY paSortOrder"
	set rs=conn.execute(sql)
%>
<!--#include file="admin_menu.asp"-->

<p>
Click the link below that you would like to place first.
</p>
<table>
<%
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
%>
<tr bgcolor="#f5f5f5">
	<td><a href="photos_edit_sort_order_code.asp?cat=<%= rs("paID") %>"><%= rs("paCatDesc") %></a></td>
	<td><%= rs("paSortOrder") %></td>
</tr>


<%
rs.MoveNext
loop
conn.close
%>
</table>
</body>
</html>

