<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
	<title>Admin Index</title><link rel="STYLESHEET" type="text/css" href="style.css">
		<SCRIPT LANGUAGE="JavaScript" SRC="overlib_mini.js"></SCRIPT>
</head>

<body>
<!--#include file="admin_menu.asp"-->


 <DIV ID="overDiv" STYLE="position:absolute; visibility:hide; z-index:1;"></DIV>
<h3>Administer files</h3>
<p>
<ul>
	<li>Orphan files are files that are not linked into the menu structure. These are usually processing scripts, new files or files that are linked from existing pages.</li>
	<li>Temp files are created when an uploaded file has the same filename as an existing file.  Clicking on the temp file links will bring you to a page that presents processing options.</li>
</ul>
</p>
<div>
<%  
session("menuPageName")=""
session("menuFileName")=""
' Create an instance of the FileSystemObject
Set MyFileObject=Server.CreateObject("Scripting.FileSystemObject")
' Create Folder Object
Set MyFolder=MyFileObject.GetFolder(Server.MapPath("../"))
Set myTempFolder=MyFileObject.GetFolder(Server.MapPath("../temp"))
%>
<table>
<tr valign="top"><td>
<table border="1" cellspacing="1" cellpadding="1" style="border-collapse: collapse; font-size: 8pt;">
<caption>Orphan files</caption>
<% 
'Loop trough the files in the folder
FOR EACH thing in MyFolder.Files
if instr(thing.name,".asp") then
	sql = "SELECT * FROM tblMenu WHERE menuFileName='"&thing.name&"'"
    Set rs = conn.execute(sql)
if rs.eof then
Session("DeleteMessage")="<p style=""width: 300px; color: white; background-color: Red;"">Are you sure you want to permanently delete this file from the server.  THERE IS NO UNDO OR RECYCLE BIN</p>"
%>
<tr bgcolor="WhiteSmoke"><td>
<A HREF="javascript:void(0);" onClick="return overlib('<img src=\'icon_link.gif\' width=\'16\' height=\'16\' border=\'0\'><a href=\'admin_new_page_add.asp?file=<%= thing.name %>\'>Link this page to the menu</a><br><a href=\'admin_edit_form.asp?id=<%= thing.name %>\'><img src=\'icon_edit.gif\' width=\'16\' height=\'16\' border=\'0\'>Edit this Page</a> (<strong>Filename:</strong> <%= thing.name %>)<br><img src=\'icon_delete.gif\' width=\'16\' height=\'16\' border=\'0\'><a href=\'validate_delete.asp?script=admin_orphan_files_delete&del=<%= thing.name %>\'>Delete file</a>',CAPTION, 'Tools for File: &quot;<%= thing.name %>&quot;', BELOW, STICKY, WIDTH, 350,BGCOLOR,'#000000',CAPCOLOR,'#ffffff',FGCOLOR,'#c0c0c0')" ;">	
<%=thing.Name%></a>
</td></tr>

<% 
end if
end if
NEXT
rs.close
set rs=nothing
conn.close
set conn=nothing
%>
</table>
</td>
<td valign="top">
<table border="1" cellspacing="1" cellpadding="1" style="border-collapse: collapse; font-size: 8pt;">
<caption>Temp files</caption>
<% 
'Loop trough the files in the folder
FOR EACH thing in MyTempFolder.Files
%>
<tr bgcolor="WhiteSmoke">
<td>
<a href="upload_process_form.asp?file=<%=thing.Name%>"><%=thing.Name%></a>
</td>
<td><a href="validate_delete.asp?script=admin_orphan_files_delete&del=temp\<%= thing.name %>"><img src="icon_delete.gif" width="16" height="16" alt="Delete temp file" border="0"></a></td>
</tr>

<% 
NEXT
%>
</table>
</td>

</tr></table>
</div>



</body>
</html>
