import axios from 'axios';

const message = "Hi, I'm Bob, and I live in SF.";

axios.post('http://127.0.0.1:5000/ask', {
  message: message
})
.then(response => {
  console.log('Response from Python Agent:', response.data.response);
})
.catch(error => {
  console.error('Error:', error);
});
