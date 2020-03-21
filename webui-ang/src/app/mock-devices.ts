import { Networkdevice } from './networkdevice';

export const DEVICES: Networkdevice[] = [
    { hostname: "computer1", ipaddress: "192.168.12.12", online: true, ports : [22,80] },
    { hostname: "unknown", ipaddress: "192.168.12.13", online: true,  ports : [22,80]},
    { hostname: "computer3", ipaddress: "192.168.12.14", online: false,  ports : [22,80]},
    { hostname: "computer4", ipaddress: "192.168.10.250", online: true,  ports : [] },
]