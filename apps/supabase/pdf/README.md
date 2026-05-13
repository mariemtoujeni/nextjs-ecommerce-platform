# Déployer une nouvelle version

En dev
```sh
# Dans le dossier supabase/pdf
$ docker build . -t registry.gitlab.com/squaad.io/nataquashop:latest
$ docker push registry.gitlab.com/squaad.io/nataquashop:latest
```

Sur le server Nataquashop
```sh
$ cd supabase/docker
$ docker login registry.gitlab.com
$ docker pull registry.gitlab.com/squaad.io/nataquashop:latest
$ docker compose up -d 
$ docker logout
```