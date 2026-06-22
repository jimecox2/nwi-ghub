<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Meta Admin</title><link rel="STYLESHEET" type="text/css" href="style.css">
	
</head>

<body> <SCRIPT LANGUAGE="JavaScript" SRC="overlib_mini.js"></SCRIPT>
<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!--#include file="admin_menu.asp"-->
<!--#include file="meta_connection.asp"-->

<h3>Administer Meta Tags</h3>
<p>This interface is used to help you optimize your site for search engine placement.  By using keywords, description and your TITLE tag, you can fine tune the pages of your site for the search engines</p>
<p><a href="meta_add_page.asp"><img src="icon_add.gif" width="16" height="16" alt="Add pages to the meta tags database" border="0">Add Pages</a></p>

<table>
<tr bgcolor="Silver"><th>Page Name</th><th>Title Tag</th><th>View</th></tr>
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

set rs=conn.execute("SELECT * FROM tblMeta ORDER BY metaPageName") 
if rs.eof then response.redirect"meta_add_page.asp"
dtest=""
did=rs("metaID")
Session("DeleteMessage")="Are you sure you wish to remove this page from the meta database?  If you delete this page, your meta and title tags will revert to the default meta information."
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
dtest=dtest&rs("metaDefault")
keyw="<A HREF=""javascript:void(0);"" onMouseOver=""return overlib('"&javaPrep(rs("metaKeywords"))&"',CAPTION, 'Keywords', LEFT)"" onMouseOut=""nd();""><img src=""icon_magnify.gif"" width=""16"" height=""16"" alt=""Keywords"" border=""0""></A>"
desc="<A HREF=""javascript:void(0);"" onMouseOver=""return overlib('"&javaPrep(rs("metaDescription"))&"',CAPTION, 'Description', LEFT)"" onMouseOut=""nd();""><img src=""icon_magnify.gif"" width=""16"" height=""16"" alt=""Description"" border=""0""></A>"
%>
<tr bgcolor="WhiteSmoke">
	<td>
	<a href="meta_edit.asp?id=<%= rs("metaID") %>"><img src="icon_edit.gif" width="16" height="16" alt="Edit Meta Tags" border="0"></a>
	<% if rs("metaDefault")="default" then %><img src="icon_default_on.gif" width="16" height="16" alt="Default meta info" border="0"><% Else %><a href="meta_default_code.asp?id=<%= rs("metaID") %>"><img src="icon_default.gif" width="16" height="16" alt="Make this page the default meta information for pages that are not on this list" border="0"></a><% End If %>
	<a href="validate_delete.asp?del=<%= rs("metaID") %>&script=meta_delete_code"><img src="icon_delete.gif" width="16" height="16" alt="Delete this page from the database" border="0"></a>
	<%= rs("metaPageName") %>
	</td>
	<td title="<%= rs("metaTitle") %>"><%= left(rs("metaTitle"),50)%> <% if len(rs("metaTitle"))>50 then Response.Write"..." %>  </td>
	<td><%= keyw %>&nbsp;<%= desc %></td>
</tr>
<%
rs.MoveNext
loop

if dtest<>"default" then Response.redirect"meta_default_code.asp?id="&did

%>
</table>
 <DIV ID="overDiv" STYLE="position:absolute; visibility:hide; z-index:1;"></DIV>
</body>
</html>
