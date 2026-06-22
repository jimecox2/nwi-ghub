<%
conn.close : SET conn=nothing
    cst = "Driver={Microsoft Access Driver (*.mdb)};DBQ=" & server.mappath("..\database\meta.mdb") 
    set conn = server.createobject("adodb.connection") 
    conn.open cst
%>