# Expenses Adder 
A Node.js application that enables users to register, log in, and manage their expenses. Users can view their individual expenditures as well as group expenditures. The application utilizes Passport for authentication, supporting both local and OAuth2 strategies."


## Table of Contents  

- [Installation](#installation)  
- [Usage](#usage)  
- [Features](#features)  


## Installation  

1. **Clone the repository:**  

  
   git clone https://github.com/abhijeet1312/Expenses-JMD.git  
   cd Expenses-JMD
2. **Install dependencies:**
     npm install

## Usage
 1. To start this project on your local computer run the following command on your terminal after moving to the root directory:
    **npm start**
 
   2. **Environment Variables**
Before running the application, you need to set up the necessary environment variables for it to function correctly. Below are the following  variable:

- **GOOGLE_CLIENT_ID** and  **GOOGLE_CLIENT_SECRET**: This is the client ID and Secret you will receive after registering your application on the Google Cloud Platform for OAuth2. The client ID is essential for enabling Google authentication in your application. To obtain this ID, follow these steps:  

  1. Go to the [Google Cloud Console](https://console.cloud.google.com/).  
  2. Create a new project or select an existing project.  
  3. Navigate to the "APIs & Services" section and click on "Credentials."  
  4. Click on "Create Credentials" and select "OAuth 2.0 Client IDs."  
  5. Follow the setup process, specifying the authorized redirect URIs as required for your application.  
  6. Once your credentials are created, you will see your **Client ID** and **Client Secret**. Copy this value and set it in your 
     environment :
- **SESSION_SECRET**: Variable which holds the session secret of session middleware
- **JWT_SECRET**:Variable which holds the session secret of JWT
- **MONGODB-URI**:Url which connects our server to MongoDB ,we can get this using mongodb compass or atlas
- **PORT**:sample port
## API Routes  

### For **User**, the following are the routes:  
- **POST** `"/register"`: Route to register the User.  
- **POST** `"/loginUser"`: Route to login the User.  
- **POST** `"/user-expense"`: Route to get the **equal** expense of all the friends.  
- **POST** `"/user-friends-expenses"`: Route get the **exact** expense of all the friends
- **POST** `"/user-friends-percentage"`: Route get the **Percentage** expense of all the friends
- **GET** `"/userDetails"`: Route to get the **LoggedIN User Details**
- **GET** `"/OverallExpenses"`: Route to get the **Overall Expenditure of the Trip done by users along with his friends** 
- **GET** `"/UserOverallExpenses"`: Route to get the **Overall Expenditure of the user individually**
- **POST** `"/download-pdf/:id"`: Route to download the **PDF which includes all the expenditure done by user**
- **GET** `"/logoutUser"`: Route to  **log out the user**

    
   
