<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!--#include file="meta_connection.asp"-->

<%  
metaID=Request.QueryString("del")
if metaID="" then Response.Redirect"meta_index.asp"
conn.execute("DELETE FROM tblMeta WHERE metaID="&metaID&";")
Response.Redirect"meta_index.asp"
conn.close
%>