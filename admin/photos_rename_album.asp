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
if Request.Form("paCatDesc")<>"" then
paID=Request.Form("paID")
paCatDesc=Replace(Request.Form("paCatDesc"),"'","''")
conn.execute("UPDATE tblPhotoAlbumCategories SET paCatDesc='"&paCatDesc&"' WHERE paID="&paID&";")
response.redirect"photos_admin_index.asp"
else
paCatDesc=Request.QueryString("desc")
paID=Request.QueryString("id")
%>
 <form action="photos_rename_album.asp" method="post">
 <input type="hidden" name="paID" value="<%= paID %>">
 <input type="text" name="paCatDesc" size="80" value="<%= paCatDesc %>"><br>
 <input type="submit" value="Change">
 </form>
<% End If 
conn.close%>
</body>
</html>
