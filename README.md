# React + Vite
# GlobeTrekker – Travel Inspiration & Planner

## Application URL : https://globetrekker-prarana.web.app

GlobeTrekker is a sleek and modern travel planning web app that lets users explore flight options, save itineraries, and plan their trips seamlessly. It supports multiple languages and is built for speed and simplicity.

## Features

Firebase Authentication – Email - login and signup
Trip Itinerary Storage – Save and view trips via Firebase  and Firestore integration
Flight Search API – Integrated with Amadeus Travel API
Trip Cover Image Upload – Supports upload trip cover photo
Multi-language Support – Supports English & Arabic 
RTL Support – Full layout flip when language is Arabic
PDF export  - 
Deployed with Firebase Hosting

## Tech Stack

Frontend : React + Vite, React Router v6, Axios , i18next, react-i18next, jspdf, html2canvas
Auth and Data : Firebase (Auth, Firestore, Storage)
API service call :  Amadeus Travel API
Hosting : Firebase Hosting

## Supported Languages

English (default)
Arabic (RTL support)


## Setup & Installation

git clone https://github.com/Prarana/globetrekker.git

Install dependencies - Go through package.json to undeerstand what all dependencies are required
npm install

create firebase project - https://console.firebase.google.com
Enable authentication, firestore, storage and hosting.
Copy your firebase config into /src/services/firebase.js
create Amadeus project - https://developers.amadeus.com
Copy your Amadeus config into /src/services/amadeus.js

Deployment Local : 
npm run dev       
npm run build     

Deployment Firebase : 
npm run build
firebase init hosting  
firebase deploy


## Author

Made by K Prarana - https://globetrekker-prarana.web.app 

## License

This project is licensed for personal and educational use.
