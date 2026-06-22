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
if Request.Form("submitform")<>"" then

if Request.Form("submitform")="Delete from Hard Drive" then
	Response.Write"Feature to be added"
end if

if Request.Form("submitform")="Add to Database" then
album=Request.Form("paID")
if album="no" then Response.Redirect"photos_utilities.asp"
    for each thing in request.form
    if instr(thing,"pic")then
 	 sql = "INSERT INTO tblPhotos (picCategory,picFileName) "
	 sql = sql & "VALUES ('"&album&"','"&request.form(thing)&"') "
	 conn.execute(sql)
    end if
next
	 Response.Redirect"photos_utilities.asp"
end if

else
set rs=conn.execute("SELECT * FROM tblPhotos") 
set rs2=conn.execute("SELECT * FROM tblPhotoAlbumCategories") 
Set myFileObj=Server.CreateObject("Scripting.FileSystemObject")
%>
<p><strong>Photos not in the database</strong>
<form action="photos_utilities.asp" method="post">

<%
myInt=0
	Set MyFileObject=Server.CreateObject("Scripting.FileSystemObject")
	' Create Folder Object
	Set MyFolder=MyFileObject.GetFolder(Server.MapPath("../photos"))
	'Loop trough the files in the folder
	FOR EACH thing in MyFolder.Files
	 if instr(thing.name,"tn_")=0 then
	 set rs=conn.execute("SELECT * FROM tblPhotos WHERE picFileName='"&thing.name&"'")
	 if rs.eof then
	 myInt=myInt+1
	 Response.Write "<input type=""checkbox"" name=""pic"&myInt&""" value="""&thing.name&""">" & thing.name &"<br>"
	 end if
	 end if
	NEXT
%>
<select name="paID">
	<option value="no" SELECTED>Select Album (If Adding to databse)</option>
<%
On Error Resume Next
rs2.MoveFirst
do while Not rs2.eof
%>
<option value="<%= rs2("paID") %>"><%= rs2("paCatDesc") %></option>
<%
rs2.MoveNext
loop
end if
%>
</select><br><br>
<input type="submit" name="submitform" value="Add to Database">
<input type="submit" name="submitform" value="Delete from Hard Drive">

</form>
</p>
</body>
</html>



