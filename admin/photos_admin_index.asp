<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Photo album</title>
	<link rel="STYLESHEET" type="text/css" href="style.css">
</head>

<body bgcolor="White">

<!--#include file="admin_menu.asp"-->

<h3>Administer Photo Albums</h3>
<p><a href="photos_make_album.asp">Add photo album</a>
 | <a href="photos_utilities.asp">Add photos to database</a>
 | <a href="photos_edit_sort_order.asp"><img src="icon_sort.gif" width="16" height="16" alt="edit sort order" border="0"></a>
 </p>
<p><strong>Existing Photo Albums</strong><br>
<%
if Request.QueryString("pic")="" THEN
myPic=1
ELSE
myPic=Request.QueryString("pic")
END IF
	sql = "SELECT * FROM tblPhotoAlbumCategories Order by paSortOrder"
	Set rs = conn.execute(sql)
%>	
<table cellspacing="2" cellpadding="0">
<%  
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
%>
<tr bgcolor="WhiteSmoke">
<td><%= rs("paCatDesc") %></td>
<td><a href="photos_build_albums.asp?cat=<%= rs("paID") %>&name=<%= Server.URLEncode(rs("paCatDesc")) %>"><img src="icon_add.gif" width="16" height="16" alt="Add Photos to Album" border="0"></a>
| <a href="photos_admin.asp?cat=<%= rs("paID") %>"><img src="icon_edit.gif" width="16" height="16" alt="Edit Photos" border="0"></a>
| <a href="photos_rename_album.asp?id=<%= rs("paID") %>&desc=<%= Server.URLEncode(rs("paCatDesc")) %>"><img src="icon_edit_link.gif" width="16" height="16" alt="Edit Photo album title" border="0"></a>
</td>
</tr>
<%
rs.MoveNext
loop
rs.close
set rs=nothing
conn.close %>
</table>
</p>
<div>
<h3>Things to keep in mind...</h3>
<ul>
	<li>Thumbnails are grouped 4 per-row.  For best results create photo albums with 4, 8, 12, 16 etc photos.</li>
	<li>If you are going to have "Portrait" photos mixed with "Landscape" photos, you can group the Portraits together.</li>
	<li>It is possible to have the same photo in more than one album.  Be careful you do not add the same photo twice to an album.</li>
	<li>All "landscape" photos are 500 px wide, all "portrait" photos are 400 px wide.</li>
	<li>Thumbnails are 100 px wide and are kept in the same directory as the large images. Thumbnail filenames all have the prefix "tn_".  </li>
	<li>There is no interface for deleting entire albums yet... that will come.</li>
	<li>Use FTP to load all photos into the "photos" directory of the site.</li>
</ul>
</div>
</body>
</html>

