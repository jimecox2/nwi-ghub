<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<html>
<head>
<title>edit sort order</title>
<link rel="STYLESHEET" type="text/css" href="style.css">
</head>
<body>

<%
if Request.QueryString("cat")=""THEN 
Response.Write"You cannot not have direct access to this script. You must <a href=index.asp>go here</a> first "
else
	fOrder=0
	menuCategory=Request.QueryString("cat")
    sql = "SELECT * FROM tblMenu Where menuCategory="&menuCategory&" AND MenuOrder >"&fOrder&" ORDER BY MenuOrder"
    Set rs = Server.CreateObject("ADODB.Recordset")
    rs.Open sql, conn, 3, 3	
%>
<!--#include file="admin_menu.asp"-->

<p>
Click the link below that you would like to place first.
</p>

<table>
<tr bgcolor="Silver"><th>Link Name</th><th>Order</th></tr>
<% 
On Error Resume Next
rs.MoveFirst
do while Not rs.eof 
%>
<tr bgcolor="WhiteSmoke">
<td><a href="admin_edit_sort_order_code.asp?id=<%= rs("menuID") %>&cat=<%= rs("menuCategory") %>&order=<%= rs("menuOrder") %>"><%= rs("menuPageName") %></a></td> <td align="center"><%= rs("menuOrder") %></td>
</tr>
<%
rs.MoveNext
loop
rs.close
set rs=nothing
conn.close
end if
%>

</table>
</body>
</html>

