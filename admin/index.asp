<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Admin Index</title><link rel="STYLESHEET" type="text/css" href="style.css">
	<!-- This Javascript controlls the tool tip popouts -->
	<SCRIPT LANGUAGE="JavaScript" SRC="overlib_mini.js"></SCRIPT>
</head>

<body>
<!--#include file="admin_menu.asp"-->



<% 
' this session is used for the admin menu

if pPage<>"all" then response.redirect "index2.asp"
	Function javaPrep(sValue)
	Dim sAns
	Dim sBns
	Dim sCns
	sAns = Replace(sValue, vbcrlf, "<br>")
	sBns = Replace(sAns, Chr(34), "'")
	sCns = Replace(sBns, Chr(39), "\'")
	javaPrep = sCns
	End Function
	'call the menu query
	sql = "SELECT * FROM qryMenu ORDER BY mmenuOrder,menuOrder"
    Set rs = Server.CreateObject("ADODB.Recordset")
    rs.Open sql, conn, 3, 3
	Session("DeleteMessage")="Are you sure you want to delete this link from the menu?  This does not remove the file from the server."
%>
<!-- This DIV must be here for the tool tip popouts -->
<DIV ID="overDiv" STYLE="position:absolute; visibility:hide; z-index:1;"></DIV>

<h3>Content Administration (Administrator)</h3>

<div>
<table>
<tr>
	<td valign="top">

<table border="1" cellspacing="1" cellpadding="1" style="border-collapse: collapse; font-size: 8pt;">
<%
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
rs.close
set rs=nothing
conn.close
%>
</table>
</td>
	<td valign="top">
	<p>
	<a href="admin_add_form.asp?cat=addnew">Create a new page for the site</a><br>
	<a href="admin_edit_sort_order_main.asp">Edit main menu sort order</a><br>
	<a href="admin_orphan_files.asp">Administer temporary and orphan files</a>
	</p>
<p>

<form action="uploader_form.asp" method="post">
<strong>File uploader</strong><br>
<input type="text" name="picno" value="1" size="1" maxlength="1" class="picno">
<input type="submit" value="Add files" class="picbtn"> type the number of files to upload</form>
</p>
	</td>
</tr>
</table>
</div>
</body>
</html>
