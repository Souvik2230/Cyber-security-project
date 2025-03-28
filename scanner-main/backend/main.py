import nmap
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    ip_range: str
    scan_type: str
    verbose: bool = False
    custom_params: str = None
    
@app.get("/health-check")
async def health_check():
    return {"status": "ok"}

@app.post("/scan-network")
async def scan_network(scan_request: ScanRequest):
    ip_range = scan_request.ip_range
    scan_type = scan_request.scan_type
    verbose = scan_request.verbose
    custom_params = scan_request.custom_params
    logger.debug("Processing scan request")
    
    
    if not ip_range:
        raise HTTPException(status_code=400, detail="Invalid IP range")
    

    nm = nmap.PortScanner()
    logger.debug("Scan type: %s",scan_type)
    arguments = '-F'

    if scan_type == "discovery":
        arguments='-sP'
    elif scan_type == "common_ports":
        arguments='-A -p 21,22,23,25,53,80,110,139,143,443,445,3389,8080,8443'
    elif scan_type == "all_ports":
        arguments='-A -p- -sU -sT'
    elif scan_type == 'arp_ping':
        arguments = '-sn'
    elif scan_type == "custom" and custom_params:
        arguments = custom_params
    else:
        raise HTTPException(status_code=400, detail="Invalid scan type or missing parameters")


    if verbose:
        arguments += ' -v'
    
    nm.scan(ip_range, arguments=arguments)
    raw_output = nm.get_nmap_last_output()
    logger.debug("Scan start: for %s type %s",scan_type,ip_range)
   
    if verbose:
        logger.debug(nm.get_nmap_last_output())

    hosts = []

    for host in nm.all_hosts():
        host_info = {
            'ip': host,
            'hostname': nm[host].hostname(),
            'state': nm[host].state(),
            'protocols': [],
            "osmatches": []
        }
        if 'addresses' in nm[host] and 'mac' in nm[host]['addresses']:
                host_info["mac"] = nm[host]['addresses']['mac']
        if 'vendor' in nm[host]:
                host_info["vendor"] = nm[host]['vendor']
        
        for proto in nm[host].all_protocols():
            ports = []
            for port in nm[host][proto].keys():
                port_info = {
                    'port': port,
                    'state': nm[host][proto][port]['state'],
                    'name': nm[host][proto][port].get('name', ''),
                    'product': nm[host][proto][port].get('product', ''),
                    'version': nm[host][proto][port].get('version', ''),
                    'extrainfo': nm[host][proto][port].get('extrainfo', ''),
                }
                ports.append(port_info)
            host_info['protocols'].append({'protocol': proto, 'ports': ports})

            if 'osmatch' in nm[host]:
                for os in nm[host]['osmatch']:
                    host_info["osmatches"].append({
                        "name": os['name'],
                        "accuracy": os['accuracy']
                    })
        
        hosts.append(host_info)
    
    logger.debug("Scan finished: for %s type %s",scan_type,ip_range)
    #hosts = [(x, nm[x]['status']['state'], nm[x].all_protocols()) for x in nm.all_hosts()]
    logger.debug("Raw Data returned %s",raw_output)
    return {"message": f"Network scan completed for range: {ip_range}", "hosts": hosts, "raw_output" :raw_output}

# Add more routes as needed
