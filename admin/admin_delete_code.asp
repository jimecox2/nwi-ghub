<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%
    if Request.QueryString("del")=""THEN
	Response.Write"No Access"
	ELSE
	myID=Request.QueryString("del")
    sql = "DELETE FROM tblMenu Where menuID="&myID&";"
    conn.execute(sql)
	conn.close
%>
<!--#include file="index.asp"-->

<% End If %>
