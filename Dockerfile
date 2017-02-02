FROM node:boron

# Create app directory
RUN mkdir -p /dist
WORKDIR /dist


# Bundle app source
ADD dist /dist/

COPY server.js /dist/
COPY package.json /dist/

# Install app dependencies
RUN npm install --production

RUN mv index* index.html

EXPOSE 9002
CMD [ "npm", "start" ]