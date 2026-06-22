<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%
if Request.QueryString("id")=""THEN 
Response.Write"You cannot not have direct access to this script. You must <a href=links_add_category.asp>go here</a> first "
else
	fOrder=0
	lcID=Request.QueryString("id")
    sql = "SELECT * FROM tblLinksCategories ORDER BY lcOrder"
    Set rs = Server.CreateObject("ADODB.Recordset")
    rs.Open sql, conn, 3, 3 
myNewFirst = 2
myNewOrder = 2
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
myNewOrder = myNewOrder+1 
sql2="UPDATE tblLinksCategories SET lcOrder="&myNewOrder&" WHERE lcID="&rs("lcID")&";"
conn.execute(sql2)
rs.MoveNext
loop 

sql3="UPDATE tblLinksCategories SET lcOrder="&myNewFirst&" WHERE lcID="&Request.QueryString("id")&";"
conn.execute(sql3)
Response.Redirect"links_add_category.asp"
End If 
%>
