#### @cl-live-server/cli

Command-line interface for [@cl-live-server/live-server](https://github.com/lindeneg/cl-live-server/tree/master/packages/live-server).

#### Install

`yarn global add @cl-live-server/cli`
`npm install -g @cl-live-server/cli`

#### Usage

`cl-live-server [...OPTIONS]`

`npx @cl-live-server/cli [...OPTIONS]`

```
ARGS:
 -B --browser      [NAME]    specify browser to use (default: null)
 -F --file         [NAME]    serve file in place of missing files (default: '')
 -H --host         [HOST]    host address to bind to (default: '0.0.0.0')
 -Y --htpasswd     [PATH]    path to htpasswd file (default: null)
 -S --https        [PATH]    path to a HTTPS configuration module (default: null)
 -T --https-module [NAME]    custom HTTPS module e.g. spdy (default: null)
 -I --ignore       [PATHS]   comma-separated paths to ignore (default: [])
 -D --middleware   [PATH]    comma-separated paths to middleware files (default: [])
 -L --log-level    [LEVEL]   0 | 1 | 2 | 3 | 4 (default: 1)
 -M --mount        [ENTRIES] * mount directories onto a route (default: [])
 -O --open         [PATHS]   comma-separated paths open in browser (default: root)
 -P --port         [NUMBER]  port to use (default: 8080)
 -X --proxy        [ENTRIES] * proxy all requests for ROUTE to URL (default: [])
 -R --root         [PATH]    path to root directory (default: cwd)
 -Z --wait         [NUMBER]  wait for all changes before reloading (default: 100ms)
 -W --watch        [PATH]    path to root directory (default: root)

 * source1:target1,source2:target2

 FLAGS:
 -C --cors                   enables CORS for any origin (default: false)
 -N --no-css-inject          don't inject CSS changes (default: false)
 -A --no-browser             suppress automatic web browser launching (default: false)
 -U --spa                    translate requests from /abc to /#/abc (default: false)

 HELP:
 --help                      prints this message
```
