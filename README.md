# Deploy To Github

Install heroku command line tool first.

If not login,

```
heroku login
```

Push test branch besides from main/master to production,

```
git push heroku <Current_test_branch_name>:main
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

```
yarn && yarn dev
```
