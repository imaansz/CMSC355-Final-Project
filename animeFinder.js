const express = require("express");
const portNumber = 5000;
const fs = require('fs');
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Person = require("./model/Person.js");

//https://cmsc355-final-project.onrender.com/

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(bodyParser.urlencoded({extended:false}));




require("dotenv").config({
   path: path.resolve(__dirname, "credentialsDontPost/.env"),
});

const server = app.listen(portNumber, () => {
    console.log(`Web server started and running at http://localhost:${portNumber}`);
    console.log("Type stop to shutdown the server: ");
});

// This endpoint renders the main page of the application and it will display the contents of the index.ejs template file.
app.get("/", (request, response) => { 
    response.render("index");
}); 

app.get("/recommendationForm", (request, response) => { 
    response.render("recommendationForm");
}); 

app.post("/processRecommendationForm", (request, response) => {
    let genre = request.body.genre;
    fetch(`https://kitsu.io/api/edge/anime?filter[[categories]=${genre}&page[limit]=5&page[offset]=0`, {
            method: 'GET',
            headers: {
               'Accept': 'application/vnd.api+json',
               'Content-Type': 'application/vnd.api+json'
            }
         })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            processObject(data);
         })
        .catch(error => console.error(error));
        
        function processObject({data, links, meta}) { 
            console.log("** Data Retrieved\n");
            let namesList = "";
            let count = 0;
            for (entry in data){
               namesList += `<strong>Name:</strong> ${data[count].attributes.canonicalTitle} <br><strong>Descrption:</strong> ${data[count].attributes.description}<br> <strong>Average Rating:</strong> ${data[count].attributes.averageRating} <br><br>`;
               count += 1;
            }
            let variables = {
                genre : request.body?.genre ?? "NONE",
                anime: namesList
            };
            response.render("processRecommendationForm", variables);
        }
});


app.get("/userLookupForm", (request, response) => { 
    response.render("userLookupForm");
});

app.post("/userLookupPost", async (request, response) => { 
    let userName = request.body.name;
    try {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
        const people = await Person.find({ name: `${userName}` }).select('anime'); //find all the people with matching names
        let animeList = "";//`${people}`;
        for (entry in people) {
            animeList += `${entry}<br>`
        }
        let variables = {
            user: userName,
            animes: animeList
        };
        response.render("userLookupPost", variables);
    } catch (err) {
        console.error(err);
    }
});

app.get("/searchByTitle", (request, response) => { 
    response.render("searchByTitle");
});

app.post("/listedTitles", (request, response) => {
    let name = request.body.name;
    let title = request.body.title;
    let encodedTitle = title.replace(/ /g, '%20');
    let returnTitle;
    let description;
    console.log(encodedTitle);
    fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodedTitle}`, {
            method: 'GET',
            headers: {
               'Accept': 'application/vnd.api+json',
               'Content-Type': 'application/vnd.api+json'
            }
         })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            processObject(data);
         })
        .catch(error => console.error(error));
        
        function processObject({data, links, meta}) { 
            console.log("** Data Retrieved\n");
            returnTitle = data[0].attributes.canonicalTitle;
            description = data[0].attributes.description;
            let variables = {
                titles : returnTitle,
                description : description};
            addPerson(name, returnTitle);
            response.render("listedTitles", variables);
        }
        
        async function addPerson(name, title) {
            try {
                await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
                await Person.create({
                   name: name,
                   anime: title
                });
                mongoose.disconnect();
             } catch (err) {
                console.error(err);
             }
        }
});

process.stdin.on('data', (data) => {
    const input = data.toString().trim();
    if (input === 'stop') {
        console.log('Shutting down the server');
        server.close();
        process.exit(0);
    } else {
        console.log(`Invalid command: ${input}`);
    }
});