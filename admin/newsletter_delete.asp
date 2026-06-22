<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%
if Request.QueryString("del")=""THEN
Response.Write"No Access"
ELSE
Set MyFileObject=Server.CreateObject("Scripting.FileSystemObject")
sql="SELECT * FROM tblNewsletterPics WHERE nlPicID="&Request.QueryString("del")&";"
set rs=conn.Execute(sql)
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
MyFileObject.DeleteFile Server.MapPath("../images")&"/"&rs("nlPicFilename")
rs.MoveNext
loop

	sql = "DELETE nlID FROM tblNewsletter WHERE nlID="&Request.QueryString("del")&";"
conn.Execute(sql)
	sql = "DELETE nlPicID FROM tblNewsletterPics WHERE nlPicID="&Request.QueryString("del")&";"
conn.Execute(sql)
conn.close 
Response.Redirect"newsletter_index.asp"
END IF
%>

