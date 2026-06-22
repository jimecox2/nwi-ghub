<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%
	myStat="n"
	sql = "UPDATE tblNewsletter SET nlArchive='"&myStat&"' WHERE nlID="&Request.QueryString("an")&";"
conn.Execute(sql)
conn.close 
Response.Redirect"newsletter_index.asp"
%>
