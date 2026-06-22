<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%
if Request.QueryString("cat")=""THEN 
Response.Write"You cannot not have direct access to this script. You must <a href=index.asp>go here</a> first "
else
	fOrder=0
	menuCategory=Request.QueryString("cat")
    sql = "SELECT mmenuCategoryID,mmenuOrder FROM tblMenuMain WHERE  mmenuOrder >"&fOrder&" ORDER BY mmenuOrder"
    Set rs = Server.CreateObject("ADODB.Recordset")
    rs.Open sql, conn, 3, 3 
myNewFirst = 2
myNewOrder = 2
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
myNewOrder = myNewOrder+1 
sql2="UPDATE tblMenuMain SET mmenuOrder="&myNewOrder&" WHERE mmenuCategoryID="&rs("mmenuCategoryID")&";"
conn.execute(sql2)
rs.MoveNext
loop 

sql3="UPDATE tblMenuMain SET mmenuOrder="&myNewFirst&" WHERE mmenuCategoryID="&Request.QueryString("id")&";"
conn.execute(sql3)
End If 
%>
<html>
<head>
<title></title>
<META HTTP-EQUIV="Refresh" CONTENT="0;URL=admin_edit_sort_order_main.asp?cat=<%= menuCategory %>">
</head>
<body>
<a href="admin_edit_sort_order_main.asp?cat=<%= MenuLink %>">admin_edit_sort_order</a>
</body>
</html>