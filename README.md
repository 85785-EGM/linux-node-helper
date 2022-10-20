# config
```
  -i { input } input file path
  -o { output } output file path
  -h { host } target server host
  -p { port } target server port
  -c { command } when is 'exec', execute command without input(-i)
```

## server
```cmd
 > node-helper server -p=8400
```

## exec
```cmd
 > node-helper exec -c='cd src && ls'
 > node-helper exec -i=test/restart.sh
```

## send-file
```cmd
 > node-helper send-file -i=package.json -o=test/ttt
```

