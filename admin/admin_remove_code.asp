<!--#include file="protected.asp"-->
<%
    if Request.QueryString("rem")=""THEN
	Response.Write"No Access"
	ELSE
	myID=Request.QueryString("rem")
	myStatus=Request.QueryString("stat")
	Set conn = Server.CreateObject("ADODB.Connection")
    conn.open "ipewww","",""
    sql = "UPDATE Menu SET MenuStatus='"&myStatus&"' Where MenuID="&myID&";"
    conn.execute(sql)
	conn.close
%>
<!--#include file="index.asp"-->

<% End If %>
