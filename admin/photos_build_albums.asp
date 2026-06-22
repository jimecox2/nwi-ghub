<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Untitled</title><link rel="STYLESHEET" type="text/css" href="style.css">
	<script language="JavaScript">
<!--
	function openWin( windowURL, windowName, windowFeatures ) { 
		return window.open( windowURL, windowName, windowFeatures ) ; 
	} 
// -->
</script>
</head>

<body>
 <!--#include file="admin_menu.asp"-->

<%  
if Request.Form("action")<>"" then
if instr(Request.Form("action"),"Add") then
album=Request.Form("album")
if album=0 then Response.Redirect"photos_build_albums.asp?msg=<p style=""color:red;""><strong>You forgot to choose an album... try again</strong></p>"
 for each thing in request.form
 if instr(thing,"pic")then
 	set rs=conn.execute("SELECT picCategory FROM tblPhotos WHERE picFileName='"&request.form(thing)&"'")
	if rs("picCategory")=0 then
	rs.close: set rs=nothing
	conn.execute("UPDATE tblPhotos SET picCategory='"&album&"' WHERE picFileName='"&request.form(thing)&"'")
	else
 	sql = "INSERT INTO tblPhotos (picCategory,picFileName) "
	sql = sql & "VALUES ('"&album&"','"&request.form(thing)&"') "
	conn.execute(sql)
	end if
 end if
next
 	Response.Redirect"photos_admin_index.asp"
end if

if instr(Request.Form("action"),"Delete") then
 for each thing in request.form
 if instr(thing,"pic")then
  conn.execute("UPDATE tblPhotos SET picCategory=0 WHERE picFileName='"&request.form(thing)&"'")
 end if
next
 	Response.Redirect"photos_build_albums.asp?msg=<p><strong>Would you like to do more maintenance?</strong></p>"
end if

else
	sql = "SELECT * FROM tblPhotoAlbumCategories Order by paCatDesc"
	Set rs = conn.execute(sql)
%>
<h3>Add or Delete Photos from album: <%= Request.QueryString("name") %></h3>
<form action="photos_build_albums.asp" method="post">
<input type="hidden" name="album" value="<%= Request.QueryString("cat") %>">
<%
	allpics="|"
	Set MyFileObject=Server.CreateObject("Scripting.FileSystemObject")
	' Create Folder Object
	Set MyFolder=MyFileObject.GetFolder(Server.MapPath("../photos"))
	'Loop trough the files in the folder
	FOR EACH thing in MyFolder.Files
	 if instr(thing.name,"tn_")=0 then
	 allpics=allpics&thing.name&"|"
	 end if
	NEXT
	set rs=conn.execute("SELECT tblPhotos.*, tblPhotoAlbumCategories.* FROM tblPhotoAlbumCategories RIGHT JOIN tblPhotos ON tblPhotoAlbumCategories.paID = tblPhotos.picCategory ORDER BY tblPhotos.picCategory,tblPhotos.picFileName")
 %>
</select>
</p>
<table border="1">
<%
myInt=0
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
if instr(allpics,rs("picFileName"))then
if rs("picCategory")=0 then picCategory="<p style=""color:red;"">Not Assigned</p>" else picCategory=rs("paCatDesc")
myInt=myInt+1
%>
<tr valign="top">
	<td><a href="JavaScript: newWindow = openWin( 'photos_preview.asp?id=<%= rs("picFileName") %>', 'preview', 'width=540,height=520,toolbar=0,location=0,directories=0,status=0,menuBar=0,scrollBars=1,resizable=1' ); newWindow.focus()"><img src="../photos/tn_<%= rs("picFileName") %>" alt="<%= rs("picFileName") %>" border="0"></a></td>
	<td><p><%= rs("picFileName") %></p><%= picCategory %><p><input type="checkbox" name="pic<%= myInt %>" value="<%= rs("picFileName") %>"></p></td>
</tr>
<%
End If 
rs.MoveNext
loop
rs.close: set rs=nothing%>
</table>	
<p>
<input type="submit" name="action" value="Add checked pictures to album">
<input type="submit" name="action" value="Delete checked pictures from album">
</p>
</form>
<% End If %>
</body>
</html>
