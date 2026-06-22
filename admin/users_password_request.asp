<!--#include file="connection.asp"-->
<%  
username=Request.Form("username")
if username="" then response.redirect"login.asp"
sql="SELECT * FROM tblUsers WHERE empUserName='"&Request.Form("username")&"'"
SET rs=conn.Execute(sql)
if  rs.eof Then 
response.redirect "login.asp?msg=Your email address <strong>("&username&")</strong> is not in the user database.  Please try again or contact your administrator."
else
Dim myMail 
Set myMail = CreateObject("CDONTS.NewMail") 
 
myMail.From = "webmaster@superiorwindenergy.com"
myMail.To = username
myMail.Subject = "Adminstrator response" 
myMail.Body = "Your password for accessing the administration website is: " & rs("empPassword")
myMail.Send 

myBody="Your password is: "&rs("empPassword")
End if 
rs.close: set rs=nothing
conn.close

response.redirect "login.asp?msg=Your password has been sent to the following address: <strong>("&username&")</strong>"

%>
