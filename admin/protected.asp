<% 	
empID=session("empID")
if empID=""then response.redirect"login.asp"
set rso=conn.execute("SELECT * FROM tblPermissions WHERE empID="&empID&";")
if rso.eof then response.redirect"login.asp?msg=You successfully logged in but you do not have permission to access any resources.  Contact your administrator."
pPage=rso("pPage")
rso.close: set rso=nothing
if pPage="all" then 
session("admin")="admin"
else
session("admin")="user"
end if
%>