<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%
	'check if page is accessible
	IF Request.Form("menuPageName")="" THEN
	Response.Write"You do not have access to this resource <br>"
	ELSE
	
	'declare form variables
	Function StripSymbols(sString)
	Dim nCharPos, sOut, nChar
	nCharPos = 1
	sOut = ""
	For nCharPos = 1 To Len(sString)
			nChar = Asc(Lcase(Mid(sString, nCharPos, 1)))
			If ((nChar > 47 And nChar < 58) or (nChar > 96 And nChar < 123) or nChar = 32) Then
				sOut = sOut & Mid(sString, nCharPos, 1)
			End If
		Next
		StripSymbols = sOut
	End Function
	menuPageName=replace(Request.Form("menuPageName"),"'","''")
	session("menuPageName")=menuPageName
	menuCategory=replace(Request.Form("menuCategory"),"'","''")
	session("menuCategory")=menuCategory
	menuFileName=Replace(Lcase(StripSymbols(menuPageName))&".asp"," ","_")
	pageContent=Request.Form("txtContent")
	
	'call menu database for sort order and declare sort order
	if menuCategory<>"addnew" then
    sql = "SELECT * FROM tblMenu Where menuCategory="&menuCategory&" ORDER BY MenuOrder DESC"
    Set rs = Server.CreateObject("ADODB.Recordset")
    rs.Open sql, conn, 3, 3
	if rs.eof then
	menuOrder=1
	else
	menuOrder=rs("menuOrder")+1
	end if
	
	end if
	' check for existance of file
		existingFile=Server.MapPath("../")&"\"&menuFileName
		Set MyFileObject=Server.CreateObject("Scripting.FileSystemObject")
		if MyFileObject.FileExists(existingFile) then
		menuFileName=menuCategory&"_"&menuFileName
		end if
	menuFileName=Replace(menuFileName,"'","")
	 'create page and add to file system.
	 'get header and footer from database and declare file variable
	 sql3="SELECT * FROM tblHeaderFooter"
	 SET rs3=conn.execute(sql3)
	 pageHeader=rs3("mcHeader")
	 pageFooter=rs3("mcFooter")
	 rs3.close
	 set rs3=nothing
	 filePathName=Server.MapPath("../")&"\"&menuFileName
	 newASPFile=pageHeader & vbCrLf & vbCrLf & pageContent & vbCrLf & vbCrLf & pageFooter
	 	if MyFileObject.FileExists(filePathName) then
		Response.Redirect"admin_error.asp?msg="&"File cannot be created because it would create a duplicate file on the server."
		else
		Set CreateNewFile=MyFileObject.CreateTextFile(filePathName)
		CreateNewFile.WriteLine(newASPFile)
		CreateNewFile.close
	    
	'add page to database
	if menuCategory="addnew" then
	session("menuFileName")=menuFileName
	response.redirect"admin_new_page_add.asp"
	else
	 sql2= "Insert into tblMenu (menuCategory,menuPageName,menuFileName,menuOrder)"
	 sql2= sql2 & "VALUES ('"&menuCategory&"','"&menuPageName&"','"&menuFileName&"','"&menuOrder&"')"
	 conn.execute(sql2)
	 end if
	end if
	rs.close
	set rs=nothing
	conn.close
	response.Write Request.Form("pageContent")
	Response.Redirect"index.asp"
	END IF
%>

