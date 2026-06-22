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
bd=bd&"<li><a href="""&rs2.Fields("linkURL")&""" onMouseOver=""return overlib('"&javaPrep(rs2.Fields("linkAbout"))&"',CAPTION, 'Site Information', RIGHT, FGCOLOR,'tan', BGCOLOR,'Maroon')"" onMouseOut=""nd();"">"&rs2.Fields("linkDescription")&"</a></li>"&vbCrLf
rs2.MoveNext
loop
bd=bd&"<li><a href=""#top"" onMouseOver=""return overlib('Return to top of this page',CAPTION, 'Navigation', RIGHT, FGCOLOR,'tan', BGCOLOR,'Maroon')"" onMouseOut=""nd();"">&lt;Top&gt;</a></li>"&vbCrLf
bd=bd&"</ul>"&vbCrLf
rs.MoveNext
loop
rs.close: set rs=nothing
Set fso = Server.CreateObject("Scripting.FileSystemObject")
Set linkinc=fso.CreateTextFile(server.mappath("../ssi/links.inc"))
linkinc.WriteLine(bd)
linkinc.close
%>

<%= bd %>

</body>
</html>
