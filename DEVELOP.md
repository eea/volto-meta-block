# volto-group-block

## Develop

Before starting make sure your development environment is properly set. See [Volto Developer Documentation](https://docs.voltocms.com/getting-started/install/)

1.  Make sure you have installed `yo`, `@plone/generator-volto` and `mrs-developer`

        npm install -g yo @plone/generator-volto mrs-developer

1.  Create new volto app

        yo @plone/volto my-dev-project --addon @eeacms/volto-group-block --skip-install
        cd my-dev-project

1.  Add the following to `mrs.developer.json`:

        {
            "volto-group-block": {
                "url": "https://github.com/eea/volto-group-block.git",
                "package": "@eeacms/volto-group-block",
                "branch": "develop",
                "path": "src"
            }
        }

1.  Install

        yarn develop
        yarn

1.  Start backend

        docker run -d --name plone -p 8080:8080 -e SITE=Plone plone

    ...wait for backend to setup and start - `Ready to handle requests`:

        docker logs -f plone

    ...you can also check http://localhost:8080/Plone

1.  Start frontend

        yarn start

1.  Go to http://localhost:3000

1.  Happy hacking!

        cd src/addons/volto-group-block/
