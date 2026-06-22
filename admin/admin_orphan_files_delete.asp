<!--#include file="protected.asp"-->
<% 
' Create an instance of the FileSystemObject
Set MyFileObject=Server.CreateObject("Scripting.FileSystemObject")
' Create Folder Object
Set MyFolder=MyFileObject.GetFolder(Server.MapPath("../"))
'Loop trough the files in the folder
MyFileObject.DeleteFile(MyFolder&"\"&Request.QueryString("del"))
response.redirect"admin_orphan_files.asp"
%>

