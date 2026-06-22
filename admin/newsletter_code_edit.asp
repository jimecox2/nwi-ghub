<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->


<%
nlHeadline=Replace(Request.Form("nlHeadline"),"'","''")
nlText=Replace(Request.Form("nlText"),"'","''")
nlArchive = "y"
nlDatePosted = Request.Form("nlDatePosted")
picno=Request.Form("picno")
sql = "UPDATE tblNewsletter SET nlHeadline='"&nlHeadline&"',nlText='"&nlText&"',nlArchive='"&nlArchive&"',nlDatePosted='"&nlDatePosted&"'  WHERE nlID="&Request.Form("nlID")&";"
conn.Execute(sql)
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

%>