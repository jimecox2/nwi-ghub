<!--#include file="ssi_header.asp"-->
<!-- Start HTML Content -->
<% 
' connection to database is coming from the menu includes file Remove comment to use code below
    'cst = "Driver={Microsoft Access Driver (*.mdb)};DBQ=" & server.mappath("database\components.mdb") 
    'set conn = server.createobject("adodb.connection") 
    'conn.open cst
Function RemoveHTMLTags(sIn)
	Dim nCharPos, sOut, bInTag, sChar
	sOut = ""
	bInTag = False
	For nCharPos = 1 To Len(sIn)
		sChar = Mid(sIn, nCharPos, 1)
		If sChar = "<" Then
			bInTag = True
		End If
		If Not bInTag Then sOut = sOut & sChar
		If sChar = ">" Then
			bInTag = False
		End If
	Next
	RemoveHTMLTags = sOut
End Function

	sql2= "SELECT nlID,nlHeadline,nlText,nlDatePosted FROM tblNewsletter WHERE nlArchive='y' OR nlArchive='a' ORDER BY nlArchive, nlDatePosted DESC"
    Set rs2 = conn.execute(sql2)
%>

<h3>Newsletter Headlines...</h3>
<p>
<%

rs2.MoveFirst
do while Not rs2.eof
nlText=rs2("nlText")
%>
<p><strong><a href="newsletter.asp?hl=<%= rs2("nlID") %>"><%= rs2("nlHeadline") %></a></strong>&nbsp;<em>(<%= rs2("nlDatePosted") %>)</em><br>
<%= left(RemoveHTMLTags(nlText),instr(200,RemoveHTMLTags(nlText)," ")) %>... <br><a href="newsletter.asp?hl=<%= rs2("nlID") %>">Read More</a></p>
<%
rs2.MoveNext
loop
rs2.close
set rs2=nothing
%>
</p>
<!-- End HTML Content -->
<!--#include file="ssi_footer.asp"-->

