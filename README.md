# agility-docker-manager

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.15.1.

## Build & development

Note: Change the following in bowerrc

```
{
  "directory": "app/bower_components"
}
```

Initally run

npm install
bower install

Run `grunt` for building and `grunt serve` for preview.

## Building docker image
```

docker build -t nodeapp .
```

## Running docker container
```
docker run -d  -p 9002:9002 nodeapp
```
## Testing

Running `grunt test` will run the unit tests with karma.
