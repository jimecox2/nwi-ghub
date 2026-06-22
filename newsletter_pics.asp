<!--#include file="ssi_header.asp"-->
<!-- Start HTML Content -->
<% 
' connection to database is coming from the menu includes file.  Remove comment to use code below
    'cst = "Driver={Microsoft Access Driver (*.mdb)};DBQ=" & server.mappath("database\components.mdb") 
    'set conn = server.createobject("adodb.connection") 
    'conn.open cst
article=Request.QueryString("article")
if article=""then response.redirect"newsletter.asp"
	sqlp= "SELECT nlPicFilename,nlPicDescription FROM tblNewsletterPics WHERE nlPicID="&article&";"
	set rsp=conn.execute(sqlp)
%>
<h3><%= Request.QueryString("hl") %></h3>
<p><a href="newsletter.asp?hl=<%= article %>">Return to article</a></p>
<%  
On Error Resume Next
rsp.MoveFirst
do while Not rsp.eof
%>

<p align="center">
<img src="images/<%= rsp("nlPicFilename") %>" alt="Click for larger image" border="0"><br>
<%= rsp("nlPicDescription") %>
</p>
<%
rsp.MoveNext
loop
rsp.close
set rsp=nothing
conn.close
set conn=nothing
%>
</p>

<!-- End HTML Content -->
<!--#include file="ssi_footer.asp"-->
