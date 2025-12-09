const express = require("express");
const portNumber = 5000;
const fs = require('fs');
const path = require("path");
const app = express();
const bodyParser = require("body-parser");

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
    }

    response.render("processApplication", variables);
});

app.get("/searchByTitle", (request, response) => { 
    response.render("searchByTitle");
});

app.get("/userLookupForm", (request, response) => { 
    response.render("userLookupForm");
});

app.post("seachByTitle", (request, response) => {
    let name = request.body.name;
    let title = request.body.title;
    

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