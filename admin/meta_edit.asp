<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Edit Meta Tags</title><link rel="STYLESHEET" type="text/css" href="style.css">
	
</head>

<body>
<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!--#include file="admin_menu.asp"-->
<!--#include file="meta_connection.asp"-->
<p>
Your <strong>Keywords</strong> should be seperated with a comma.  Don't repeat keywords.  Bla Bla Bla
</p>
<p>
Your <strong>Description</strong> should be a short well written paragraph that contains as many keywords as possible
</p>
<p>
Your <strong>Title</strong> should be short, descriptive and should contain your main keywords.  Note... Your title is visible to users, it is in the title bar of the browser window... The top.
</p>

<% 
if Request.Form("metaID")<>"" then
metaID=Request.Form("metaID")
metaDate=Replace(Request.Form("metaDate"),"'","''")
metaTitle=Replace(Request.Form("metaTitle"),"'","''")
metaKeywords=Replace(Request.Form("metaKeywords"),"'","''")
metaDescription=Replace(Request.Form("metaDescription"),"'","''")
conn.execute("UPDATE tblMeta SET metaDescription='"&metaDescription&"',metaKeywords='"&metaKeywords&"',metaDate='"&metaDate&"',metaTitle='"&metaTitle&"' WHERE metaID="&metaID&";")
Response.Redirect"meta_index.asp"
else
metaID=Request.QueryString("id")
if metaID="" then metaID=1
set rs=conn.execute("SELECT * FROM tblMeta WHERE metaID="&metaID&";") 
%>
<h3>Edit Meta Tags</h3>
<p>
<form action="meta_edit.asp" method="post">
<input type="hidden" name="metaID" value="<%= rs("metaID") %>">
<input type="text" name="metaDate" value="<%= date %>">Date Modified<br>
Title Tag<br>
<input type="text" name="metaTitle" value="<%= rs("metaTitle") %>" size="60"><br>
Keywords:<br>
<textarea cols="45" rows="5" name="metaKeywords"><%= rs("metaKeywords") %></textarea><br>
Description:<br>
<textarea cols="45" rows="5" name="metaDescription"><%= rs("metaDescription") %></textarea><br>
<input type="submit" value="Submit">
</form>
</p>
<% 
End If 
rs.close: set rs=nothing
%>
</body>
</html>
