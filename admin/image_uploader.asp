<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Image Uploader</title><link rel="STYLESHEET" type="text/css" href="style.css">

</head>

<body>
<!--#include file="admin_menu.asp"-->

<p>
<%
if Request.QueryString("pic")=""then
' Set Folder Variable
folderName="\images"
' Create an instance of the FileSystemObject
Set MyFileObject=Server.CreateObject("Scripting.FileSystemObject")
' Create Folder Object
Set MyFolder=MyFileObject.GetFolder(Server.MapPath("../images"))
%>
<DIV STYLE="overflow: auto; width: 522px; height: 130; border-left: 1px silver solid; border-right: 1px silver solid; padding:4px; margin: 0px">
<table>
<% 
'Loop trough the files in the folder
FOR EACH thing in MyFolder.Files
if instr(thing.name,".gif") or instr(thing.name,".jpg") or instr(thing.name,".png") then
 %>

<tr bgcolor="WhiteSmoke">
	<td><img src="rte_ico_<%=right(thing.Name,3)%>.png" width="16" height="16" alt="" border="0"></td>
	<td nowrap><a target="picfrm" href="../images/<%=thing.Name%>"><%=thing.Name%></a></td>
	<td align=right nowrap><%=FormatNumber(thing.Size/1000,2)%>KB</td>
	<td nowrap><%=thing.DateCreated%></td> 
</tr>
<%
end if
NEXT
%>
</table>
</div>

<iframe frameborder="0" name="picfrm" id="picfrm" width="520" height="200" style="border-left: 1px silver solid;border-right: 1px silver solid;border-bottom: 1px silver solid;"></iframe>
<p><form action="image_uploader_form.asp" method="post">&nbsp;How many pictures do you wish to upload?<input type="text" name="picno" value="0" size="1" maxlength="1" class="picno"> (Enter 0 for no pictures)<br><input type="submit" value="Add pics" class="picbtn"></form></p>

<% End If %>
</p>


</body>
</html>
