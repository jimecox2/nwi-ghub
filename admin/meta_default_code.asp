<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!--#include file="meta_connection.asp"-->

<%  
metaID=Request.QueryString("id")
if metaID="" then Response.Redirect"meta_index.asp"
conn.execute("UPDATE tblMeta SET metaDefault=''")
conn.execute("UPDATE tblMeta SET metaDefault='default' WHERE metaID="&metaID&";")
Response.Redirect"meta_index.asp"
conn.close
%>