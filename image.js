import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import './style.css';

let API_KEY = 'AIzaSyDvUG2JmYIHC_EOIV_qxjccoejP-fMaqPk';
let form = document.querySelector('form');
let output = document.querySelector('.output');
let file = document.querySelector('#file');
let base64String

document.querySelector('#file').addEventListener('change', function(event) {
  const file = event.target.files[0]; // Get the selected file

  if (file) {
      const reader = new FileReader();

      // Define the onload event for the FileReader
      reader.onload = function(e) {
          base64String = e.target.result; // This is the Base64 string
          base64String = base64String.split('base64,'); 

          base64String = base64String[1]; // Display the Base64 string
          // output.textContent = base64String // Display the Base64 string
          console.log(base64String); // Log the Base64 string to the console
      };

      // Read the file as a Data URL (Base64)
      reader.readAsDataURL(file);
  } else {
      console.log('No file selected');
  }
});

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {


    // let imageUrl = form.elements.namedItem('chosen-image').value;
    // let imageBase64 = await fetch(imageUrl)
    //   .then(r => r.arrayBuffer())
    //   .then(a => Base64.fromByteArray(new Uint8Array(a)));
    let imageBase64 = base64String; 
    let contents    = [
        {
            role: 'user',
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: imageBase64, } },
              { text: "As a professional math model, solve the following equation, Only answer questions related to mathematics. Do not answer any other type of question. Now Lets Solved the following Problem" }
            ]
        }
    ];

    // Call the multimodal model, and get a stream of results
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // or gemini-1.5-pro
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContentStream({ contents });

    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(''));
    }

  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};