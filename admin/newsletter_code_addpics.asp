<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%  
 'create an instance of the Upload control
Set objUpload = Server.CreateObject ("Dundas.Upload.2")

objUpload.SaveToMemory

'use a For Each loop and check to see if the uploaded file is an
'   executable (utilizing VBScript's InStr method), if it is delete it from disk.
'but first we will output the name of the file input box(es) responsible for uploads
pic=0
   For Each objUploadedFile in objUpload.Files
   pic=pic+1
   desc="description"&pic
    If InStr(1,objUploadedFile.ContentType,"image") Then
	   objUploadedFile.SaveAs server.mappath("../images") &"\nlpic_"& session("nlID")&objUpload.GetFileName(objUploadedFile.OriginalPath)
	   sql="INSERT INTO tblNewsletterPics (nlPicID,nlPicFilename,nlPicDescription)"
	   sql = sql & "VALUES ('"&session("nlID")&"','nlpic_"&session("nlID")&objUpload.GetFileName(objUploadedFile.OriginalPath)&"','"&objUpload.Form(desc)&"') "
	   conn.execute(sql)
	  else
	  objUploadedFile.Delete
      End If
   Next
'Release resources
Set objUpload = Nothing
Set conn = nothing
response.redirect"newsletter_index.asp"
%>