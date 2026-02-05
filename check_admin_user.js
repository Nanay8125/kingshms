
const http = require('http');

http.get('http://localhost:3001/api/staff?companyId=luxestay', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    const users = JSON.parse(data);
    const admin = users.find(u => u.email === 'admin@luxestay.com');
    console.log(JSON.stringify(admin, null, 2));
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});

