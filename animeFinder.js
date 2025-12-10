const express = require("express");
const portNumber = 5000;
const fs = require('fs');
const path = require("path");
const app = express();
const bodyParser = require("body-parser");

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

app.post("/processRecommendationForm", async (request, response) => {
    const variables = {
        genre: request.body?.genre ?? "NONE",
        anime: ""//ADD API HERE
    }

    response.render("processRecommendationForm", variables);
});

app.get("/searchByTitle", (request, response) => { 
    response.render("searchByTitle");
});

app.get("/userLookupForm", (request, response) => { 
    response.render("userLookupForm");
});

app.post("/searchByTitle", (request, response) => {
    let name = request.body.name;
    let title = request.body.title;
    let encodedTitle = title.replace(/ /g, '%20');
    let returnTitle;
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
        }

        let variables = {titles : returnTitle};
        response.render("listedTitles", variables);
    
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