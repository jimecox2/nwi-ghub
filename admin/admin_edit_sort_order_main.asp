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
	menuCategory=Request.QueryString("cat")
    sql = "SELECT * FROM tblMenuMain ORDER BY mmenuOrder"
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
<td><a href="admin_edit_sort_order_main_code.asp?id=<%= rs("mmenuCategoryID") %>&cat=<%= rs("mmenuTitle") %>&order=<%= rs("mmenuOrder") %>"><%= rs("mmenuTitle") %></a></td> <td align="center"><%= rs("mmenuOrder") %></td>
</tr>
<%
rs.MoveNext
loop
rs.close
set rs=nothing
conn.close

%>

</table>
</body>
</html>

