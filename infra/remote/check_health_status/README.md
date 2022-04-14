# Check app health status

A bash script checks health status every minutes.
The message will be sent only if the `cron.lock` file contain "ERROR".

> The env variables are set in the file `$HOME/.monitorfish`.
> 
> i.e for the integration environment:
> ```
> export MONITORFISH_LOGS_GID="1004"
> export MONITORFISH_LOGS_FOLDER="/opt/monitorfish"
> ```
> 
> Be sure to add in the `$HOME/.bashrc` or `$HOME/.bash_profile`: 
> ```
> source $HOME/.monitorfish
> ```
>to add the variables to the shell

To install it:
- Make the `check_health_status.sh` script executable (you might need to run before `chown user:group $MONITORFISH_GIT_FOLDER/infra/remote/check_health_status/check_health_status.sh`): 
```
chmod +x $MONITORFISH_GIT_FOLDER/infra/remote/check_health_status/check_health_status.sh
```
- Create the `$MONITORFISH_LOGS_FOLDER/cron.log` file with:
```
touch $MONITORFISH_LOGS_FOLDER/cron.log
```
- Create the `$MONITORFISH_LOGS_FOLDER/cron.lock` file with:
```
echo "End of update" > $MONITORFISH_LOGS_FOLDER/cron.lock
```
- Finally, add this line to the crontab file (with `crontab -e`):
```
* * * * * bash -l -c 'source $HOME/.monitorfish; $MONITORFISH_GIT_FOLDER/infra/remote/check_health_status/check_health_status.sh > $MONITORFISH_LOGS_FOLDER/cron.log 2>&1'
```
