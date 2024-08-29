# InvestEd
A Portfolio Management REST API which allows saving and retrieving records that
describe the contents of a financial portfolio.

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Features](#features)
4. [Contributing](#contributing)
5. [Acknowledgements](#acknowledgements)

## Installation

To get started with the materials in this repository, follow these steps:

1. Clone the repository:
git clone https://github.com/LStanaszek/neuedaTraining.git

2. Navigate to the repository directory:
cd neuedaTraining

3. Install any necessary dependencies in package.json
npm install ‘package name’

List of dependencies:
&quot;dependencies&quot;: {

&quot;axios&quot;: &quot;^1.7.5&quot;,
&quot;cors&quot;: &quot;^2.8.5&quot;,
&quot;dotenv&quot;: &quot;^16.4.5&quot;,
&quot;express&quot;: &quot;^4.19.2&quot;,
&quot;finnhub&quot;: &quot;^1.2.18&quot;,
&quot;mysql2&quot;: &quot;^3.11.0&quot;,
&quot;nodemon&quot;: &quot;^3.1.4&quot;,
&quot;sequelize&quot;: &quot;^6.37.3&quot;,
&quot;yahoo-finance2&quot;: &quot;^2.11.3&quot;

## Usage

1. Move to the src folder
cd src

2. Run the app usage command
npm start

3. Go the local port http route and access different routes

http://localhost:3000/index.html

http://localhost:3000/browse.html

Adding/withdrawings funds and search up of stock companies can be accessed within these two routes.

## Features

The scripts and routes folder include all the backend code that provides information from internal and external APIs.
The public folder includes all the front end code which uses the above information.

Testing has been done in a separate branch named IE-test pipeline branch to avoid conflicts.

## Contributing

1. Fork the repository.
2. Create a new branch (git checkout -b feature-branch).
3. Add your changes (git add .)
4. Commit your changes (git commit -m 'Add some feature').
5. Push to the branch (git push origin feature-branch).
6. Open a pull request.

## Acknowledgements

Thanks to Neueda for providing the training, materials and resources.
Thanks to all team members for their efforts in maintaining and improving this repository.