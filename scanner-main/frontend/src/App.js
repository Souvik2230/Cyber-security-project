import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';
import { Container, TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography, Box, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import { checkConnectivity } from './utils/checkConnectivity';

function App() {
  const [ipRange, setIpRange] = useState('');
  const [scanType, setScanType] = useState('discovery');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [showRAW, setShowRAW] = useState(false);
  const [verbose, setVerbose] = useState(false);
  const [customParams, setCustomParams] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      const connectivity = await checkConnectivity();
      setIsConnected(connectivity);
    }, 5000); // Check connectivity every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleScan = async () => {
    setLoading(true);
    try {
      const response = await axios.post('api/scan-network', {
        ip_range: ipRange,
        scan_type: scanType,
        custom_params: scanType === 'custom' ? customParams : '',
        verbose 
      });
      setScanResult(response.data);
    } catch (error) {
      console.error('Error scanning network:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (ports) => (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #ddd' }}>
          <th style={{ padding: '8px', textAlign: 'left' }}>Port</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>State</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>Service</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>Product</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>Version</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>Extra Info</th>
        </tr>
      </thead>
      <tbody>
        {ports.map((port) => (
          <tr key={port.port} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: '8px' }}>{port.port}</td>
            <td style={{ padding: '8px' }}>{port.state}</td>
            <td style={{ padding: '8px' }}>{port.name}</td>
            <td style={{ padding: '8px' }}>{port.product}</td>
            <td style={{ padding: '8px' }}>{port.version}</td>
            <td style={{ padding: '8px' }}>{port.extrainfo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const toggleJson = () => {
    setShowJson(!showJson);
  };

  const toggleRAW = () => {
    setShowRAW(!showRAW);
  };

  const renderFormattedJSON = (data) => (
    <div>
      <h2>Scan Results (Table Format):</h2>
      {data.hosts.map((host) => (
        <div key={host.ip}>
          <h3>Host: {host.ip}</h3>
          <p>State: {host.state}</p>
          {host.vendor && (
            <div>
              <h4>Vendor:</h4>
              <ul>
                {Object.entries(host.vendor).map(([mac, vendor]) => (
                  <li key={mac}>
                    {mac}: {vendor}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {host.osmatches && host.osmatches.length > 0 && (
            <div>
              <h4>OS Matches:</h4>
              <ul>
                {host.osmatches.map((osmatch, index) => (
                  <li key={index}>
                    {osmatch.name} (Accuracy: {osmatch.accuracy}%)
                  </li>
                ))}
              </ul>
            </div>
          )}
          {host.protocols.map((protocol) => (
            <div key={protocol.protocol}>
              <h4>Protocol: {protocol.protocol}</h4>
              {renderTable(protocol.ports)}
            </div>
          ))}
        </div>
      ))}
      <button onClick={toggleJson} style={{ marginTop: '10px' }}>
        {showJson ? 'Hide JSON' : 'Show JSON'}
      </button>
      {showJson && (
        <div>
          <h2>Original JSON:</h2>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      <div>
        <button onClick={toggleRAW} style={{ marginTop: '10px' }}>
          {showRAW ? 'Hide Raw' : 'Show RAW'}
        </button>
        {showRAW && (
          <div>
            <h2>Raw Nmap Output:</h2>
            <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
              {data.raw_output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Network Scanner
        </Typography>
        {!isConnected && (
          <div style={{ color: 'red' }}>
            Connection to the backend is lost. Please check your network.
          </div>
        )}
        <FormControl fullWidth sx={{ my: 2 }}>
          <TextField
            label="Enter IP range (e.g., 192.168.1.0/24)"
            value={ipRange}
            onChange={(e) => setIpRange(e.target.value)}
            variant="outlined"
          />
        </FormControl>
        <FormControl fullWidth sx={{ my: 2 }}>
          <InputLabel id="scan-type-label">Chose Scan Type</InputLabel>
          <Select
            label="Chose Scan Type"
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
            variant="outlined"
          >
            <MenuItem value="discovery">Discovery Scan</MenuItem>
            <MenuItem value="arp_ping">ARP Ping Scan</MenuItem>
            <MenuItem value="common_ports">Most Common Ports</MenuItem>
            <MenuItem value="all_ports">All Ports (TCP and UDP)</MenuItem>
            <MenuItem value="custom">Custom Scan</MenuItem>
          </Select>
        </FormControl>
        {scanType === 'custom' && (
          <FormControl fullWidth sx={{ my: 2 }}>
            <TextField
              label="Enter Custom Nmap Parameters"
              value={customParams}
              onChange={(e) => setCustomParams(e.target.value)}
              variant="outlined"
            />
          </FormControl>
        )}
        <FormControlLabel
          control={
            <Checkbox
              checked={verbose}
              onChange={(e) => setVerbose(e.target.checked)}
              name="verbose"
              color="primary"
            />
          }
          label="Verbose Output"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleScan}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Scan'}
        </Button>
        {scanResult && (
          <Box sx={{ my: 4, textAlign: 'left' }}>
            <Typography variant="h5" gutterBottom>
              Scan Results:
            </Typography>
            <pre>{renderFormattedJSON(scanResult)}</pre>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App;
