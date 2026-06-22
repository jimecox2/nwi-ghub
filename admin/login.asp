<!--#include file="connection.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Login to admin site</title><link rel="STYLESHEET" type="text/css" href="style.css">
</head>

<body bgcolor="#FFFFFF">
<%  
if Request.Form("username")<>"" then

username = Request.Form("username") 
password = Request.Form("password") 
if username="" then response.redirect"login.asp"
sql="SELECT * FROM tblUsers WHERE empUserName='"&Request.Form("username")&"'"
SET rs=conn.Execute(sql)
if  rs.eof Then 
response.redirect"login.asp?msg=Sorry, no matching username exists&user="&username
response.End 
End if 
if rs("empPassword") <> password Then 
response.redirect"login.asp?msg=Sorry, wrong password&user="&username
response.End 
End if 
Session("username")=username 
Session("emp")=rs("empFirstName") & " " & rs("empLastName")
empID=rs("empID")
Session("empID")=empID
rs.close
Response.Redirect"index.asp"
else

%>
<table width="450" align="center">
<tr>
	<td>

 <h3>Login to admin site</h3>
 
<p style="color:red;"> <%= Request.QueryString("msg") %></p>
 <p>
<form action="login.asp" method="post">
<input type="text" name="username"> Username (email address)<br>
<input type="password" name="password"> Password<br>
<input type="submit" value="Login">
</form>
 </p>
 </td>
</tr>
<tr>
	<td><p>&nbsp;</p>
	<p><form action="users_password_request.asp" method="post">
	<em>Forgot your password?  Enter your email address below and press submit.  your password will be sent to you.</em><br>
	<input type="text" name="username"><input type="submit" value="Submit">
	</form></p>
	</td>
</tr>
</table>
 <% End If %>
</body>
</html>
