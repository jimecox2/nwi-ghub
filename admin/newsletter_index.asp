<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<% 
session("myCat")=myCat
	sql= "SELECT * FROM tblNewsletter ORDER BY nlArchive,nlDatePosted"
    Set rs = conn.execute(sql)
	Session("DeleteMessage")="<p style=""color: Red; font-weight: bold; width: 300px;"">You are about to permanently delete this newsletter article from the database and delete all pictures associated with it from the images directory.</p>"
%>
<html>
<head>
	<title>Administration</title>
<link rel="STYLESHEET" type="text/css" href="style.css">
</head>

<body>
<!--#include file="admin_menu.asp"-->

<h3>Newsletter administration</h3>
<p><a href="index.asp">Return to admin index</a>&nbsp;&nbsp;<a href="newsletter_form_add.asp">Add new</a></p>
<table>
<%
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
	sqlp= "SELECT nlPicFilename,nlPicDescription FROM tblNewsletterPics WHERE nlPicID="&rs("nlID")&";"	
	Set rsp=conn.execute(sqlp)

Select Case rs("nlArchive")
Case "y" 
myStatus="Active Article"
myFont="<font color=black>"
Case "a" 
myStatus="Default Article"
myFont="<font color=Maroon>"
Case "n" 
myStatus="Not on display now"
myFont="<font color=silver>"
End Select
%>
<tr bgcolor="WhiteSmoke" >
	<td title="<%= myStatus %>"><%= myFont & rs("nlHeadline") %></font></td>
	<td>
	<% If myStatus<>"Default Article" then %><a href="newsletter_code_set_active.asp?an=<%= rs("nlID") %>">Set as Default</a><% Else Response.Write myStatus end if %> |
	<a href="newsletter_form_edit.asp?an=<%= rs("nlID") %>">edit/activate</a> |
	<% If myStatus<>"Not on display now" then %><a href="newsletter_remove.asp?an=<%= rs("nlID") %>">Remove</a><% Else Response.Write myFont &"Remove"&"</font>" end if %> |
	<a href="validate_delete.asp?script=newsletter_delete&del=<%= rs("nlID") %>">Delete</a>
	</td>
</tr>
<%
rs.MoveNext
loop
rs.close
set rs=nothing
rs2.close
set rs2=nothing
conn.close
set conn=nothing
%> 
</table>
</body>
</html>


