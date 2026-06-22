<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<% 
myMod=Replace(Request.QueryString("del"), "'", "''")
SQLStmt = "DELETE DISTINCTROW linkID FROM tblLinks WHERE linkID="&myMod&";"
Set RS = conn.Execute(SQLStmt)
conn.Close
Response.Redirect"links_index.asp"
%>
