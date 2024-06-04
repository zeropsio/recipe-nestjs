# Zerops x Nest.js

![zerops-banner-nest](https://github.com/zeropsio/recipe-nestjs/assets/1303561/6df332f1-9564-4a73-81a8-e3ae20b0a392)

[Nest.js](https://nestjs.com/) is a scaleable, extendable Node.js framework, this recipe aims to showcase an advanced integration of Nest.js in Zerops through a simple file upload demo application.

## Deploy on Zerops 
You can either click the deploy button to deploy directly on Zerops, or manually copy the [import yaml](https://github.com/zeropsio/recipe-nestjs/blob/main/zerops-project-import.yml) to the import dialog in the Zerops app.

<a href="https://app.zerops.io/recipe/nestjs-backend">
    <img width="250" alt="Deploy on Zerops" src="https://github.com/zeropsio/recipe-laravel-jetstream/assets/1303561/21cf77dd-cded-4e41-8e76-24540a809ccc">
</a>

<br/>
<br/>

## Recipe features
- Nest.js running on **Zerops Node.js** service
- Zerops **PostgreSQL 16** service as database
- Zerops **Object Storage** (S3 compatible) service as file system
- **Idempotent** TypeORM database migrations setup
- Logs set up to use **syslog** and accessible through Zerops GUI
- Utilization of Zerops built-in **environment variables** system
- [Mailpit](https://github.com/axllent/mailpit) as **SMTP mock server**
- [Adminer](https://www.adminer.org) for **quick database management** tool

<br/>

## Production vs. development

Base of the recipe is ready for production, the difference comes down to:

- Use highly available version of the PostgreSQL database (change ***mode*** from ***NON_HA*** to ***HA*** in recipe YAML, ***db*** service section)
- Use at least two containers for Nest.js service to achieve high reliability and resilience (add ***minContainers: 2*** in recipe YAML, ***api*** service section)
- Use production-ready third-party SMTP server instead of Mailpit (change ***SMTP_**** secret variables in recipe YAML, ***api*** service section)
- Disable public access to Adminer or remove it altogether (remove service adminer from recipe YAML)

<br/>

## Changes made over the default installation

If you want to modify your own app running Nest.js to efficiently run on Zerops, these are the general steps we took:

- Add [zerops.yml](https://github.com/zeropsio/recipe-nestjs/blob/main/zerops.yml) to your repository, our example includes health checks and idempotent migrations
- Utilize Zerops environment variables management to securely pass [environment variables](https://github.com/zeropsio/recipe-nestjs/blob/main/src/config/db.config.ts#L8-L12) to your app
- Add multer, aws-sdk packages and [utilize them](https://github.com/zeropsio/recipe-nestjs/blob/main/src/file/file.service.ts#L26-L36) to upload files to S3 compatible Zerops object storage

