# Gramet 🚀

Gramet is a NestJS-based backend for a scalable e-commerce solution. It includes modules for user management, authentication (with JWT and refresh tokens), shopping carts, order processing, Stripe payment integration, mailing for email confirmations and password resets, and more.

## Features ✨

- **Authentication & Authorization** 🔐
  Uses JWT-based authentication with refresh support ([`src/auth/auth.service.ts`](src/auth/auth.service.ts), [`src/auth/strategies/jwt.strategy.ts`](src/auth/strategies/jwt.strategy.ts), [`src/auth/guards/jwt-auth.guard.ts`](src/auth/guards/jwt-auth.guard.ts)).

- **User Management** 👥
  Create and manage users with email confirmation ([`src/users/users.service.ts`](src/users/users.service.ts)).

- **Shopping Cart** 🛒
  Add, remove, and retrieve cart items ([`src/cart/cart.service.ts`](src/cart/cart.service.ts), [`src/cart/cart.controller.ts`](src/cart/cart.controller.ts)).

- **Order Processing & Stripe Integration** 💳
  Create orders, process payments and decrease product stock upon successful checkout ([`src/orders/orders.service.ts`](src/orders/orders.service.ts), [`src/transactions/stripe.service.ts`](src/transactions/stripe.service.ts)).

- **Product Catalog** 📦
  Manage products with multiple images, colors, and materials ([`src/products/products.controller.ts`](src/products/products.controller.ts), [`src/products/products.service.ts`](src/products/products.service.ts)).

- **Admin Product Management** 🛠️
  Admins can add, update, hide and delete products ([`src/admin/products/admin-products.controller.ts`](src/admin/products/admin-products.controller.ts), [`src/admin/products/admin-products.service.ts`](src/admin/products/admin-products.service.ts)).

- **Mailing Service** 📧
  Send signup confirmation and password reset emails using Handlebars templates ([`src/mail/mail.service.ts`](src/mail/mail.service.ts), templates in [templates/confirmation.hbs](templates/confirmation.hbs) and [templates/reset-password.hbs](templates/reset-password.hbs)).

- **Robust Validation & Error Handling** 🛡️
  Uses NestJS pipes and custom exception filters for mongoose validation ([`src/common/filters/mongoose-validation-exception.filter.ts`](src/common/filters/mongoose-validation-exception.filter.ts)).

## Prerequisites 📋

- [Node.js](https://nodejs.org/) v14 or later
- [MongoDB](https://mongodb.com) running locally or on a cloud platform
- A Stripe account with a valid secret key
- [Client](https://github.com/GramosTV/gramet-client)

## Installation 🛠️

1. Clone the repository and navigate to the project folder:

   ```sh
   git clone <repository-url>
   cd gramet
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create a .env file (see `.env`) with the required environment variables:
   - `DB_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `JWT_MAIL_SECRET`
   - `JWT_PASSWORD_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `CLIENT_URL`
   - `FIXED_DELIVERY_COST`

## Running the Project ▶️

Start the application in development mode:

```sh
npm run start:dev
```

For production build and run:

```sh
npm run build
npm run start:prod
```

## Testing 🧪

- **Unit Tests:**
  Run unit tests with:

  ```sh
  npm run test
  ```

- **End-to-End Tests:**
  Run e2e tests with:

  ```sh
  npm run test:e2e
  ```

- **Test Coverage:**
  Check the test coverage with:
  ```sh
  npm run test:cov
  ```

See app.e2e-spec.ts and jest-e2e.json for test configuration.

## Deployment 🚀

Before deploying to production:

- Ensure environment variables are set correctly.
- For production optimizations, check the [NestJS deployment documentation](https://docs.nestjs.com/deployment).

To deploy using [Mau](https://mau.nestjs.com):

```sh
npm install -g mau
mau deploy
```

## Additional Resources 📚

- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Devtools](https://devtools.nestjs.com)
- Gramet Mailer & Templates

## License 📄

Gramet is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
