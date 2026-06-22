

<!--#include file="ssi_header.asp"-->
<!-- Start HTML Content -->
<%
    sql = "SELECT * FROM tblPhotoAlbumCategories ORDER BY paSortOrder"
    Set rs = conn.execute(sql)
%>
<h3>Our photo albums</h3>
<%= Request.QueryString("msg") %>
<%
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
%>
<a href="photo_album.asp?cat=<%= rs("paID") %>"><%= rs("paCatDesc") %></a><br>
<%
rs.MoveNext
loop
rs.close: set rs=nothing
%>



<!-- End HTML Content -->
<!--#include file="ssi_footer.asp"-->

