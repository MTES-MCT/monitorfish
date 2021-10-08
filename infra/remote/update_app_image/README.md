# Update app image

A bash script checks for new bugfixes images (i.e v1.0.X) every minutes.
The script will run only if the `cron.lock` file contain "End of update".

> The env variables are set in the file `$HOME/.monitorfish`.
> 
> i.e for the integration environment:
> ```
> export MONITORFISH_VERSION="v1.0.3"
> export MONITORFISH_LOGS_GID="1004"
> export MONITORFISH_LOGS_FOLDER="/opt/monitorfish"
> export MONITORFISH_GIT_FOLDER="/home/mf/monitorfish
> ```
> 
> Be sure to add in the `$HOME/.bashrc` or `$HOME/.bash_profile`: 
> ```
> source $HOME/.monitorfish
> ```
>to add the variables to the shell

To install it:
- Make the `update_app_image.sh` script executable: 
```
chmod +x $MONITORFISH_GIT_FOLDER/infra/remote/update_app_image/update_app_image.sh
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
* * * * * bash -l -c 'source $HOME/.monitorfish; $MONITORFISH_GIT_FOLDER/infra/remote/update_app_image/update_app_image.sh > $MONITORFISH_LOGS_FOLDER/cron.log 2>&1'
```