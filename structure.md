# 📁 Project Structure

```bash
.
├── bun.lock
├── ecosystem.config.js
├── module.js
├── package.json
├── prisma
│   └── schema.prisma
├── README.md
├── src
│   ├── app
│   │   ├── builder
│   │   │   └── QueryBuilder.ts
│   │   ├── constant
│   │   │   └── index.ts
│   │   ├── DB
│   │   │   └── index.ts
│   │   ├── interfaces
│   │   │   ├── common.ts
│   │   │   └── file.ts
│   │   ├── middlewares
│   │   │   ├── auth.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   ├── optionalAuth.ts
│   │   │   ├── parseBodyData.ts
│   │   │   ├── postman.ts
│   │   │   ├── rateLimiter
│   │   │   └── validateRequest.ts
│   │   ├── modules
│   │   │   ├── auth
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.validation.ts
│   │   │   │   └── test.auth.ts
│   │   │   ├── contact
│   │   │   │   ├── contact.controller.ts
│   │   │   │   ├── contact.routes.ts
│   │   │   │   ├── contact.service.ts
│   │   │   │   └── contact.validation.ts
│   │   │   ├── countrylocations
│   │   │   │   ├── CountryLocations.controller.ts
│   │   │   │   ├── CountryLocations.routes.ts
│   │   │   │   ├── CountryLocations.service.ts
│   │   │   │   └── CountryLocations.validation.ts
│   │   │   ├── cuopon
│   │   │   │   ├── const.ts
│   │   │   │   ├── cuopon.controller.ts
│   │   │   │   ├── cuopon.routes.ts
│   │   │   │   ├── cuopon.service.ts
│   │   │   │   └── cuopon.validation.ts
│   │   │   ├── notifications
│   │   │   │   ├── notification.controller.ts
│   │   │   │   ├── notification.route.ts
│   │   │   │   └── notification.services.ts
│   │   │   ├── orderpayment
│   │   │   │   ├── orderPayment.controller.ts
│   │   │   │   ├── orderPayment.routes.ts
│   │   │   │   ├── orderPayment.service.ts
│   │   │   │   └── orderPayment.validation.ts
│   │   │   ├── product
│   │   │   │   ├── const.ts
│   │   │   │   ├── product.controller.ts
│   │   │   │   ├── product.routes.ts
│   │   │   │   ├── product.service.ts
│   │   │   │   └── product.validation.ts
│   │   │   ├── review
│   │   │   │   ├── review.controller.ts
│   │   │   │   ├── review.routes.ts
│   │   │   │   ├── review.service.ts
│   │   │   │   └── review.validation.ts
│   │   │   ├── shippingaddress
│   │   │   │   ├── shippingAddress.controller.ts
│   │   │   │   ├── shippingAddress.routes.ts
│   │   │   │   ├── shippingAddress.service.ts
│   │   │   │   └── shippingAddress.validation.ts
│   │   │   ├── uploader
│   │   │   │   ├── uploader.controller.ts
│   │   │   │   ├── uploader.routes.ts
│   │   │   │   ├── uploader.service.ts
│   │   │   │   └── uploader.validation.ts
│   │   │   └── user
│   │   │       ├── user.controller.ts
│   │   │       ├── user.route.ts
│   │   │       ├── user.services.ts
│   │   │       └── user.validation.ts
│   │   └── routes
│   │       └── index.ts
│   ├── app.ts
│   ├── bullBoard.ts
│   ├── config
│   │   ├── index.ts
│   │   └── serviceAccount.ts
│   ├── errors
│   │   ├── ApiErrors.ts
│   │   ├── handleClientError.ts
│   │   ├── handleValidationError.ts
│   │   ├── handleZodError.ts
│   │   └── parsePrismaValidationError.ts
│   ├── helpers
│   │   ├── fileUploader.ts
│   │   ├── fileUploadHelper.ts
│   │   ├── generateOnboardingUrl.ts
│   │   ├── generateOtp.ts
│   │   ├── getModelKeys.ts
│   │   ├── haversineDistance.ts
│   │   ├── jwtHelpers.ts
│   │   ├── prismaEvreyWhere.ts
│   │   ├── radis.ts
│   │   ├── sendEmail.ts
│   │   ├── stripe.ts
│   │   ├── uploadToDigitalOceanAWS.ts
│   │   └── userDelete.ts
│   ├── interfaces
│   │   ├── common.ts
│   │   ├── error.ts
│   │   ├── file.ts
│   │   ├── index.d.ts
│   │   └── paginations.ts
│   ├── queue
│   │   └── email.queue.ts
│   ├── server.ts
│   ├── shared
│   │   ├── catchAsync.ts
│   │   ├── firebase.admin.ts
│   │   ├── pagination.ts
│   │   ├── pick.ts
│   │   ├── prisma.ts
│   │   ├── searchFilter.ts
│   │   ├── sendResponse.ts
│   │   └── UploadHelper.ts
│   └── workers
│       └── email.worker.ts
├── structure.md
├── tsconfig.json
├── uploads
│   └── google.png
└── vercel.json

30 directories, 107 files

```
