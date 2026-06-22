<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%
if Request.QueryString("cat")=""THEN 
Response.Write"no access"
else


    sql = "SELECT * FROM tblPhotoAlbumCategories ORDER BY paSortOrder"
    Set rs = Server.CreateObject("ADODB.Recordset")
    rs.Open sql, conn, 3, 3 
myNewOrder = 1
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
myNewOrder = myNewOrder+1 
sql2="UPDATE tblPhotoAlbumCategories SET paSortOrder="&myNewOrder&" WHERE paID="&rs("paID")&";"
conn.execute(sql2)
rs.MoveNext
loop 

sql3="UPDATE tblPhotoAlbumCategories SET paSortOrder=1 WHERE paID="&Request.QueryString("cat")&";"
conn.execute(sql3)
end if
conn.close
%>

<html>
<head>
<title></title>
<META HTTP-EQUIV="Refresh" CONTENT="0;URL=photos_edit_sort_order.asp">
</head>
<body>
<a href="admin_edit_sort_order.asp">admin_edit_sort_order</a>
</body>
</html>
