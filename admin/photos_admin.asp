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

<%
myCat = Request.QueryString("cat") 
if myCat="" THEN myCat = 10

myPic= Request.QueryString("pic")
if myPic="" THEN myPic=1

    sql = "SELECT * FROM tblPhotos WHERE picCategory="&myCat&" ORDER BY picOrder"
    Set rs = conn.execute(sql)
%>

<h3>Administer Photos</h3>
<p>Click on the photo filenames to edit or add the photo description.  You can also use this form to change the photo filename.  Use the checkboxes to flag items for deletion.</p>
<form action="photos_code_delete.asp" method="post">
<table border="1">
<%
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
%>

<tr>
<%For j = 1 to 4%>
<td align="center" valign="bottom">
<% If rs("picFilename")="" THEN %>
<% Else  %>
<a href="photos_admin_form.asp?pic=<%= rs("picID")%>&cat=<%=rs("picCategory")%>"><img src="../photos/tn_<%= rs("picFilename")%>" border="0" width="100" alt=""><br><%= rs("picFilename")%></a>&nbsp;
<input type="checkbox" name="delete<%= rs("picID")%>" value="<%= rs("picID")%>">
<% End If %>
<%rs.MoveNext%>
&nbsp;</td>
<%Next%>
</tr>

<%
loop
rs.close
set rs=nothing
conn.close
Session("DeleteMessage")="Are you sure you want to delete these photos?"
%>

</table>
<input type="submit" name="go" value="Delete all marked items...">
<input type="submit" name="go" value="Move selected pictures to the end">
</form>


</body>
</html>

