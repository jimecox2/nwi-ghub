

<!--#include file="ssi_header.asp"-->
<!-- Start HTML Content -->
 
<%
myCat=Request.QueryString("cat")
if myCat ="" THEN Response.Redirect"photo_albums.asp"
if myCat =0 THEN Response.Redirect"photo_albums.asp"
if instr(request.servervariables("HTTP_REFERER"),"trip.asp") then
set rsa=conn.execute("SELECT pacAlbumID FROM tblPhotoAlbumReference WHERE pacItemID="&myCat&";")
if rsa.eof then Response.Redirect"photo_albums.asp?msg=<p>We do not currently have a series of photos available specifically for this trip.  Please have a look at the many other photos that we do have.</p>"
myCat=rsa("pacAlbumID")
rsa.close: set rsa=nothing
end if

if Request.QueryString("pic")="" THEN
myPic=1
ELSE
myPic=Request.QueryString("pic")
END IF
    sql = "SELECT tblPhotos.*, tblPhotoAlbumCategories.paCatDesc FROM tblPhotos INNER JOIN tblPhotoAlbumCategories ON tblPhotos.picCategory = tblPhotoAlbumCategories.paID WHERE picCategory="&myCat&" ORDER BY picOrder"
	sql2 = "SELECT * FROM tblPhotos WHERE picID="&myPic&";"
    Set rs = Server.CreateObject("ADODB.Recordset")
    Set rs2 = Server.CreateObject("ADODB.Recordset")	
    rs.Open sql, conn, 3, 3
    rs2.Open sql2, conn, 3, 3
	if rs.eof then Response.Redirect"photo_albums.asp?msg=<p>Sorry, we do not have any photos available at this time.  Please check back again soon.</p>"
%>
<div align="center">

<h3>Photo Album: <%= rs("paCatDesc") %></h3>
<table border="2" cellspacing="0" cellpadding="2" bordercolor="#00659c" style="BORDER-COLLAPSE: collapse;">
<% if Request.QueryString("pic")<>"" THEN %>
<tr>
	<td colspan="4" align="center">
<font face="Verdana,Arial,sans-serif"><b><%= rs2("picTitle")%></b><br></font>
	<img src="photos/<%= rs2("picFileName")%>" border="0"><br>
	<font face="Verdana,Arial,sans-serif"><%= rs2("picDesc")%></font>
</td>
</tr>
<% End If %>
<%
On Error Resume Next
rs.MoveFirst
do while Not rs.eof

%>
<tr>
 <%For j = 1 to 4%>
<td align="center" valign="bottom">
<% If rs("picFileName")="" THEN %>
<% Else  %>
<a href="photo_album.asp?pic=<%= rs("picID")%>&id=Photos&cat=<%=rs("picCategory")%>"><img src="photos/tn_<%= rs("picFileName")%>" border="0"></a><br>
<% End If %>
<a href="photo_album.asp?pic=<%= rs("picID")%>&id=Photos&cat=<%=rs("picCategory")%>"><%= rs("picTitle")%></a>
<%rs.MoveNext%>
</td>
<%Next%>
</tr>
<%loop
rs.close
rs2.close
set rs=nothing
set rs2=nothing
conn.close
%>
</table>
<!-- End HTML Content -->
<!--#include file="ssi_footer.asp"-->

