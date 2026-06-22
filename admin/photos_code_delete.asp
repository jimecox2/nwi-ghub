<!--#include file="connection.asp"-->
<!--#include file="protected.asp"-->
<%
if instr(Request.Form("go"),"pictures") then
for each thing in Request.Form
 if thing<>"go" then
  conn.execute("UPDATE tblPhotos SET picOrder=1 WHERE picID="&Request.Form(thing)&";")
  end if
next
Response.Redirect "photos_admin_index.asp"
else
 %>
<p class="warning"><b>Warning!!!</b><br><%= Session("DeleteMessage") %></p>
<p><form action="photos_code_delete.asp" method="post">
<%
for each thing in Request.Form
 if thing<>"go" then
 %>
<input type="hidden" name="delete<%= Request.Form(thing) %>" value="<%= Request.Form(thing) %>">
<% 
end if
next
 %>
<input type="submit" name="de" value="Delete Now..."> &nbsp;<a href="<%= Request.ServerVariables("HTTP_REFERER") %>">Do Not Delete.</a>
</form>

<%
if instr(Request.Form("de"),"Delete") then
for each thing in Request.Form
 if thing<>"de" then
  conn.execute("UPDATE tblPhotos SET picCategory=0 WHERE picID="&Request.Form(thing)&";")
 end if 
next

conn.close
Response.Redirect "photos_admin_index.asp"
end if
end if

%>
