<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->


<%
'most control methods throw an exception if an error occurs so we will use an On Error
' Resume Next statement for error trapping purposes
On Error Resume Next

'create an instance of the Upload control
Set objUpload = Server.CreateObject("Dundas.Upload.2")

'retrieve the first NextFile object, which contains header data only for
' the first file uploaded by user. Note that the Form collection will be
' populated with all form data which occurs up to the first populated
' file input box (which results in this first NextFile object)
Set objNextFile = objUpload.GetNextFile
'check to see if method call was successful using VBScript's Err object, if 
' an error occurred we will redirect user to a fictitious error page
If Err.Number <> 0 Then Response.Redirect "Error.asp"

'we will retrieve NextFile objects until there are no more uploaded files
' to process (each NextFile object corresponds to a populated file input box)
'if the file is not an executable we will save the uploaded file to memory, if
' it is an executable then we will not save it at all (by just calling GetNextFile again)
Do Until objNextFile Is Nothing

'NOTE: you can retrieve any form data here as long as it occurs in the html POST form
' BEFORE the populated file input box which corresponds to the current NextFile object
For Each objFormItem In objUpload.Form
 folder = objFormItem.Value
 if folder="root" then
 mypath = server.mappath("../")
 else
 mypath = server.mappath("../"&folder)
 end if
Next

'now save file if not an *.exe, and for demonstration purposes we will output 
' the name of the file input box from which the uploaded file originated
If InStr(1,objNextFile.ContentType,"octet-stream",1) = 0 Then
objNextFile.SaveToMemory
   For Each objUploadedFile in objUpload.Files
    If InStr(1,objUploadedFile.ContentType,"octet-stream") Then
		objUploadedFile.Delete
	else
		if objUpload.FileExists(mypath &"\"&objUpload.GetFileName(objUploadedFile.OriginalPath)) then
	     objUploadedFile.SaveAs server.mappath("../") &"\temp\"&objUpload.GetFileName(objUploadedFile.OriginalPath)
		 fileMessage = "File Exists... File has been loaded into the temporary folder"
		else
	    objUploadedFile.SaveAs mypath &"\"&objUpload.GetFileName(objUploadedFile.OriginalPath)
		menuFileName = objUpload.GetFileName(objUploadedFile.OriginalPath)
		end if
	End If
   Next

End If

'call NextFile again, to retrieve the header data for the next uploaded file
' once again it should be noted that this will populate the Form collection
' with all data up to the corresponding populated file input box
Set objNextFile = objUpload.GetNextFile 
Loop 

'release resources
Set objUpload = Nothing
Response.Redirect"index.asp"
%>
