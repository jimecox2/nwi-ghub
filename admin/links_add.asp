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

<%
If Request.Form("url")<>"" then
linkURL=Replace(Request.Form("url"),"'","''")
if instr(linkURL,"http://")=0 then linkURL="http://"&linkURL
linkDescription=Replace(Request.Form("name"),"'","''")
linkAbout=Replace(Request.Form("linkAbout"),"'","''")
linkRegion=Request.Form("category")
'sql
	sql = "INSERT INTO tblLinks (linkURL,linkDescription,linkAbout,linkRegion,linkModerate) "
	sql = sql & "VALUES ('"&linkURL&"','"&linkDescription&"','"&linkAbout&"','"&linkRegion&"','y') "
	conn.execute(sql)
response.redirect"links_index.asp"
else
	cat=Request.QueryString("id")
	if cat="" then response.redirect"links_index.asp"
    set rs=conn.execute("SELECT * FROM tblLinksCategories WHERE lcID="&cat&";")
%>
 
<h3>Add link to <%= rs("lcDesc") %></h3>
<p>
<form action="links_add.asp" method="POST">
<input type="Text" name="url" size="40"> URL <br>
<input type="Text" name="name" size="40"> Web-Site Name<br>
<br>Long description of site (max 255 characters)<br>
<textarea cols="40" rows="3" name="linkAbout"></textarea><br>
<input type="Hidden" name="category" value="<%= cat %>"><br>
<input type="Submit" value="Add Link">
</form>
</p>
<% 
End If 
%>

</body>
</html>