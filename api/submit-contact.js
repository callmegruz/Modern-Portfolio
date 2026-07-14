export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

  if (!accessKey || accessKey.trim() === "" || accessKey === "YOUR_ACCESS_KEY_HERE") {
    return res.status(500).json({ 
      success: false, 
      message: 'Server Configuration Error: WEB3FORMS_ACCESS_KEY is not defined on the server.' 
    });
  }

  try {
    const payload = {
      access_key: accessKey,
      name,
      email,
      subject: subject || 'New Message from Portfolio',
      message,
      from_name: "Guru's Portfolio"
    };

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(response.status || 400).json({ 
        success: false, 
        message: data.message || 'Web3Forms API call failed' 
      });
    }
  } catch (error) {
    console.error('Error forwarding message to Web3Forms:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while sending message.' });
  }
}
