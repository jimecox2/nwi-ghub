<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<% 
lcID=Request.QueryString("del")
conn.execute("DELETE FROM tblLinksCategories WHERE lcID="&lcID&";")
conn.execute("DELETE FROM tblLinks WHERE linkRegion="&lcID&";")

Response.Redirect"links_index.asp"
%>
