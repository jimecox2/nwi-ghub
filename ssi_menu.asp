
<%
'get datasource using DSNless connection
    cst = "Driver={Microsoft Access Driver (*.mdb)};DBQ=" & server.mappath("database\components.mdb") 
    set conn = server.createobject("adodb.connection") 
    conn.open cst
    sqlm = "SELECT mmenuCategoryID,mmenuTitle,mmenuDefaultPage,mmenuOrder FROM tblMenuMain ORDER BY mmenuOrder"
    Set rsm = Server.CreateObject("ADODB.Recordset")
    rsm.Open sqlm, conn, 3, 3
'Find the state
 SCRIPT_NAME=mid(Request.ServerVariables("SCRIPT_NAME"),instrrev(Request.ServerVariables("SCRIPT_NAME"),"/")+1)
  set snm=conn.execute("SELECT mmenuCategoryID FROM tblMenuMain WHERE mmenuDefaultPage='"&SCRIPT_NAME&"'")
  if snm.eof then
   set sn=conn.execute("SELECT menuCategory FROM tblMenu WHERE menuFileName='"&SCRIPT_NAME&"'")
   if sn.eof then 
    myBtn=0
    else
    myBtn=sn("menuCategory")
    sn.close : set sn=nothing
   end if
else
 myBtn=snm("mmenuCategoryID")
 snm.close : set sn=nothing
end if

'if a link has been pressed then get the sub links
		if myBtn<>0 then
		myLinks=""
		sqlm2 = "SELECT menuID,menuCategory,menuPageName,menuFileName,menuOrder FROM tblMenu WHERE menuCategory="&myBtn&" ORDER BY menuOrder "
		set rsm2=conn.execute(sqlm2)
		On Error Resume Next
		 rsm2.MoveFirst
		 do while Not rsm2.eof
		  myLinks=myLinks&"<tr bgcolor=""#99ccff""><td><a href="""&rsm2("menuFileName")&""" class=""menulink"" class=&{ns4class};>"&rsm2("menuPageName")&"</a></td></tr>"&vbCrLf
		 rsm2.MoveNext
		 loop
		rsm2.close
		set rsm2=nothing
		end if

	on error resume next
%>
<script>
/*
CSS Menu highlight- By Marc Boussard (marc.boussard@syntegra.fr)
Modified by DD for NS4 compatibility
Visit http://www.dynamicdrive.com for this script
*/

var ns4class=''
</script>

<table width="150" border="1" cellspacing="0" cellpadding="0" bordercolor="#990000" style="border-collapse: collapse;">
<%
On Error Resume Next
rsm.MoveFirst
do while Not rsm.eof
myLoc=rsm("mmenuCategoryID")
%>
<tr bgcolor="#0066cc"><td><a href="<%= rsm("mmenuDefaultPage") %>"  class="tmenulink" class=&{ns4class};><%= rsm("mmenuTitle") %></a></td></tr>
<% 
If cint(myBtn)=myLoc then 
 Response.Write myLinks 
end if
rsm.MoveNext
loop
rsm.close
set rsm=nothing
%>
</table>
