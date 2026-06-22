<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Administration</title>
<link rel="STYLESHEET" type="text/css" href="style.css">
</head>

<body>
<!--#include file="admin_menu.asp"-->

<h3>Maintain web links <a href="links_add_category.asp"><img src="icon_add.gif" width="16" height="16" alt="Add and maintain link categories" border="0"></a></h3>
<% 
	set rs=conn.execute("SELECT * FROM tblLinksCategories ORDER BY lcOrder")
%>
<table border="0">
<% 
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
set rs2=conn.execute("SELECT * FROM tblLinks WHERE linkRegion="&rs("lcID")&" ORDER BY linkDescription")
%>
<tr bgcolor="Silver"><th colspan="3"><%= rs("lcDesc") %>  <a href="links_add.asp?id=<%= rs("lcID") %>"><img src="icon_link.gif" width="16" height="16" alt="Add a link to this category" border="0"></a></th></tr>

<%
On Error Resume Next
rs2.MoveFirst
do while Not rs2.eof
%>
<tr bgcolor="whitesmoke">
	<td valign="TOP" nowrap><a href="<%=rs2.Fields("linkURL")%>"><%=rs2.Fields("linkDescription")%></a></td>
	<td valign="TOP"><%=rs2.Fields("linkModerate")%>&nbsp;</td>
	<td valign="TOP"><a href="links_modify.asp?mod=<%= rs2("linkID") %>"><img src="icon_edit_link.gif" width="16" height="16" alt="Modify Link" border="0"></a>&nbsp;&nbsp;<a href="links_delete.asp?del=<%= rs2("linkID") %>"><img src="icon_delete.gif" width="16" height="16" alt="Delete Link" border="0"></a></td>
</tr>
<%
rs2.MoveNext
loop

rs.MoveNext
loop
rs2.close: set rs2=nothing
rs.close: set rs=nothing
'make the text file
bd="<p align=""center"">"&vbCrLf
set rs=conn.execute("SELECT * FROM tblLinksCategories ORDER BY lcOrder")
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
bd=bd&"<a href=""#"&trim(rs("lcDesc"))&""">"&trim(rs("lcDesc"))&"</a> &nbsp;"
rs.MoveNext
loop
bd=bd& vbCrLf
bd=bd&"</p>"

Function javaPrep(sValue)

Dim sAns
Dim sBns
Dim sCns
sAns = Replace(sValue, vbcrlf, "<br>")
sBns = Replace(sAns, Chr(34), "'")
sCns = Replace(sBns, Chr(39), "\'")

javaPrep = sCns

End Function

On Error Resume Next
rs.MoveFirst
do while Not rs.eof
set rs2=conn.execute("SELECT * FROM tblLinks WHERE linkRegion="&rs("lcID")&" ORDER BY linkDescription")
bd=bd&"<h4><a name="""&trim(rs("lcDesc"))&""">"&rs("lcDesc")&"</a> </h4>"&vbCrLf
bd=bd&"<ul style=""list-style-image: url(images/bullet.gif);"">"&vbCrLf

On Error Resume Next
rs2.MoveFirst
do while Not rs2.eof
bd=bd&"<li><a href="""&rs2.Fields("linkURL")&""" onMouseOver=""EnterContent('ToolTip','Web link details','"&javaPrep(rs2.Fields("linkAbout"))&"'); Activate();"" onMouseOut=""deActivate();"">"&rs2.Fields("linkDescription")&"</a></li>"&vbCrLf
rs2.MoveNext
loop
bd=bd&"<li><a href=""#top"" onMouseOver=""EnterContent('ToolTip','Web link details','Return to top of this page'); Activate();"" onMouseOut=""deActivate();"">&lt;Top&gt;</a></li>"&vbCrLf
bd=bd&"</ul>"&vbCrLf
rs.MoveNext
loop
rs.close: set rs=nothing
Set fso = Server.CreateObject("Scripting.FileSystemObject")
Set linkinc=fso.CreateTextFile(server.mappath("../ssi_links.asp"))
linkinc.WriteLine(bd)
linkinc.close
rs2.close: set rs2=nothing
rs.close: set rs=nothing
%>
</table>


</body>
</html>