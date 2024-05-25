# YelpCamp

YelpCamp is a website where users can create and review campgrounds. In order to review or create a campground, you must have an account. This project was part of Colt Steele's web dev course on udemy.

This project was created using Node.js, Express, MongoDB, and Bootstrap. Passport.js was used to handle authentication.

# Features

- Users can create, edit, and remove campgrounds
- Users can review campgrounds once, and edit or remove their review
- User profiles include more information on the user (full name, email, phone, join date), their campgrounds, and the option to edit their profile or delete their account

# Run Locally

1. Install [mongodb](https://www.mongodb.com/)
2. Create a cloudinary account to get an API key and secret code

##

        git clone https://github.com/mjay88/yelp-camp
        cd yelpcamp
        npm install

Create a .env file (or just export manually in the terminal) in the root of the project and add the following:

##

        DB_URL='<url to connect to mongodb'>
        api_key='<cloudinary key'>
        api_secret='<cloudinary secret'>
        google_api='<api key for map box'>

Run mongosh from seperate terminal and node app.js in the terminal with the project
