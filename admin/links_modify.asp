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
linkID=Request.Form("myMod")
conn.execute("UPDATE tblLinks SET linkURL='"&linkURL&"',linkDescription='"&linkDescription&"',linkAbout='"&linkAbout&"',linkRegion='"&linkRegion&"',linkModerate='y' WHERE linkID="&linkID&";")

response.redirect"links_index.asp"
else

	myMod=Request.QueryString("mod")
	if myMod="" then Response.Redirect"links_index.asp"
    set rs=conn.execute("SELECT * FROM tblLinks WHERE linkID="&myMod&";")
    set rs2=conn.execute("SELECT * FROM tblLinksCategories")
%>
 
<h3>Add a link to the database</h3>
<p>
<form action="links_modify.asp" method="POST">
<input type="Text" name="url" size="40" value="<%= rs("linkURL") %>"> URL <br>
<input type="Text" name="name" size="40" value="<%= rs("linkDescription") %>"> Web-Site Name<br>
<select name="category">
<%
On Error Resume Next
rs2.MoveFirst
do while Not rs2.eof
%>
<option value="<%= rs2("lcID") %>"<% if rs("linkRegion")=rs2("lcID") then Response.Write" selected"%>><%= rs2("lcDesc") %></option>
<%
rs2.MoveNext
loop%>
</select> Choose where to place the link (if not corect)<br>
<br>Long description of site (max 255 characters)<br>
<textarea cols="40" rows="3" name="linkAbout"><%= rs("linkAbout") %></textarea><br>
<input type="Hidden" name="myMod" value="<%= myMod %>">
<input type="Submit" value="Modify/activate Link">
</form>
</p>
<% 
End If 
%>

</body>
</html>