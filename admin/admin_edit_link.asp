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
if Request.Form("menuPageName")<>"" then 
menuID=Request.Form("menuID")
menuPageName=Replace(Request.Form("menuPageName"),"'","''")
if Request.Form("qs")<>"" then 
qs="?"&Replace(Request.Form("qs"),"?","")
else
qs=""
end if
menuFileName=Request.Form("menuFileName")&qs
sql = "UPDATE tblMenu SET menuPageName='"&menuPageName&"',menuFileName='"&menuFileName&"' WHERE menuID="&menuID&";"
conn.execute(sql)
response.redirect"index.asp"
else
menuID=Request.QueryString("id")
if menuID="" then menuID=3
set rs=conn.execute("SELECT * FROM tblMenu WHERE menuID="&menuID&";")
menuFileName=rs("menuFileName")
qs=""
if instr(menuFileName,"?")>0 then
menuFileName=left(menuFileName,instr(menuFileName,"?")-1)
qs=mid(rs("menuFileName"),instr(rs("menuFileName"),"?")+1)
end if
%>
<br>&nbsp;
<table>
<tr>
	<td valign="top">
	<p><strong>Edit page link: <u><%= rs("menuPageName") %></u></strong><br>
	<form action="admin_edit_link.asp" method="post">
	<input type="hidden" name="menuID" value="<%= menuID %>">	
	<input type="Text" name="menuPageName" value="<%= rs("menuPageName") %>">Menu item name (link)<br>
	<input type="Text" name="menuFileName" value="<%= menuFileName %>">Filename<br>
	<input type="text" name="qs" value="<%= qs %>">Optional query string<br>
	<input type="submit" value="Edit page link">
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
