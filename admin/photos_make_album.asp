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
If Request.Form("paCatDesc")<>"" then
paCatDesc=Replace(Request.Form("paCatDesc"),"'","''")
	sql = "INSERT INTO tblPhotoAlbumCategories (paCatDesc,paSortOrder) "
	sql = sql & "VALUES ('"&paCatDesc&"',0) "
	conn.execute(sql)

		sql = "SELECT MAX(paID) FROM tblPhotoAlbumCategories"
		set rs = conn.Execute(sql)
		paID = rs(0)
		rs.close: set rs = nothing
 %>
<h3>Create photo album Step 2</h3>
<p>
<form action="photos_add_pictures.asp" method="post">
<input type="hidden" name="paID" value="<%= paID %>">
<input type="text" name="howmany" size="2">How many photos are you adding?<br>
<input type="text" name="picFileName">What is the base file name?<br>
<input type="submit" value="Add photos">
</form>
</p>
<p>When you create your photos, you need to name them in a numerical series.  The base filename you choose here will have a sequential number appended to it starting at "01". </p>

<p>For example... If you are adding a series of photos of Polar Bears, you would name your photos sequentialy polarbear01.jpg, polarbear02.jpg and so on.  Choose a unique filename and don't fret too much about this you can change the names after.</p>
<% else %>

<h3>Create photo album</h3>
<p>
<form action="photos_make_album.asp" method="post">
<input type="text" name="paCatDesc" size="40">Photo Album Name<br>
<input type="submit" value="Make Album">
</form>
</p>
<% End If %>
</body>
</html>
