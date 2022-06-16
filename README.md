# Deploy To Heroku

Install heroku command line tool first.

If not login,

```
heroku login
```

Push test branch besides from main/master to production,

```
git push heroku <Current_test_branch_name>:main
(or git push -f heroku <Current_test_branch_name>:main)
```
Push main/master to production
```
git push heroku main
```

You can run

```
heroku logs --tail
```

to check the deploy result & log on heroku server

# Run locally

Clone this repository, then create an .env file and fill it according to .env.defaults
```
yarn && yarn dev
```
Here is ENV file configuration and default value
| KEY                            | Description                                       | Default Value              |
| ------------------------------ | ------------------------------------------------- | -------------------------- |
| PORT         | PORT of server                          | 5000 |
| MODE         | dev / prod (NOT USED ANYMORE, ignore plz)                     | prod                         |
| LINE_ACCESS_TOKEN         | Token of Line bot service                     | N/A                        |
| LINE_CHANNEL_SECRET      | Secret of Line bot service           | N/A                        |
| MONGO_URL    | MongoDB url to connect to database                      | N/A                        |
| MQTT_CHANNEL | Mqtt channel on broker used by our service                      | N/A                        |
| s3_region, s3_bucket_name, s3_access_key, s3_secret_access_key      | AWS s3 bucket config & secrets | N/A                        |
