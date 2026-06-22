<%  
myScript=Request.QueryString("script")
myDel=Request.QueryString("del")
%>

<html>
<!--
querystring powered validation code
Needed strings:
script:  This is the name of the file that will actually do the deletion. Do not include the .asp extension
del:  This is the index key from the database
Session("DeleteMessage"): This is warning message the is written on the delete page.
-->
<head>
<title>Confirm Delete</title><link rel="STYLESHEET" type="text/css" href="style1.css"><link rel="STYLESHEET" type="text/css" href="style.css">
</head>
<body bgcolor="White">
<p class="warning"><b>Warning!!!</b><br><%= Session("DeleteMessage") %></p>
<p>
<a href="<%= myScript %>.asp?del=<%= myDel %>">Click Here </a>if you wish to delete this item.
</p>
<p><a href="<%= Request.ServerVariables("HTTP_REFERER") %>">Do Not Delete.</a></p>
</body>
</html>


