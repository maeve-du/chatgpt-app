import '../css/style.scss';

import bot from '../../assets/bot.svg';
import user from '../../assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// load AI's answers
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }

  }, 300);

}

// This function can be used to create a typing effect for a text on a web page,
// where the text appears to be typed out letter by letter with a small delay between each letter.
function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    // if the index is lower than text.length, that means the bot is still typing
    // if the bot is still typing, we can set the element.innerHtml plus and equal to the text.charAt(index)
    // this is going to get the character under a specific index in the text that in the text that AI  is going to return
    // and of cause we are going to increament that index 
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      // let text = "hello";
      //console.log(text.charAt(0)); // outputs "h"
      index++;
    } else {
      // else if we have reached the end of the text,
      // then we want to simplely clear the interval
      clearInterval(interval);

    }
  }, 20);
}

// we need to generate a unique ID for every single message to able to map over them
function generateUniqueId() {
  // in JS and in many other programing languages how you generate unique ID is by using the current time and date
  // that is always unique
  const timestamp = Date.now();

  // to make it even more random, we can get another random number
  const randomNumber = Math.random();

  // Hexadecimal (also known as hex) is a numeral system with a base of 16.
  // It uses 16 symbols (0-9 and A-F) to represent values
  // toString() 不带参数就是直接把number转换成sring
  // By default, toString() will return a string representation of the number in base 10 (i.e., decimal).
  // toString() also accepts an optional radix parameter，
  // which is used to specify the base of the number system you want to use to represent the number as a string
  /**
   let num = 255;
   let hexString = num.toString(16);
    console.log(hexString); // Output: "ff"
   */
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;

}


function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}" >
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  );
}


const handleSumbit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server : bot's response
  const response = await fetch('http://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }

};

form.addEventListener('submit', handleSumbit);

form.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    handleSumbit(e);
  }
});

