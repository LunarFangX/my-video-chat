const net = require('net');
const { exec } = require('child_process');
const dns = require('dns');

// Check DNS resolution
function checkDNS() {
  return new Promise((resolve) => {
    dns.lookup('localhost', (err) => {
      if (err) {
        console.log('❌ DNS lookup failed for localhost');
        console.log('Try adding this to /etc/hosts if not present:');
        console.log('127.0.0.1 localhost');
        resolve(false);
      } else {
        console.log('✅ DNS resolution working for localhost');
        resolve(true);
      }
    });
  });
}

// Check if port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`❌ Port ${port} is already in use`);
          exec(`lsof -i :${port}`, (error, stdout) => {
            if (!error && stdout) {
              console.log('\nProcess using this port:');
              console.log(stdout);
            }
          });
        } else {
          console.log(`❌ Port ${port} error: ${err.message}`);
        }
        resolve(false);
      })
      .once('listening', () => {
        server.close();
        console.log(`✅ Port ${port} is available`);
        resolve(true);
      })
      .listen(port);
  });
}

// Check Node.js permissions
function checkNodePermissions() {
  exec('which node', (error, stdout) => {
    if (error) {
      console.log('❌ Node.js not found in PATH');
      return;
    }
    console.log(`✅ Node.js found at: ${stdout.trim()}`);
    
    // Check if Node has network permissions
    exec('codesign -d --entitlements :- $(which node)', (error, stdout) => {
      if (error) {
        console.log('ℹ️  Could not verify Node.js network permissions');
      } else {
        console.log('✅ Node.js permissions verified');
      }
    });
  });
}

// Run all checks
async function runDiagnostics() {
  console.log('🔍 Running comprehensive system checks...\n');
  
  // Check Node.js
  checkNodePermissions();
  
  // Check DNS
  await checkDNS();
  
  // Check ports
  await checkPort(3000);
  
  // Check firewall status
  exec('sudo -n /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null', (error, stdout) => {
    if (!error) {
      console.log('\nFirewall Status:', stdout.includes('enabled') ? '🔒 Enabled' : '🔓 Disabled');
    }
  });
  
  // Check network interfaces
  exec('ifconfig | grep inet', (error, stdout) => {
    if (!error) {
      console.log('\nNetwork Interfaces:');
      console.log(stdout);
    }
  });
}

runDiagnostics();