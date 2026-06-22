
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
<% 
' insert this code snippet in between your <head> and </head> tags
    cst = "Driver={Microsoft Access Driver (*.mdb)};DBQ=" & server.mappath("database\meta.mdb") 
    set conm = server.createobject("adodb.connection") 
    conm.open cst
page=Request.ServerVariables("SCRIPT_NAME")
page=right(page,len(page)-instrrev(page,"/"))
set ms=conm.execute("SELECT * FROM tblMeta WHERE metaPageName='"&page&"'")
if ms.eof then
set ms=conm.execute("SELECT * FROM tblMeta WHERE metaDefault='default'")
end if
if ms.eof then
'Write some absolute default tags so that the site does not go down if the database goes bad
Response.Write"<title>Northern Wireless</title>"
Response.Write"<meta name=""keywords"" content=""wireless, ISP, internet"">"
Response.Write"<meta name=""description"" content=""Wireless solutions for the real world"">"
'End Absolute default tags
else
Response.Write"<title>"&ms("metaTitle")&"</title>"&vbCrLf
Response.Write"<meta http-equiv=""KEYWORDS"" content="""& ms("metaKeywords")&""">"&vbCrLf
Response.Write"<meta http-equiv=""DESCRIPTION"" content="""& ms("metaDescription")&""">"&vbCrLf
if len(ms("metaDate"))>1 then
Response.Write"<meta name=""date"" content="""& Replace(ms("metaDate"),"/","-")&""">"&vbCrLf
end if
end if
ms.close: set ms=nothing
conm.close: set conm=nothing
' end title and meta code snippet
%>
<link rel="STYLESHEET" type="text/css" href="style.css">

    <SCRIPT LANGUAGE="JavaScript">
      function animateMenu() {
        var el=event.srcElement;
        if ("A"==el.tagName) {
          // Initialize effect if none specified
          if (null==el.parentElement.effect) el.parentElement.effect = "highlight"
          // Swap effect with the class name.
          temp = el.parentElement.effect;
          el.parentElement.effect = el.parentElement.className;
          el.parentElement.className = temp;
        }
      }   
    </SCRIPT>
</head>
<body leftmargin=0 topmargin=0>

	
<table width="814" border="0" cellspacing="0" cellpadding="3">
<tr valign="top">
	<td width="203">
    <img src="images/bm_logo.gif" width="184" height="92" alt="" border="0"></td>
	<td width="599">
    <img border="0" src="images/gates.gif" align="left" hspace="4" vspace="3"><p>&nbsp;</p>
    <p>If any one technology has emerged in the past few years that will be 
    explosive in its impact, it's 802.11</td>
</tr>
<tr valign="top">
	<td width="203">
	<img src="images/blank.gif" width="150" height="3" alt="" border="0"><br>
	<!--#include file="ssi_menu.asp"-->
	</td>
	<td width="599"><img src="images/blank.gif" width="450" height="3" alt="" border="0"><br>
</table>
<p>&nbsp;</p>