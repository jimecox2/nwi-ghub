<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%
If Request.Form("picCategory")="" THEN
 	 Response.Write "You do not have access to this page"
 ELSE
picCategory=Request.Form("picCategory")
picID=Request.Form("picID")
picFilename=Request.Form("picFilename")
picTitle=Replace(Request.Form("picTitle"),"'","''")
picDesc=Replace(Request.Form("picDesc"),"'","''")
	SQLStmt = "UPDATE  tblPhotos SET picFilename='"&picFilename&"',picTitle='"&picTitle&"',picDesc='"&picDesc&"' WHERE picID="&picID&";"
	Conn.Execute(SQLStmt)

Response.Redirect"photos_admin.asp?cat="&picCategory
Conn.Close
END IF

%>