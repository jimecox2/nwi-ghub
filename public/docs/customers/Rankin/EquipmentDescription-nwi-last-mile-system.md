I already have the extracted text from the earlier antiword conversion. Let me write it to a markdown file.

Here's the equipment description printed out as markdown in this session:

# Equipment Description

## Technical Summary

Our product is based upon the supply and integration of "off-the shelf" 802.11b equipment for base station and premise modem. We propose to implement proven solutions providing broadband to the end user via Proxim 802.11b technology. NWI has designed a complete wireless solution to distribute high-speed internet broadband to end users who may have a multitude of requirements.

Internet bandwidth will be distributed from the Satellite dish router to NWI 802.11b Access Point via Ethernet. A radio card in the AP is connected to a bi-directional amplifier. The amplifier boosts the transmission and receive range and negates the cable loss. An Omni antenna, connected to the amplifier, transmits and receives the radio waves in a 360 degree plane. The signal radiates outwards from the center of the antenna similar to a ripple effect caused by a stone dropped in a pond. New or existing communication towers, water towers, or roof tops can be used to mount our antennas and transmission equipment.

Residential and business end users will need an 802.11b customer premise radio (also known as a modem). Some businesses using video conferencing or other high consumption services will require a separate service using 802.11g modem equipment (not in the scope of this project). The end users modem unit with external antenna sends and receives signals to the access point and is connected directly to the client's computer Network Interface Card (NIC). These signals carry the internet feed between the end users computer to the satellite dish.

End user modem antennas are typically installed on the roof of the premise and are pointed at the AP omni antenna. An RF cable with special RF connectors is used to link the antenna to the modem. The radio is then configured via a web browser. The radio can be remotely accessed to view its settings or reboot it.

## Authentication

Each user's modem will transparently authenticate to the access point via a unique Ethernet MAC address on the AP allowing access to network resources. Administrators are required to manually enter the MAC address of authorized users into the AP. If the AP recognizes the MAC address then the user is allowed access to the internet.

## Bandwidth Control, Base Unit

Wireless LANs are a shared medium, which means that certain users or applications could "hog" all of the bandwidth and bring the network to a crawl. Our base unit and advanced unit provides for Bandwidth Management for incoming and outgoing traffic - allowing each user to be allocated an appropriate amount of the available bandwidth. Local traffic vs internet bound traffic is also managed to allow local community traffic to travel at higher speeds than internet bound traffic. Service levels (bandwidth or speed in kbps) will be controlled by a bandwidth control gateway (BCG). The BCG recognizes a range of IP's for different service levels. The IP number assigned to the client computer is a static assigned IP number.

The following IP ranges determine the plan speed:

- 50k light - 100 IP numbers
- 100k medium - 100 IP numbers
- 150k max. - 34 IP numbers
- The first 25 IP's are for admin and are wide open.

## RADIUS/Bandwidth Control Gateway (BCG) Integration - Advanced Option

The RADIUS server is a Windows 2003 computer which is seamlessly integrated with the BCG and the access point. Also included is SQL server database engine which is used to provide usage reports to the users. The advantages of choosing this option are as follows.

### Centralized Bandwidth Management

The advanced unit provides for Bandwidth Management for incoming and outgoing traffic similar to the base unit but with a central database located on the Windows 2003 server for maintaining the user database. IP numbers can be dynamically assigned, reducing network administration tasks. The central database can be used to change bandwidth speeds to without the need to access the BCG, simplifying administration. A user can be denied access to the network using Windows 2003 permissions.

### Centralized Authentication

The advanced model utilizes username/password combinations with RADIUS and Windows 2000/2003 Active Directory servers. Users can authenticate to the WLAN seamlessly with NWI's unique process transparently allowing appropriate access for the WLAN user. Bandwidth management and Authentication management is performed at a single computer.

### Open Systems Interoperability

NWI's approach is designed to support wireless devices and access points from all major vendors, and support for current and future 802.11 versions. This open systems approach means you won't be locked into a specific technology or vendor, thereby ensuring interoperability with your current and future WLAN infrastructure. Since NWI's Bandwidth Control Gateways require no additional or proprietary client software, they dramatically simplify implementation and ensure interoperability. This reduces the time and complexity associated with installing configuring and supporting additional software on each and every mobile device and Access Point in your WLAN deployments. This also ensures support for the emerging mobile devices.

## Security

Security of traffic is as secure as the internet its self as this is an internet network. Authorized access to the network as mentioned above is controlled at the access point. It is customary that end users be responsible for the security of its internet traffic. Our network supports all the standard internet security protocols such as https, VPN PKI etc.

## IP Addressing

Our product is interoperable with almost any network device that is designed for the TCP/IP (Internet protocol). Public IP addressing will be controlled by RAM Telecom and private IP addressing shall be controlled at the BCG by NWI.

## Technical Requirements

All equipment is supplied by "off the shelf" vendors and complies to Canadian Standards. See data sheets on each product.

Remote maintenance and testing capability is standard with all equipment supplied. See product documentation.

The network needs a part time network administrator to continually diagnose performance and security. Many tools are available on the market today. Wireless links are supplied with diagnostic tools as part of the product.

Speeds on the network can range from 0 Mbps to 500 kbps and shall be controlled by the BCG.

Each modem is built to Ethernet standards and is shipped with a unique Media Access Control address (MAC Address). These addresses are controlled at the manufacturing level and need to be managed in the Access Point.

Blockage or congestion factors are prevalent when a network or a segment of the network is overloaded. It is impossible to predict how busy a network can get as it is dependent upon the amount of users and what the users are doing. A ratio of 50 to 1 per 500kbps is normal.

## Compatibility

The proposed product is compatible with Ethernet/TCP/IP devices such as PC and Mac network cards. The physical interface is standard networking cabling with RJ-45 connectors over CAT5 wire. Ethernet/TCP/IP networks are supported. IPX/SPX Protocol (Netware) is not supported. Most LAN's today are TCP/IP and are simple to connect to our network. Where Netware LAN's exist, there are products available to connect them to our network very easily.