# Your Project Title

This is a NextJS starter in Firebase Studio.

This project includes a mock authentication system with role-based access control for admin and employee users.

## How to Run Locally

To run this project locally, follow these detailed steps:

**Prerequisites:**

Before you begin, ensure you have the following installed on your system:

*   **Node.js:** This project is built with Next.js, which requires Node.js. You can download it from [https://nodejs.org/](https://nodejs.org/).
*   **npm or yarn:** These are package managers for Node.js. They are usually installed with Node.js. You can check if you have them by running `npm -v` or `yarn -v` in your terminal.
*   **Git:** You need Git to clone the project repository. If you don't have it installed, you can download it from [https://git-scm.com/](https://git-scm.com/).

**Steps:**

1.  **Clone the repository:**

    Open your terminal or command prompt and clone the project repository using the following command:
Replace `<repository_url>` with the actual URL of your project's Git repository.

2.  **Navigate to the project directory:**

    Change your current directory to the project folder:
Replace `<project_directory>` with the name of the directory created after cloning.

3.  **Install the dependencies:**

    Install the necessary project dependencies by running one of the following commands in the project directory:
or
This command reads the `package.json` file and downloads all the required libraries and frameworks.

4.  **Start the development server:**

    Launch the development server to run the application locally:
    or
    This will start the Next.js development server. You will see output in your terminal indicating that the server is starting.

5.  **Access the application:**

    Open your web browser and navigate to the following address:
http://localhost:3000
If the development server is configured to run on a different port, use that port number instead of `3000`.

**Mock Authentication:**

This project uses a mock authentication system for demonstration purposes. You can log in with predefined credentials (refer to the `src/auth/auth.ts` file for mock user details). If you log in as an admin, you will have access to the admin-specific pages, such as the user creation page (e.g., `/admin/create-user`).

## Next steps

* Explore the [Firebase Studio documentation](/docs/studio).
* [Get started with Firebase Studio](https://studio.firebase.google.com/).

Send feedback
