## Environment variables 

The env variables are set in the file `$HOME/.monitorfish`.

i.e for the integration environment:
```
export MONITORFISH_VERSION="v1.0.3"
export MONITORFISH_LOGS_GID="1004"
export MONITORFISH_LOGS_FOLDER="/opt/monitorfish"
export MONITORFISH_GIT_FOLDER="/home/mf/monitorfish
```

> Be sure to add in the `$HOME/.bashrc` or `$HOME/.bash_profile`: `source $HOME/.monitorfish` to add the variables to the shell