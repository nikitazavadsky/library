# Front-end Part

## Introduction

This is the front-end part of the project

## How to run

1. Install [pnpm](https://pnpm.io/) or [Node.js](https://nodejs.org/en/) with latest stable version. `pnpm` is preferred though: think of it as `pip` in Python, but for [Node.js](https://nodejs.org/en/) and is much more performant than `npm`, provided with [Node.js](https://nodejs.org/en/).
2. Open the terminal in the `frontend` folder or just open the `frontend` folder in your IDE of choice.
3. With pnpm installed, run `pnpm install` to install all the dependencies
   Note: you must run this command in the `frontend` folder
4. Create `.env` file in the `frontend` folder with specified variables. **Please, take a look at `.env.example` file and follow its instructions.**
   Your **root** directory will look like this:
   ```
   frontend
   ├── .env - this is the file you need to create!
   ├── .env.example
   ├── .gitignore
   ├── README.md
   ├── etc...
   backend
   ```
5. Run `pnpm run dev` to start the front-end server in development mode
6. Take a look at .env.example file and create .env file in the root of the project with specified variables.

For purposes of this project it's not necessary to run the front-end server in production mode, but if you want to do it, run `pnpm run build` and then `pnpm run start`.

## What do we have inside?

- [Next.js](https://nextjs.org/) - React meta-framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Daisy UI](https://daisyui.com/) - Tailwind CSS Plugin
- [Mantine UI](https://mantine.dev/) - UI Component library, we use it only for advanced Sliders
- [TypeScript](https://www.typescriptlang.org/) - JavaScript superset
- [ESLint](https://eslint.org/) - Linter
- [Prettier](https://prettier.io/) - Code formatter
- [PostCSS](https://postcss.org/) - CSS preprocessor
- [TanStack Query](https://tanstack.com/query/latest), aka React Query - Asynchronous state management
- [Zustand](https://zustand-demo.pmnd.rs/) - Client-side state management

If you want to learn more about the technologies used in this project, you can check the official documentation of each one.
Or... just use [create-t3-app docs](https://create.t3.gg/en/introduction), since it contains a lot of information about the technologies used in this project.

**Note: it has official Russian translation done by me. :)**
