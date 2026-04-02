## The Challenge

Your challenge is to build a scheduling app that can map workers to a schedule. You can model your app around any kind of business with a large team like a hotel, a restaurant, a theme park, etc. The team members will have different roles and skills which you're free to define, and you will use that info to get them onto the calendar.

Your app should support the following functionality:

- defining a schedule (e.g. on weekends we need 3 cooks, 2 dishwashers, 8 waitstaff, 1 manager, etc.)
- auto-filling a schedule according to its rules and team availability
- the ability to swap out any people and auto-fill the gaps
- **The AI Twist:** instead of buttons/controls for the actions above, provide a chat box where we can just tell the app what to do!

## Requirements

- **The Stack:** you must use TypeScript across the board i.e. React in front, Express or similar in back.
- **The Data:** your app should have persistence; SQLite is totally fine or any relational DB you prefer, just keep it local and simple.
- **The UI:** you must create a UI for viewing the schedule/calendar so we can see the results of the commands.
- **The Process:** you must create your project in Github so we can see how your work progresses.
