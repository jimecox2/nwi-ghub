<%
    cst = "Driver={Microsoft Access Driver (*.mdb)};DBQ=" & server.mappath("..\database\components.mdb") 
    set conn = server.createobject("adodb.connection") 
    conn.open cst
%>
