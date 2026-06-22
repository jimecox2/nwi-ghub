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
if Request.Form("empFirstName")<>"" then

Function IsEmail(sCheckEmail)
    Dim sEmail, nAtLoc
    IsEmail = True
    sEmail = Trim(sCheckEmail)
    nAtLoc = InStr(1, sEmail, "@") 'Location of "@"

    If Not (nAtLoc > 1 And (InStrRev(sEmail, ".") > nAtLoc + 1)) Then
        '"@" must exist, and last "." in string must follow the "@"
        IsEmail = False
    ElseIf InStr(nAtLoc + 1, sEmail, "@") > nAtLoc Then
        'String can't have more than one "@"
        IsEmail = False
    ElseIf Mid(sEmail, nAtLoc + 1, 1) = "." Then
        'String can't have "." immediately following "@"
        IsEmail = False
    ElseIf InStr(1, Right(sEmail, 2), ".") > 0 Then
        'String must have at least a two-character top-level domain.
        IsEmail = False
    End If
End Function


Function IsValidLoginFormat(sString)
	Dim nChar, i
	IsValidLoginFormat = True
	'Login must be between 8 and 12 characters long. Adjust to your needs.
	If (Len(sString) >= 4) And (Len(sString) <= 12) Then
		For i = 1 To Len(sString)
			nChar = Asc(LCase(Mid(sString, i, 1)))
			If not ((nChar > 47 And nChar < 58) or (nChar > 96 And nChar < 123)) Then
				IsValidLoginFormat = False
				Exit For
			End If
		Next
	Else
		IsValidLoginFormat = False
	End If
End Function
empID=Request.Form("empID")
empFirstName=Replace(Request.Form("empFirstName"),"'","''")
empLastName=Replace(Request.Form("empLastName"),"'","''")
empUserName=Request.Form("empUserName")
empPassword=Request.Form("empPassword")
empPasswordc=Request.Form("empPasswordc")
myVal=""
if empPassword<>empPasswordc then myVal=myVal&"Your passwords do not match<br>"
if IsEmail(empUserName)<>true then myVal=myVal&"You must use a valid email address as the username<br>"
if IsValidLoginFormat(empPassword)<>true then myVal=myVal&"plaease choose an alpha-numeric password (no spaces or punctuation) at least 4 characters in length<br>"

if len(myVal)>0 then
Response.Write "<p>"&myVal&"</p>"
else

	sql = "UPDATE tblUsers SET empFirstName='"&empFirstName&"',empLastName='"&empLastName&"',empUserName='"&empUserName&"',empPassword='"&empPassword&"' WHERE empID="&empID&"; "
	conn.execute(sql)
end if
Response.Redirect"users_index.asp"
else
empID=Request.QueryString("id")
set rs=conn.execute("SELECT * FROM tblUsers WHERE empID="&empID&";")
%>


<h3>Add a user to Website Admin</h3>
<p>
<form action="users_edit.asp" method="post">
<input type="hidden" name="empID" value="<%= empID %>">
<input type="text" name="empFirstName" value="<%= rs("empFirstName") %>"> First Name<br>
<input type="text" name="empLastName" value="<%= rs("empLastName") %>"> Last Name<br>
<input type="text" name="empUserName" value="<%= rs("empUserName") %>"> User Name<br>
<input type="password" name="empPassword"> Password<br>
<input type="password" name="empPasswordc"> Confirm<br>
<input type="submit" value="Edit user"><br>
</form>
</p>


</body>
</html>
<% 
rs.close: set rs=nothing
End If %>