<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%
    if Request.QueryString("del")=""THEN
	Response.Write"No Access"
	ELSE
	myID=Request.QueryString("del")
    sql = "DELETE FROM tblMenu Where menuCategory="&myID&";"
	sql2 = "DELETE FROM tblMenuMain Where mmenuCategoryID="&myID&";"
    conn.execute(sql)
	conn.execute(sql2)
	conn.close
%>
<!--#include file="index.asp"-->

<% End If %>
