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
    sql = "SELECT * FROM tblUsers"
    Set rs = Server.CreateObject("ADODB.Recordset")
    rs.Open sql, conn, 3, 3
%>
<p>
<a href="users_add.asp"><img src="icon_add.gif" width="16" height="16" alt="Add user" border="0"> Add user</a>
<table>
<tr bgcolor="#a2a2a2"><th>Name</th><th>UserID</th><th>Tools</th></tr>
<%
Session("DeleteMessage")="Are you sure you wish to delete this user from the database?"
iRecordCount = 0
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
' alternate table row colours
  IF iRecordCount Mod 2 = 0 THEN
  bgcolor="#d3d3d3"
  else
  bgcolor="whitesmoke"
  End If
%>
<tr bgcolor="<%= bgcolor %>">
	<td><%= rs("empFirstName") %>&nbsp;<%= rs("empLastName") %></td>
	<td><a href="mailto:<%= rs("empUserName") %>"><%= rs("empUserName") %></a></td>
	<td>
	<a href="users_edit.asp?id=<%= rs("empID") %>"><img src="icon_edit.gif" width="16" height="16" alt="Edit User" border="0"></a>
	<a href="validate_delete.asp?script=users_delete&del=<%= rs("empID") %>"><img src="icon_delete.gif" width="16" height="16" alt="Delete User" border="0"></a>
	<a href="users_add_permissions.asp?id=<%= rs("empID") %>"><img src="icon_add.gif" width="16" height="16" alt="Add permissions" border="0"></a>
	</td>
</tr>
	<%
iRecordCount = iRecordCount + 1
rs.MoveNext
loop
rs.close: set rs=nothing
conn.close
%>
</table>
</p>
</body>
</html>
