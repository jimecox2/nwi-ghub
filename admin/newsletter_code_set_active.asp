<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%
set rs=conn.execute("SELECT * FROM tblNewsletter")
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
if rs("nlArchive")<>"n" then
nlID=rs("nlID")
conn.Execute("UPDATE tblNewsletter SET nlArchive='y' WHERE nlID="&nlID&";")
end if
rs.MoveNext
loop
nlID=cint(Request.QueryString("an"))
conn.Execute("UPDATE tblNewsletter SET nlArchive='a' WHERE nlID="&nlID&";")
conn.close 
Response.Redirect"newsletter_index.asp"
%>

