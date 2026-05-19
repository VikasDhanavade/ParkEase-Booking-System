import os from 'os';
const ipLookup = () => {
    const interfaces = Object.values(os.networkInterfaces());
    for (const iface of interfaces) {
        for (const alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return 'localhost';
};
console.log(ipLookup());
