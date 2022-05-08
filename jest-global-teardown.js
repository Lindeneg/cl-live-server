const { exec } = require('child_process');

module.exports = () => {
    if (process.platform !== 'win32') {
        exec('pkill --signal SIGINT cl-live-server-test-process');
    }
};
