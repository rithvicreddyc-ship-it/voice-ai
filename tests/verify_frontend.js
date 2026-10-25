async function verify() {
  try {
    const res = await fetch('http://localhost:5000/');
    console.log('HTTP Status:', res.status);
    const text = await res.text();
    console.log('Includes title:', text.includes('InGPT — All-in-One Conversational AI Voice Assistant'));
    console.log('Includes root element:', text.includes('<div id="root"></div>'));
    console.log('Includes asset js script:', text.includes('.js'));
    console.log('Includes asset css stylesheet:', text.includes('.css'));
    console.log('Frontend HTML length:', text.length);
  } catch (err) {
    console.error('Frontend verification failed:', err.message);
  }
}

verify();
