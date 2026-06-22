<!--#include file="ssi_header.asp"-->
<!-- Start HTML Content -->
<% 
' this page does not work if an article is not set to default in the admin site.  This is not a problem
' as long as your newsletter homepage is newsletter_headlines.asp

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

	sqlactive= "SELECT nlID,nlArchive FROM tblNewsletter WHERE nlArchive='a'"
    Set rsactive = conn.execute(sqlactive)
	if Request.QueryString("hl")=""THEN
	myActive=rsactive("nlID")
	else
	myActive=Request.QueryString("hl")
	end if
	rsactive.close
	set rsactive=nothing
	sql= "SELECT nlID,nlHeadline,nlText FROM tblNewsletter WHERE nlID="&myActive&";"
    Set rs = conn.execute(sql)
	sql2= "SELECT nlID,nlHeadline,nlText,nlDatePosted FROM tblNewsletter WHERE nlArchive='y' OR nlArchive='a' ORDER BY nlArchive, nlDatePosted DESC"
    Set rs2 = conn.execute(sql2)
	sqlp= "SELECT nlPicFilename,nlPicDescription FROM tblNewsletterPics WHERE nlPicID="&myActive&";"
	set rsp=conn.execute(sqlp)
%>
<h3><%= Replace(rs("nlHeadline"),chr(10),"&nbsp;<br>") %></h3>

<p>

<table>
<tr>
	<td rowspan="2"><%= rs("nlText") %></td>
	<td align="center" valign="top">
	<%
On Error Resume Next
rsp.MoveFirst
do while Not rsp.eof
%>
<p><a href="newsletter_pics.asp?article=<%= rs("nlID") %>&hl=<%= server.URLEncode(rs("nlHeadline")) %>">
<img src="images/<%= rsp("nlPicFilename") %>" alt="Click for larger image" width="100" border="0"><br>
<%= rsp("nlPicDescription") %></a>
</p>
<%
rsp.MoveNext
loop%>
	</td>
</tr>
</table>
</p>
<h3>More Headlines...</h3>
<p>
<%
On Error Resume Next
rs2.MoveFirst
do while Not rs2.eof
if rs2("nlID")<>rs("nlID") then
nlText=rs2("nlText")
%>
<p><strong><a href="newsletter.asp?hl=<%= rs2("nlID") %>"><%= rs2("nlHeadline") %></a></strong>&nbsp;<em>(<%= rs2("nlDatePosted") %>)</em><br>
<%= left(RemoveHTMLTags(nlText),instr(200,RemoveHTMLTags(nlText)," ")) %>... <a href="newsletter.asp?hl=<%= rs2("nlID") %>">Read More</a></p>
<%
end if
rs2.MoveNext
loop
rs.close
set rs=nothing
rs2.close
set rs2=nothing
rsp.close
set rsp=nothing
conn.close
set conn=nothing
%>
</p>
<!-- End HTML Content -->
<!--#include file="ssi_footer.asp"-->

