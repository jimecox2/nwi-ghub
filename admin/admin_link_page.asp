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
cat=Request.QueryString("cat")
menuPageName=Request.Form("menuPageName")
menuCategory=Request.Form("menuCategory")
if Request.Form("qs")<>"" then 
qs="?"&Replace(Request.Form("qs"),"?","")
else
qs=""
end if
menuFileName=Request.Form("menuFileName")&qs
if menuPageName<>"" then
	'call menu database for sort order and declare sort order
    sql = "SELECT * FROM tblMenu Where menuCategory="&menuCategory&" ORDER BY MenuOrder DESC"
    Set rs = Server.CreateObject("ADODB.Recordset")
    rs.Open sql, conn, 3, 3
	if rs.eof then
	menuOrder=1
	else
	menuOrder=rs("menuOrder")+1
	end if
	 sql2= "Insert into tblMenu (menuCategory,menuPageName,menuFileName,menuOrder)"
	 sql2= sql2 & "VALUES ('"&menuCategory&"','"&menuPageName&"','"&menuFileName&"','"&menuOrder&"')"
	 conn.execute(sql2)
	 response.redirect"index.asp"
else
%>
<br>&nbsp;
<table>
<tr>
	<td valign="top">
	<p><strong>Link a page to the site: <u><%= cat %></u></strong><br>
	<form action="admin_link_page.asp" method="post">
	<input type="hidden" name="menuCategory" value="<%= cat %>">
	<input type="Text" name="menuPageName">Menu item name (link)<br>
	<input type="Text" name="menuFileName">Filename<br>
	<input type="text" name="qs">Optional query string<br>
	<input type="submit" value="Link page">
	</form>
	</p>
	</td>
	<td valign="top">
	<p><strong>Files available on server</strong><br>
	<DIV STYLE="overflow: auto; width: 350px; height: 100; border: 1px silver solid; border-right: 1px silver solid; padding:4px; margin: 0px">

<table>
	<% 
	Set MyFileObject=Server.CreateObject("Scripting.FileSystemObject")
	' Create Folder Object
	Set MyFolder=MyFileObject.GetFolder(Server.MapPath("../"))
	'Loop trough the files in the folder
	FOR EACH thing in MyFolder.Files
	if instr(thing.name,".asp") then
	%>
	<tr bgcolor="WhiteSmoke">
	<td nowrap><%=thing.Name%></td>
	</tr>
	<%
	end if
	NEXT
	end if
	%>
	</table>
	</div></p>	
	</td>
</tr>
</table>



</body>
</html>
