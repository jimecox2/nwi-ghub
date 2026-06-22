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
' function for removing numbers from a string
Function StripNums(sString)
	Dim nCharPos, sOut, nChar
	nCharPos = 1
	sOut = ""
	For nCharPos = 1 To Len(sString)
		nChar = Asc(Lcase(Mid(sString, nCharPos, 1)))
		If ((nChar < 48 And nChar > 57) or (nChar > 96 And nChar < 123) or nChar = 32) Then
			sOut = sOut & Mid(sString, nCharPos, 1)
		End If
	Next
	StripNums = sOut
End Function

' set administrator
if Request.QueryString("perm")<>"" then
empID=Request.QueryString("perm")
conn.execute("DELETE FROM tblPermissions WHERE empID="&empID&";")
	sql = "INSERT INTO tblPermissions (empID,pPage,pCategory) "
	sql = sql & "VALUES ('"&empID&"','all','all') "
conn.execute(sql)
response.redirect"users_index.asp"
end if

' Start form handling
if Request.Form("empID")<>"" then
empID=Request.Form("empID")
' delete existing permissions
conn.execute("DELETE FROM tblPermissions WHERE empID="&empID&";")
' loop through the form and add records
for each thing in request.form
 if not thing="empID"then
  pPage=Request.Form(thing)
  pCategory=StripNums(thing)
	sql = "INSERT INTO tblPermissions (empID,pPage,pCategory) "
	sql = sql & "VALUES ('"&empID&"','"&pPage&"','"&pCategory&"') "
    conn.execute(sql)
 end if
next
response.redirect"users_index.asp"
else

' open connections to database tables for making checkboxes
empID=Request.QueryString("id")
set rs=conn.execute("SELECT * FROM tblPermissions WHERE empID="&empID&";")
set rsa=conn.execute("SELECT * FROM tblAdminMenu")
set rsm=conn.execute("SELECT * FROM tblMenu")
set rsmm=conn.execute("SELECT * FROM tblMenuMain")

' make a comparison string for filling the checkboxes
stComp="|"
On Error Resume Next
rs.MoveFirst
do while Not rs.eof
stComp=stComp & rs("pPage")&"|"
rs.MoveNext
loop
rs.close: set rs=nothing
%>


<% If instr(stComp,"|all|")>0 Then %>
<h3 style="color:white;background-color:red;">This user is an administrator</h3>
<p style="color:red;">Setting any checkboxes below will remove him as an administrator</p>
<% Else  %>
<h3>Click link-&gt; <a href="users_add_permissions.asp?perm=<%= empID %>">to Make an Administrator</a></h3>
<% End If %>
<form action="users_add_permissions.asp" method="post">
<input type="hidden" name="empID" value="<%= empID %>">
<h3>Administration Menus</h3>
<p>
<%
adminInt=0
On Error Resume Next
rsa.MoveFirst
do while Not rsa.eof
adminInt=adminInt+1
%>
<input type="checkbox" name="admin<%= adminInt %>" value="<%= rsa("amMenuFile") %>" <% if instr(stComp,"|"&rsa("amMenuFile")) then Response.Write"checked"  %>> <%= rsa("amMenuName") %><br>
<%
rsa.MoveNext
loop
rsa.close: set rsa=nothing
%>
</p>
<h3>Website Main Menus</h3>
<p>
<%
mainInt=0
On Error Resume Next
rsmm.MoveFirst
do while Not rsmm.eof
mainInt=mainInt+1
%>
<input type="checkbox" name="main<%= mainInt %>" value="<%= rsmm("mmenuDefaultPage") %>"<% if instr(stComp,"|"&rsmm("mmenuDefaultPage")) then Response.Write"checked"  %>> <%= rsmm("mmenuTitle") %><br>
<%
rsmm.MoveNext
loop
rsmm.close: set rsmm=nothing
%>
</p>
<h3>Website Sub menus</h3>
<p>
<%
subInt=0
On Error Resume Next
rsm.MoveFirst
do while Not rsm.eof
subInt=subInt+1
%>
<input type="checkbox" name="sub<%= subInt %>" value="<%= rsm("menuFileName") %>" <% if instr(stComp,"|"&rsm("menuFileName")) then Response.Write"checked"  %>> <%= rsm("menuPageName") %><br>
<%
rsm.MoveNext
loop
rsm.close: set rsm=nothing
%>
</p>
<input type="submit" value="Add Permissions">
</form>
<% End If %>
</body>
</html>
