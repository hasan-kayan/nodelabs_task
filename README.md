# NodeLabs Task - Hasan KAYAN

I get stick to the provided case-study explanations. You can check the tree outputs from this destination and than keep controlling the completed system. 

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

- OTP-based authentication (email/phone) --> Here you can use email authentications on live demo I created a basic system with one of my personal gmail accounts. You will not see credentails in env files at this repostory but using Gmail SMTP. 
- JWT access & refresh tokens --> OTP tokens are saved in Redis, time sensitivity managements can be done from .env file. 
-  Role-based access control (Admin/Member) --> There are two types of users Admin/User, anyway task mentions RBAC so I have added this but for some extra functionality, at registiration everybody is a user but anyone who has created their own team can invite other users into the team as member or admin. At this project we use RabiMQ as message brokker, in here each API process can be considered as production and workers here are the consumers, so rbac is also contains a simple RabitMQ process to mention. 
- Real-time updates via Socket.io --> For each authentication process we use socket.io. Also for team proceses we use socket to handle delays and real-time syncronazation. 