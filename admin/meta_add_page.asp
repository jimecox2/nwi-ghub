<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Meta Tags Admin</title><link rel="STYLESHEET" type="text/css" href="style.css">
</head>

<body>
<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!--#include file="admin_menu.asp"-->
<!--#include file="meta_connection.asp"-->

<%  
if Request.Form("yes")<>"" then
 for each thing in request.form
  if Request.Form(thing)<>"Submit" then
   	sql = "INSERT INTO tblMeta (metaPageName,metaDefault) "
	sql = sql & "VALUES ('"&Request.Form(thing)&"','') "
    conn.execute(sql) 
  end if
 next
 Response.Redirect"meta_index.asp"
else
%>

<h3>Add page to meta tag database</h3>
<p>If you do not add a page to the meta tag database, the page will use the default TITLE and META tags</p>
<p>Check the pages you want to add and press submit</p>
<form action="meta_add_page.asp" method="post">
<table>
	<% 
	myInt=0
	Set MyFileObject=Server.CreateObject("Scripting.FileSystemObject")
	' Create Folder Object
	Set MyFolder=MyFileObject.GetFolder(Server.MapPath("../"))
	'Loop trough the files in the folder
	FOR EACH thing in MyFolder.Files
	 set rs=conn.execute("SELECT metaPageName FROM tblMeta WHERE metaPageName='"&thing.name&"'")
	if instr(thing.name,".asp") then
	if rs.eof then
	rs.close: set rs=nothing
	myInt=myInt+1
	%>
<tr bgcolor="WhiteSmoke"><td><input type="checkbox" name="page<%= myInt %>" value="<%=thing.Name%>"></td><td><%=thing.Name%></td></tr>

	<%
	end if
	end if
	NEXT
	
	%>
<tr><td colspan="2"><input type="submit" name="yes" value="Submit"></td></tr>
</table>

</form>
<% end if %>
</body>
</html>
