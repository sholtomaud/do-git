# do-git

A node.js command line utility for deploying docker containers from Git repos.

# Why

You have a development machine and a production/staging server, and you want to push your dev to the server and rebuild your docker container on a Git deployment
Do-git is a cli  enables you to pick up your project details and embed them in your docker image and containers, giving each project a distinct container.

# Constraints

do-git makes some assumptions about your development folders.  Specifically that on a client app you build to a folder named 'client'. And your server backend you have  a folder named 'server'. do-git then runs against your local folders for your dev containers.


git add deploy 

#!/bin/bash
while read oldrev newrev ref
do
   if [[ $ref =~ .*/master$ ]];
   then
         echo "Master ref received. Deploying master branch to production"
         git --work-tree=/home/joel/dev/gitHooksDeploy --git-dir=/home/joel/dev/gitHooks checkout -f
   else
         echo "Ref $ref successfully received.  Doing nothing: only the master branch may be deployed on this server."
   fi
done

git remote add deploy ssh://joel@192.168.1.12:50000/home/joel/dev/gitHooks

deploy/staging

git push deploy release

need name of app to push to docker as the container name


dogit deploy release
dogit stage <feature?>
dogit init

1. init
1.1. setup name & npm details & Dockerfile
1.2. setup config.json










## Init
**Initiate do-git package**
```bash
>dogit  init --type client
```

## Server commands

**Build Server:**
```bash
>docu  build --type server --node 6 -os centos7
```
Running a server takes a node version because you may have multiple images which have different node versions. Be sure to specify which version of node you are running against.

**Run Server:**
```bash
>docu  run --type server --node 6
```

## Client commands

**Build Client:**
```bash
>docu  build --type client --node 6 -os centos7
```

As with server, running a client takes a node version because you may have multiple images which have different node versions. Be sure to specify which version of node you are running against.

**Run Client**
```bash
>docu  run --type client --node 6
```
