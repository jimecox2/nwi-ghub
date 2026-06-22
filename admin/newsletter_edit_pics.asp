<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Untitled</title><link rel="STYLESHEET" type="text/css" href="style.css">
</head>

<body>
<!--#include file="admin_menu.asp"-->


<%
nl=Request.QueryString("nl")
If nl<>"" then 
%>
<p style="color: Red; font-weight: bold; width: 300px;">
Do you wish to upload any pictures associated with this article?  If you choose to do this, all existing pictures associated with this article will be deleted from the database and the hard drive.<br>
</p>
<p>
<form action="newsletter_edit_pics.asp" method="post">
<input type="hidden" name="nlID" value="<%= nl %>">
<input type="text" name="picno" value="0" size="1" maxlength="1"> (Enter 0 for no pictures)
<input type="submit" value="Add pics"></form>
</p>
<% 
else 
picno=Request.Form("picno")
session("nlID")=Request.Form("nlID")

if picno=>0 then 

'delete from harddrive
Set MyFileObject=Server.CreateObject("Scripting.FileSystemObject")
sql="SELECT * FROM tblNewsletterPics WHERE nlPicID="&session("nlID")&";"
set rs=conn.Execute(sql)
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
MyFileObject.DeleteFile Server.MapPath("../images")&"/"&rs("nlPicFilename")
rs.MoveNext
loop
'delete from database
conn.execute("DELETE nlPicID FROM tblNewsletterPics WHERE nlPicID="&session("nlID")&";")
rs.close : set rs=nothing : conn.close : set conn=nothing
if picno>0 then
%>
<form action="newsletter_code_addpics.asp" method="post" enctype="multipart/form-data">
<% 
uno=0
for i=1 to picno 
uno=uno+1
%>
<input type="file" name="picture<%= uno %>"> Picture <%= uno %><br>
<input type="text" name="description<%= uno %>" size="34"> Description<br><br>
<% next %>
<input type="submit" value="Add pictures">
<%
else
response.redirect"newsletter_index.asp"
end if
else
response.redirect"newsletter_index.asp"
end if
end if
%>
</body>
</html>