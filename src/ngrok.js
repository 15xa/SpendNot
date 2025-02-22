import ngrok from 'ngrok'

const FRONTEND_PORT = 5173;  
const BACKEND_PORT = 5000;   

async function startNgrok() {
    try {
        const frontendUrl = await ngrok.connect({
            addr: FRONTEND_PORT,
            proto: 'http'
        });
        console.log('\n=== Frontend Access ===');
        console.log('Local:', `http://localhost:${FRONTEND_PORT}`);
        console.log('Public:', frontendUrl);

        const backendUrl = await ngrok.connect({
            addr: BACKEND_PORT,
            proto: 'http'
        });
        console.log('\n=== Backend Access ===');
        console.log('Local:', `http://localhost:${BACKEND_PORT}`);
        console.log('Public:', backendUrl);

        console.log('\n=== Instructions ===');
        console.log('1. Update your React app API calls to use this backend URL:', backendUrl);
        console.log('2. Access your React app on your phone using:', frontendUrl);
        console.log('\nPress Ctrl+C to stop the tunnels\n');

    } catch (error) {
        console.error('Error starting ngrok:', error);
        process.exit(1);
    }
}

startNgrok();