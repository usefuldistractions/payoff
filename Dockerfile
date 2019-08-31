# Compilation docker image
FROM node:carbon

# Allows babel transpiling
RUN yarn add --dev grunt-babel @babel/core @babel/preset-env

# Create and target the workspace where the app is injected
WORKDIR /app

# Only copy the installation config at first
COPY ./app/package.json /app/package.json

# Run the npm installer
RUN npm install

# Copy over the rest of the application
# NOTE: intentionally post npm installation, for better build caching
COPY ./app/ /app/

# Run the build tasks
ENTRYPOINT ["npm", "run", "build"]