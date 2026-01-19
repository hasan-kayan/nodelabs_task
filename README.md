# NodeLabs Task - Hasan KAYAN

I stuck to the provided case study explanations. You can check the tree outputs from this destination and then keep controlling the completed system. 

## Tree
├── apps
│   ├── api
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src
│   │       ├── app.js
│   │       ├── config
│   │       │   ├── cors.js
│   │       │   ├── env.js
│   │       │   ├── mongo.js
│   │       │   ├── rabbit.js
│   │       │   └── redis.js
│   │       ├── events
│   │       │   └── publisher.js
│   │       ├── index.js
│   │       ├── jobs
│   │       │   └── daily-report.js
│   │       ├── loaders
│   │       │   ├── express.js
│   │       │   ├── rabbit.js
│   │       │   └── socket.js
│   │       ├── middlewares
│   │       │   ├── auth.js
│   │       │   ├── error.js
│   │       │   ├── ratelimit.js
│   │       │   ├── rbac.js
│   │       │   └── validate.js
│   │       ├── modules
│   │       │   ├── auth
│   │       │   │   ├── controller.js
│   │       │   │   ├── events.js
│   │       │   │   ├── README.md
│   │       │   │   ├── repository.js
│   │       │   │   ├── routes.js
│   │       │   │   ├── service.js
│   │       │   │   └── validators.js
│   │       │   ├── comments
│   │       │   │   ├── controller.js
│   │       │   │   ├── repository.js
│   │       │   │   ├── routes.js
│   │       │   │   └── service.js
│   │       │   ├── projects
│   │       │   │   ├── controller.js
│   │       │   │   ├── repository.js
│   │       │   │   ├── routes.js
│   │       │   │   ├── service.js
│   │       │   │   └── validators.js
│   │       │   ├── tasks
│   │       │   │   ├── controller.js
│   │       │   │   ├── events.js
│   │       │   │   ├── repository.js
│   │       │   │   ├── routes.js
│   │       │   │   └── service.js
│   │       │   ├── teams
│   │       │   │   ├── controller.js
│   │       │   │   ├── helpers.js
│   │       │   │   ├── repository.js
│   │       │   │   ├── routes.js
│   │       │   │   ├── service.js
│   │       │   │   └── validators.js
│   │       │   └── users
│   │       │       ├── controller.js
│   │       │       ├── repository.js
│   │       │       ├── routes.js
│   │       │       └── service.js
│   │       ├── routes.js
│   │       ├── schemas
│   │       │   ├── auth.schema.js
│   │       │   ├── project.schema.js
│   │       │   └── task.schema.js
│   │       ├── sockets
│   │       │   ├── handlers
│   │       │   │   ├── notifications.js
│   │       │   │   └── tasks.js
│   │       │   ├── index.js
│   │       │   └── rooms.js
│   │       ├── tests
│   │       │   ├── auth.test.js
│   │       │   └── tasks.test.js
│   │       └── utils
│   │           ├── crypto.js
│   │           ├── jwt.js
│   │           ├── logger.js
│   │           └── pagination.js
│   ├── web
│   │   ├── Dockerfile
│   │   ├── index.html
│   │   ├── nginx.conf
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── shadcn.json
│   │   ├── src
│   │   │   ├── api
│   │   │   │   ├── auth.api.js
│   │   │   │   ├── client.js
│   │   │   │   ├── comments.api.js
│   │   │   │   ├── projects.api.js
│   │   │   │   ├── tasks.api.js
│   │   │   │   ├── teams.api.js
│   │   │   │   └── users.api.js
│   │   │   ├── app
│   │   │   │   ├── providers
│   │   │   │   │   ├── query-client.jsx
│   │   │   │   │   ├── socket-provider.jsx
│   │   │   │   │   └── theme-provider.jsx
│   │   │   │   └── routes
│   │   │   │       ├── index.jsx
│   │   │   │       └── protected.jsx
│   │   │   ├── components
│   │   │   │   ├── common
│   │   │   │   │   ├── data-table.jsx
│   │   │   │   │   ├── empty-state.jsx
│   │   │   │   │   └── page-header.jsx
│   │   │   │   └── ui
│   │   │   │       ├── button.jsx
│   │   │   │       ├── dropdown.jsx
│   │   │   │       ├── input.jsx
│   │   │   │       ├── modal.jsx
│   │   │   │       ├── table.jsx
│   │   │   │       └── toast.jsx
│   │   │   ├── config
│   │   │   │   └── env.js
│   │   │   ├── features
│   │   │   │   ├── auth
│   │   │   │   │   ├── components
│   │   │   │   │   │   └── OtpForm.jsx
│   │   │   │   │   └── pages
│   │   │   │   │       └── Login.jsx
│   │   │   │   ├── profile
│   │   │   │   │   ├── components
│   │   │   │   │   │   └── SessionsTable.jsx
│   │   │   │   │   └── pages
│   │   │   │   │       └── Profile.jsx
│   │   │   │   ├── projects
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── EditProjectModal.jsx
│   │   │   │   │   │   ├── ProjectFilters.jsx
│   │   │   │   │   │   └── ProjectTable.jsx
│   │   │   │   │   └── pages
│   │   │   │   │       ├── CreateProject.jsx
│   │   │   │   │       ├── ProjectDetail.jsx
│   │   │   │   │       └── ProjectsList.jsx
│   │   │   │   ├── tasks
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── CommentList.jsx
│   │   │   │   │   │   └── TaskTable.jsx
│   │   │   │   │   └── pages
│   │   │   │   │       └── TaskDetail.jsx
│   │   │   │   └── teams
│   │   │   │       └── pages
│   │   │   │           ├── CreateTeam.jsx
│   │   │   │           ├── TeamDetail.jsx
│   │   │   │           └── TeamsList.jsx
│   │   │   ├── hooks
│   │   │   │   ├── use-auth.js
│   │   │   │   ├── use-role.js
│   │   │   │   └── use-socket.js
│   │   │   ├── layouts
│   │   │   │   ├── app-layout.jsx
│   │   │   │   └── auth-layout.jsx
│   │   │   ├── lib
│   │   │   │   ├── cn.js
│   │   │   │   ├── shadcn-theme.js
│   │   │   │   └── socket.js
│   │   │   ├── main.jsx
│   │   │   ├── store
│   │   │   │   ├── auth.store.js
│   │   │   │   └── ui.store.js
│   │   │   └── styles
│   │   │       └── globals.css
│   │   ├── tailwind.config.js
│   │   └── vite.config.js
│   └── worker
│       ├── Dockerfile
│       ├── package-lock.json
│       ├── package.json
│       ├── src
│       │   ├── config
│       │   │   ├── env.js
│       │   │   ├── mongo.js
│       │   │   ├── rabbit.js
│       │   │   └── redis.js
│       │   ├── consumers
│       │   │   ├── analytics.consumer.js
│       │   │   ├── index.js
│       │   │   ├── mailer.consumer.js
│       │   │   └── notifier.consumer.js
│       │   ├── index.js
│       │   ├── jobs
│       │   │   ├── index.js
│       │   │   └── nightly-summary.js
│       │   ├── models
│       │   │   └── Event.js
│       │   ├── services
│       │   │   ├── mailer.js
│       │   │   ├── notify.js
│       │   │   └── report.js
│       │   ├── tests
│       │   │   └── consumers.test.js
│       │   └── utils
│       │       └── logger.js
│       └── test-email.js
├── docker-compose.yml
├── package.json
├── packages
│   ├── common
│   │   ├── package.json
│   │   └── src
│   │       ├── constants.js
│   │       ├── index.js
│   │       ├── schemas
│   │       │   ├── auth.schema.js
│   │       │   ├── index.js
│   │       │   ├── project.schema.js
│   │       │   └── task.schema.js
│   │       └── utils.js
│   └── ui
│       ├── package.json
│       └── src
│           ├── components
│           │   ├── button.jsx
│           │   ├── dropdown.jsx
│           │   ├── input.jsx
│           │   └── modal.jsx
│           ├── index.js
│           ├── lib
│           │   └── cn.js
│           └── table
│               └── data-table.jsx
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md


# Project Requirements 

- OTP-based authentication (email/phone) --> Here you can use email authentication on live demo. I created a basic system with one of my personal Gmail accounts. You will not see credentials in env files at this repository but using Gmail SMTP. 
- JWT access & refresh tokens --> OTP tokens are saved in Redis, time sensitivity management can be done from .env file. 
-  Role-based access control (Admin/Member) --> There are two types of users Admin/User, anyway task mentions RBAC so I have added this but for some extra functionality, at registration everybody is a user but anyone who has created their own team can invite other users into the team as member or admin. At this project we use RabbitMQ as message broker, in here each API process can be considered as production and workers here are the consumers, so RBAC also contains a simple RabbitMQ process to mention. 
- Real-time updates via Socket.io --> For each authentication process we use Socket.io. Also for team processes we use socket to handle delays and real-time synchronization. 




API Endpoints
Authentication

    POST /api/auth/otp/request - Request OTP
    POST /api/auth/otp/verify - Verify OTP
    POST /api/auth/refresh - Refresh token
    POST /api/auth/logout - Logout

Projects

    GET /api/projects - List projects
    GET /api/projects/:id - Get project
    POST /api/projects - Create project
    PUT /api/projects/:id - Update project
    DELETE /api/projects/:id - Delete project

Tasks

    GET /api/tasks - List tasks
    GET /api/tasks/:id - Get task
    POST /api/tasks - Create task
    PUT /api/tasks/:id - Update task
    DELETE /api/tasks/:id - Delete task

Comments

    GET /api/comments/task/:taskId - Get comments
    POST /api/comments - Create comment
    PUT /api/comments/:id - Update comment
    DELETE /api/comments/:id - Delete comment

Socket.io Events
Client → Server

    room:join - Join project room
    room:leave - Leave project room
    task:subscribe - Subscribe to task updates
    notification:subscribe - Subscribe to notifications

Server → Client

    task.created - Task created
    task.updated - Task updated
    task.assigned - Task assigned
    comment.added - Comment added

RabbitMQ Topics

    otp.requested - OTP requested event
    task.created - Task created event
    task.assigned - Task assigned event
    task.updated - Task updated event
    comment.added - Comment added event


# Quick Start 
You can run all system with single command 
$ pnpm run dev 

Or you can use directly Docker, I have added docker command into pnpm commands at package.json you can see and modify commands. 
$ pnpm docker:start 
will automatically create 6 containers. These containers are actually completely separated containers for each component 
- rabbitmq
- redis 
- mongodb 
- api
- worker 
- web 

Here web contains the web application, by using the ports you can reach the UI.
While you are trying to register or sign in, you will have an OTP authentication step. At this step, you need to check the container logs. I am logging the OTP codes in the "api" container, you need to check there. Or you can use the .env file from mail and get real emails for OTP. 

I have also activated an SMTP server with my personal accounts so I will not publish that .env file here but I will send this env file via mail. If you directly use this env file, you will be able to receive real emails. 

WARNING: The SMTP server will be closed in 3 days, so I would appreciate it if you could respond to me as soon as possible. 

