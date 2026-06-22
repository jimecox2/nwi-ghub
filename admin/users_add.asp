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

	sql = "INSERT INTO tblUsers (empFirstName,empLastName,empUserName,empPassword) "
	sql = sql & "VALUES ('"&empFirstName&"','"&empLastName&"','"&empUserName&"','"&empPassword&"') "
	conn.execute(sql)

		sqli = "SELECT MAX(empID) FROM tblUsers"
		set rsi = conn.Execute(sqli)
		empID = rsi(0)
		rsi.close: set rsi = nothing
	
	Response.Redirect"users_add_permissions.asp?id="&empID
end if

else
%>


<h3>Add a user to Website Admin</h3>
<p>
<form action="users_add.asp" method="post">
<input type="text" name="empFirstName"> First Name<br>
<input type="text" name="empLastName"> Last Name<br>
<input type="text" name="empUserName"> User Name<br>
<input type="password" name="empPassword"> Password<br>
<input type="password" name="empPasswordc"> Confirm<br>
<input type="submit" value="Add user"><br>
</form>
</p>


</body>
</html>
<% End If %>