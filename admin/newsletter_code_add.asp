<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<html>
<head>
<title>Administration</title><link rel="STYLESHEET" type="text/css" href="style.css">
</head>
<body>
<div>

<%
nlHeadline=Replace(Request.Form("nlHeadline"),"'","''")
nlText=Replace(Request.Form("nlText"),"'","''")
picno=Request.Form("picno")
if Request.Form("nlHeadline") = "" THEN
myVal="noVal"
Response.Write("You forgot to include a headline")
end if
if Request.Form("nlText") = "" THEN
myVal="noVal"
Response.Write("<br>You forgot to include an article")
end if
if myVal<>"noVal" then
nlArchive = "y"
nlDatePosted = Date
	sql = "INSERT INTO tblNewsletter (nlHeadline,nlText,nlArchive,nlDatePosted) "
	sql = sql & "VALUES ('"&nlHeadline&"','"&nlText&"','"&nlArchive&"','"&nlDatePosted&"') "
	sql2="SELECT nlID FROM tblNewsletter ORDER BY nlID DESC"
	application.lock
	  conn.execute(sql)
	  set rs=conn.execute(sql2)
	  nlID=rs("nlID")
	  session("nlID")=nlID
	  rs.close
	  set rs=nothing
	  conn.close
	application.unlock
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
end if
%>
<p>
<a href="newsletter_index.asp">Return to newsletter administration</a>
</p>
</div>
</body>
</html>
