<table bgcolor="#e4e4e4"><tr><td>

<% If session("admin")="user" then %>
<p>
| <a href="index2.asp">Admin&nbsp;Home</a> |
<%
sqlp="SELECT * FROM tblPermissions WHERE empID="&empID&";"
set rsp=conn.execute(sqlp)
On Error Resume Next
rsp.MoveFirst
do while Not rsp.eof
'call all admin menus
if rsp("pCategory")="admin" then
sqlt=("SELECT * FROM tblAdminMenu WHERE amMenuFile='"&rsp("pPage")&"'")
set rst=conn.execute(sqlt)
amMenuName=rst("amMenuName")
rst.close: set rst=nothing
%>
<a href="<%= rsp("pPage") %>"><%= amMenuName %></a>&nbsp;|
<%
end if
rsp.MoveNext
loop
rsp.close: set rsp=nothing
%>
</p>
<% Else  %>
<p>
| <a href="index.asp">Admin&nbsp;Home</a> |
<%
sqlam=("SELECT * FROM tblAdminMenu")
set rsam=conn.execute(sqlam)
On Error Resume Next
rsam.MoveFirst
do while Not rsam.eof
%>
<a href="<%= rsam("amMenuFile") %>"><%= rsam("amMenuName") %></a>&nbsp;|
<%

rsam.MoveNext
loop
rsam.close: set rsam=nothing
%>
<a href="users_index.asp">users</a> |
</p>
<% End If %>
</td></tr></table>