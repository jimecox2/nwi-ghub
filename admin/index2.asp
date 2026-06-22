<!--#include file="connection.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Untitled</title>
	<link rel="STYLESHEET" type="text/css" href="style.css">
	<!-- This Javascript controlls the tool tip popouts -->
	<SCRIPT LANGUAGE="JavaScript" SRC="overlib_mini.js"></SCRIPT>	
</head>
<%  
empID=session("empID")
if empID="" then response.redirect"login.asp"
%>
<body bgcolor="#FFFFFF">
<!-- This DIV must be here for the tool tip popouts -->
<DIV ID="overDiv" STYLE="position:absolute; visibility:hide; z-index:1;"></DIV>
<!--#include file="admin_menu.asp"-->
<p>
<table border="1" cellspacing="1" cellpadding="1" style="border-collapse: collapse; font-size: 8pt;">
<caption>Main Menu Administration</caption>
<%
	Function javaPrep(sValue)
	Dim sAns
	Dim sBns
	Dim sCns
	sAns = Replace(sValue, vbcrlf, "<br>")
	sBns = Replace(sAns, Chr(34), "'")
	sCns = Replace(sBns, Chr(39), "\'")
	javaPrep = sCns
	End Function

sqlmm="SELECT * FROM tblPermissions WHERE empID="&empID&";"
set rsm=conn.execute(sqlmm)
On Error Resume Next
rsm.MoveFirst
do while Not rsm.eof
'call all admin menus
if rsm("pCategory")="main" then
sqlm=("SELECT * FROM qryMenu WHERE mmenuDefaultPage='"&rsm("pPage")&"' ORDER BY menuCategory")
set rs=conn.execute(sqlm)
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
DO WHILE dtype <> rs("mmenuCategoryID")
	dtype= rs("mmenuCategoryID")
	%>
<tr bgcolor="#dcdcdc">
	<td><A HREF="javascript:void(0);" onClick="return overlib('<a href=\'admin_edit_form.asp?id=<%= rs("mmenuDefaultPage") %>\'><img src=\'icon_edit.gif\' width=\'16\' height=\'16\' border=\'0\'>Edit this Page</a> (<strong>Filename:</strong> <%= rs("mmenuDefaultPage") %>)<br><a href=\'admin_add_form.asp?cat=<%= rs("mmenuCategoryID") %>\'><img src=\'icon_add.gif\' width=\'16\' height=\'16\' border=\'0\'>Add a page to the site</a><br><a href=\'admin_link_page.asp?cat=<%= rs("mmenuCategoryID") %>\'><img src=\'icon_link.gif\' width=\'16\' height=\'16\' border=\'0\'>Link a page to the site</a><br><a href=\'admin_edit_sort_order.asp?cat=<%= rs("mmenuCategoryID") %>\'><img src=\'icon_sort.gif\' width=\'16\' height=\'16\' border=\'0\'>Edit menu sort order</a><br><a href=\'validate_delete.asp?script=admin_del_main_menu&del=<%= rs("mmenuCategoryID") %>\'><img src=\'icon_link_break.gif\' width=\'16\' height=\'16\' border=\'0\'>Remove main menu item</a><br><a href=\'../<%= rs("mmenuDefaultPage") %>\'><img src=\'icon_magnify.gif\' width=\'16\' height=\'16\' border=\'0\'>View Page</a>',CAPTION, 'Tools for Section: &quot;<%= rs("mmenuDefaultPage") %>&quot;', BELOW, STICKY, WIDTH, 350,BGCOLOR,'#000000',CAPCOLOR,'#ffffff',FGCOLOR,'#c0c0c0')" ;"><b><%= javaPrep(rs("mmenuTitle")) %></b></a></td>
</tr>
<% LOOP %> 
<tr bgcolor="WhiteSmoke">
	<td>&nbsp;&nbsp;&nbsp;<A HREF="javascript:void(0);" onClick="return overlib('<a href=\'admin_edit_form.asp?id=<%= rs("menuFileName") %>\'><img src=\'icon_edit.gif\' width=\'16\' height=\'16\' border=\'0\'>Edit this Page</a> (<strong>Filename:</strong> <%= rs("menuFileName") %>)<br><a href=\'admin_edit_link.asp?id=<%= rs("menuID") %>\'><img src=\'icon_edit_link.gif\' width=\'16\' height=\'16\' border=\'0\'>Edit page link</a><br><a href=\'validate_delete.asp?script=admin_delete_code&del=<%= rs("menuID") %>\'><img src=\'icon_link_break.gif\' width=\'16\' height=\'16\' border=\'0\'>Un-link this page</a><br><a href=\'../<%= rs("menuFileName") %>\'><img src=\'icon_magnify.gif\' width=\'16\' height=\'16\' border=\'0\'>View Page</a>',CAPTION, 'Tools for Page: &quot;<%= javaPrep(rs("menuPageName")) %>&quot;', BELOW, STICKY, WIDTH, 350,BGCOLOR,'dcdcdc',CAPCOLOR,'000000',FGCOLOR,'#f5f5f5')" ;"><%= rs("menuPageName") %></a>&nbsp;&nbsp;</td>
</tr>
<%
rs.MoveNext
loop
end if
rsm.MoveNext
loop
rsm.close: set rsm=nothing
rs.close
set rs=nothing
%>
</table>
</p>


<p>
<table border="1" cellspacing="1" cellpadding="1" style="border-collapse: collapse; font-size: 8pt;">
<caption>Single Page Administration</caption>
<%
sqlms="SELECT * FROM tblPermissions WHERE empID="&empID&";"
set rsm=conn.execute(sqlms)
On Error Resume Next
rsm.MoveFirst
do while Not rsm.eof
'call all admin menus
if rsm("pCategory")="sub" then
sqls=("SELECT * FROM qryMenu WHERE menuFileName='"&rsm("pPage")&"' ORDER BY menuOrder")
set rs=conn.execute(sqls)
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
%> 
<tr bgcolor="WhiteSmoke">
	<td>&nbsp;&nbsp;&nbsp;<A HREF="javascript:void(0);" onClick="return overlib('<a href=\'admin_edit_form.asp?id=<%= rs("menuFileName") %>\'><img src=\'icon_edit.gif\' width=\'16\' height=\'16\' border=\'0\'>Edit this Page</a> (<strong>Filename:</strong> <%= rs("menuFileName") %>)<br><a href=\'admin_edit_link.asp?id=<%= rs("menuID") %>\'><img src=\'icon_edit_link.gif\' width=\'16\' height=\'16\' border=\'0\'>Edit page link</a><br><a href=\'validate_delete.asp?script=admin_delete_code&del=<%= rs("menuID") %>\'><img src=\'icon_link_break.gif\' width=\'16\' height=\'16\' border=\'0\'>Un-link this page</a><br><a href=\'../<%= rs("menuFileName") %>\'><img src=\'icon_magnify.gif\' width=\'16\' height=\'16\' border=\'0\'>View Page</a>',CAPTION, 'Tools for Page: &quot;<%= javaPrep(rs("menuPageName")) %>&quot;', BELOW, STICKY, WIDTH, 350,BGCOLOR,'dcdcdc',CAPCOLOR,'000000',FGCOLOR,'#f5f5f5')" ;"><%= rs("menuPageName") %></a>&nbsp;&nbsp;</td>
</tr>
<%
rs.MoveNext
loop
end if
rsm.MoveNext
loop
rsm.close: set rsm=nothing
rs.close
set rs=nothing
%>
</table>
</p>
</body>
</html>
 