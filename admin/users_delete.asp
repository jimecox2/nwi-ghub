<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<% 
myMod=Replace(Request.QueryString("del"), "'", "''")
SQLStmt = "DELETE DISTINCTROW empID FROM tblUsers WHERE empID="&myMod&";"
sql="DELETE FROM tblPermissions WHERE empID="&myMod&";"
conn.Execute(SQLStmt)
conn.Execute(sql)
conn.Close
Response.Redirect"users_index.asp"
%>