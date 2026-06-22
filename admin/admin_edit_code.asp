<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%
'get header and footer from database and declare file variable
	 sql3="SELECT * FROM tblHeaderFooter"
	 SET rs3=conn.execute(sql3)
	 pageHeader=rs3("mcHeader")
	 pageFooter=rs3("mcFooter")
	 rs3.close
	 set rs3=nothing
	 menuPageName=Replace(Request.Form("menuPageName"),"'","''")
	 menuFileName=Request.Form("menuFileName")
	 filePathName=Server.MapPath("../")&"\"&menuFileName
	 pageContent=Request.Form("txtContent")
	 newASPFile=pageHeader & vbCrLf & vbCrLf & pageContent & vbCrLf & vbCrLf & pageFooter
	 Set MyFileObject=Server.CreateObject("Scripting.FileSystemObject")
	 Set CreateNewFile=MyFileObject.CreateTextFile(filePathName)
	 CreateNewFile.WriteLine(newASPFile)
	 CreateNewFile.close
	 conn.close
	 Response.Redirect"index.asp"
%>

